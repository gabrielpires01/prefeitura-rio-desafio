//go:build integration

package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	gpostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/prefeiturario/painel-social/internal/cache"
	"github.com/prefeiturario/painel-social/internal/database"
	"github.com/prefeiturario/painel-social/internal/handler"
	"github.com/prefeiturario/painel-social/internal/middleware"
	"github.com/prefeiturario/painel-social/internal/repository"
	"github.com/prefeiturario/painel-social/internal/service"
)

const testJWTSecret = "integration-test-secret"

var sharedDB *gorm.DB

// TestMain starts a single PostgreSQL container shared across all handler integration tests.
func TestMain(m *testing.M) {
	ctx := context.Background()

	pgC, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: testcontainers.ContainerRequest{
			Image:        "postgres:16-alpine",
			ExposedPorts: []string{"5432/tcp"},
			Env: map[string]string{
				"POSTGRES_DB":       "testdb",
				"POSTGRES_USER":     "test",
				"POSTGRES_PASSWORD": "test",
			},
			WaitingFor: wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2),
		},
		Started: true,
	})
	if err != nil {
		log.Fatalf("start postgres container: %v", err)
	}
	defer func() { _ = pgC.Terminate(ctx) }()

	host, err := pgC.Host(ctx)
	if err != nil {
		log.Fatalf("container host: %v", err)
	}
	port, err := pgC.MappedPort(ctx, "5432")
	if err != nil {
		log.Fatalf("container port: %v", err)
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=test password=test dbname=testdb sslmode=disable",
		host, port.Port(),
	)
	sharedDB, err = gorm.Open(gpostgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("open gorm: %v", err)
	}

	if err = database.Migrate(sharedDB); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	if err = database.SeedIfEmpty(sharedDB, "../database/data/seed.json"); err != nil {
		log.Fatalf("seed: %v", err)
	}

	userRepo := repository.NewUserRepository(sharedDB)
	userSvc := service.NewUserService(userRepo)
	if _, err = userSvc.CreateUser("Técnico", "tecnico@prefeitura.rio", "painel@2024"); err != nil {
		log.Printf("aviso: seed de usuário de teste: %v", err)
	}

	os.Exit(m.Run())
}

func newIntegrationRouter(t *testing.T) *gin.Engine {
	t.Helper()

	userRepo := repository.NewUserRepository(sharedDB)
	authSvc := service.NewAuthService(testJWTSecret, userRepo)
	childRepo := repository.NewChildRepository(sharedDB)
	childSvc := service.NewChildService(childRepo, &cache.NoopCache{})

	authHandler := handler.NewAuthHandler(authSvc)
	childHandler := handler.NewChildHandler(childSvc)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/auth/token", authHandler.Login)

	authorized := r.Group("/")
	authorized.Use(middleware.Auth(authSvc))
	authorized.GET("/summary", childHandler.Summary)
	authorized.GET("/children", childHandler.List)
	authorized.GET("/children/:id", childHandler.GetByID)
	authorized.PATCH("/children/:id/review", childHandler.Review)

	return r
}

func loginAndGetToken(t *testing.T, r *gin.Engine) string {
	t.Helper()
	body := `{"email":"tecnico@prefeitura.rio","password":"painel@2024"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	require.Equal(t, http.StatusOK, w.Code, "login should succeed")

	var resp struct {
		Token string `json:"token"`
	}
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	require.NotEmpty(t, resp.Token)
	return resp.Token
}

func TestProtectedRoute_Review_NoToken(t *testing.T) {
	r := newIntegrationRouter(t)

	req := httptest.NewRequest(http.MethodPatch, "/children/c001/review", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var body map[string]string
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "token ausente", body["error"])
}

func TestProtectedRoute_Review_InvalidToken(t *testing.T) {
	r := newIntegrationRouter(t)

	req := httptest.NewRequest(http.MethodPatch, "/children/c001/review", nil)
	req.Header.Set("Authorization", "Bearer this.is.not.valid")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var body map[string]string
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "token inválido", body["error"])
}

func TestProtectedRoute_Review_ValidToken(t *testing.T) {
	r := newIntegrationRouter(t)
	token := loginAndGetToken(t, r)

	req := httptest.NewRequest(http.MethodPatch, "/children/c001/review", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]string
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "revisado", body["message"])
}

func TestProtectedRoute_Children_NoToken(t *testing.T) {
	r := newIntegrationRouter(t)

	req := httptest.NewRequest(http.MethodGet, "/children", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestProtectedRoute_ChildByID_NoToken(t *testing.T) {
	r := newIntegrationRouter(t)

	req := httptest.NewRequest(http.MethodGet, "/children/c001", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestProtectedRoute_Summary_NoToken(t *testing.T) {
	r := newIntegrationRouter(t)

	req := httptest.NewRequest(http.MethodGet, "/summary", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestProtectedRoute_FullFlow_LoginThenAccess(t *testing.T) {
	r := newIntegrationRouter(t)
	token := loginAndGetToken(t, r)

	tests := []struct {
		method string
		path   string
	}{
		{http.MethodGet, "/summary"},
		{http.MethodGet, "/children"},
		{http.MethodGet, "/children/c001"},
	}

	for _, tc := range tests {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code, "expected 200 for %s %s", tc.method, tc.path)
	}
}
