package middleware_test

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/middleware"
	"github.com/prefeiturario/painel-social/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

type mockAuthMiddleware struct {
	validateFn func(string) (jwt.MapClaims, error)
}

func (m *mockAuthMiddleware) Login(_, _ string) (string, error) { return "", nil }
func (m *mockAuthMiddleware) ValidateToken(t string) (jwt.MapClaims, error) {
	return m.validateFn(t)
}

func middlewareRouter(svc service.AuthServicer) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(middleware.Auth(svc))
	r.GET("/protected", func(c *gin.Context) {
		username, _ := c.Get("username")
		c.JSON(http.StatusOK, gin.H{"username": username})
	})
	return r
}

func protectedReq(r *gin.Engine, authHeader string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// --- Missing / malformed header ---

func TestAuth_NoHeader_Returns401(t *testing.T) {
	r := middlewareRouter(&mockAuthMiddleware{})
	w := protectedReq(r, "")
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuth_NoBearerPrefix_Returns401(t *testing.T) {
	r := middlewareRouter(&mockAuthMiddleware{})
	w := protectedReq(r, "Token some-value")
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuth_BasicScheme_Returns401(t *testing.T) {
	r := middlewareRouter(&mockAuthMiddleware{})
	w := protectedReq(r, "Basic dXNlcjpwYXNz")
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuth_BearerWithoutToken_Returns401(t *testing.T) {
	mock := &mockAuthMiddleware{validateFn: func(t string) (jwt.MapClaims, error) {
		return nil, errors.New("empty")
	}}
	w := protectedReq(middlewareRouter(mock), "Bearer ")
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// --- Invalid token ---

func TestAuth_InvalidToken_Returns401(t *testing.T) {
	mock := &mockAuthMiddleware{validateFn: func(t string) (jwt.MapClaims, error) {
		return nil, errors.New("token inválido")
	}}
	w := protectedReq(middlewareRouter(mock), "Bearer bad.token.value")
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuth_InvalidToken_ResponseHasErrorKey(t *testing.T) {
	mock := &mockAuthMiddleware{validateFn: func(t string) (jwt.MapClaims, error) {
		return nil, errors.New("token inválido")
	}}
	w := protectedReq(middlewareRouter(mock), "Bearer bad.token.value")
	var resp map[string]string
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.NotEmpty(t, resp["error"])
}

// --- Valid token ---

func TestAuth_ValidToken_Returns200(t *testing.T) {
	mock := &mockAuthMiddleware{validateFn: func(t string) (jwt.MapClaims, error) {
		return jwt.MapClaims{"preferred_username": "user@prefeitura.rio"}, nil
	}}
	w := protectedReq(middlewareRouter(mock), "Bearer valid.token")
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuth_ValidToken_SetsUsernameInContext(t *testing.T) {
	mock := &mockAuthMiddleware{validateFn: func(t string) (jwt.MapClaims, error) {
		return jwt.MapClaims{"preferred_username": "user@prefeitura.rio"}, nil
	}}
	w := protectedReq(middlewareRouter(mock), "Bearer valid.token")
	var resp map[string]any
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, "user@prefeitura.rio", resp["username"])
}

func TestAuth_ValidToken_StripsBearerPrefix(t *testing.T) {
	var gotToken string
	mock := &mockAuthMiddleware{validateFn: func(t string) (jwt.MapClaims, error) {
		gotToken = t
		return jwt.MapClaims{"preferred_username": "u"}, nil
	}}
	protectedReq(middlewareRouter(mock), "Bearer my-raw-token")
	assert.Equal(t, "my-raw-token", gotToken)
}

// --- Real AuthService integration ---

type stubUserRepo struct{ user *domain.User }

func (s *stubUserRepo) FindByEmail(email string) (*domain.User, error) {
	if s.user != nil && s.user.Email == email {
		return s.user, nil
	}
	return nil, errors.New("not found")
}
func (s *stubUserRepo) Create(u *domain.User) error            { return nil }
func (s *stubUserRepo) List() ([]domain.User, error)           { return nil, nil }
func (s *stubUserRepo) GetByID(id string) (*domain.User, error) { return nil, errors.New("not found") }
func (s *stubUserRepo) Update(u *domain.User) error            { return nil }
func (s *stubUserRepo) Delete(id string) error                 { return nil }

func newRealAuthSvc(secret string) *service.AuthService {
	hash, _ := bcrypt.GenerateFromPassword([]byte("painel@2024"), bcrypt.MinCost)
	return service.NewAuthService(secret, &stubUserRepo{user: &domain.User{
		ID:           "stub-id",
		Email:        "tecnico@prefeitura.rio",
		PasswordHash: string(hash),
	}})
}

func TestAuth_RealService_ValidTokenFlows(t *testing.T) {
	authSvc := newRealAuthSvc("integration-secret")
	tokenStr, err := authSvc.Login("tecnico@prefeitura.rio", "painel@2024")
	require.NoError(t, err)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(middleware.Auth(authSvc))
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	w := protectedReq(r, "Bearer "+tokenStr)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuth_RealService_InvalidToken_Rejected(t *testing.T) {
	authSvc := newRealAuthSvc("integration-secret")

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(middleware.Auth(authSvc))
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	w := protectedReq(r, "Bearer garbage.token.value")
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
