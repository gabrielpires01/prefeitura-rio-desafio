package handler_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/prefeiturario/painel-social/internal/handler"
	"github.com/prefeiturario/painel-social/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockAuthSvc struct {
	loginFn    func(email, password string) (string, error)
	validateFn func(tokenStr string) (jwt.MapClaims, error)
}

func (m *mockAuthSvc) Login(email, password string) (string, error) {
	return m.loginFn(email, password)
}
func (m *mockAuthSvc) ValidateToken(t string) (jwt.MapClaims, error) {
	return m.validateFn(t)
}

func authRouter(svc service.AuthServicer) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := handler.NewAuthHandler(svc)
	r.POST("/auth/token", h.Login)
	return r
}

func jsonBody(t *testing.T, v any) *bytes.Buffer {
	t.Helper()
	b, err := json.Marshal(v)
	require.NoError(t, err)
	return bytes.NewBuffer(b)
}

func postLogin(t *testing.T, r *gin.Engine, body any) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/auth/token", jsonBody(t, body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// --- Success path ---

func TestAuthHandler_Login_Success(t *testing.T) {
	mock := &mockAuthSvc{loginFn: func(_, _ string) (string, error) { return "tok.en.value", nil }}
	w := postLogin(t, authRouter(mock), map[string]string{"email": "tecnico@prefeitura.rio", "password": "painel@2024"})

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]string
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, "tok.en.value", resp["token"])
}

// --- Validation failures (400) ---

func TestAuthHandler_Login_MissingBody(t *testing.T) {
	r := authRouter(&mockAuthSvc{})
	req := httptest.NewRequest(http.MethodPost, "/auth/token", nil)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Login_MissingEmail(t *testing.T) {
	w := postLogin(t, authRouter(&mockAuthSvc{}), map[string]string{"password": "painel@2024"})
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Login_InvalidEmailFormat(t *testing.T) {
	w := postLogin(t, authRouter(&mockAuthSvc{}), map[string]string{"email": "not-an-email", "password": "painel@2024"})
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Login_MissingPassword(t *testing.T) {
	w := postLogin(t, authRouter(&mockAuthSvc{}), map[string]string{"email": "user@example.com"})
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Login_EmptyFields(t *testing.T) {
	w := postLogin(t, authRouter(&mockAuthSvc{}), map[string]string{"email": "", "password": ""})
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// --- Credential failures (401) ---

func TestAuthHandler_Login_InvalidCredentials(t *testing.T) {
	mock := &mockAuthSvc{loginFn: func(_, _ string) (string, error) {
		return "", service.ErrInvalidCredentials
	}}
	w := postLogin(t, authRouter(mock), map[string]string{"email": "wrong@example.com", "password": "wrong"})
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthHandler_Login_ServiceError_Returns401(t *testing.T) {
	// Any error from service maps to 401 (handler does not distinguish internal errors)
	mock := &mockAuthSvc{loginFn: func(_, _ string) (string, error) {
		return "", errors.New("unexpected internal error")
	}}
	w := postLogin(t, authRouter(mock), map[string]string{"email": "user@example.com", "password": "pw"})
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthHandler_Login_ResponseHasErrorKey_On401(t *testing.T) {
	mock := &mockAuthSvc{loginFn: func(_, _ string) (string, error) {
		return "", service.ErrInvalidCredentials
	}}
	w := postLogin(t, authRouter(mock), map[string]string{"email": "user@example.com", "password": "pw"})
	var resp map[string]string
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.NotEmpty(t, resp["error"])
}
