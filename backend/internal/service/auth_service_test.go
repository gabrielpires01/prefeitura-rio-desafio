package service_test

import (
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

type mockUserRepo struct {
	user *domain.User
	err  error
}

func (m *mockUserRepo) FindByEmail(email string) (*domain.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	if m.user != nil && m.user.Email == email {
		return m.user, nil
	}
	return nil, errors.New("not found")
}
func (m *mockUserRepo) Create(u *domain.User) error        { return nil }
func (m *mockUserRepo) List() ([]domain.User, error)       { return nil, nil }
func (m *mockUserRepo) GetByID(id string) (*domain.User, error) {
	if m.user != nil && m.user.ID == id {
		return m.user, nil
	}
	return nil, errors.New("not found")
}
func (m *mockUserRepo) Update(u *domain.User) error  { return nil }
func (m *mockUserRepo) Delete(id string) error       { return nil }

func hashPw(pw string) string {
	h, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.MinCost)
	return string(h)
}

func testUser() *domain.User {
	return &domain.User{
		ID:           "test-id",
		FullName:     "Técnico",
		Email:        "tecnico@prefeitura.rio",
		PasswordHash: hashPw("painel@2024"),
	}
}

func newAuthSvc() *service.AuthService {
	return service.NewAuthService("test-secret", &mockUserRepo{user: testUser()})
}

// --- Login ---

func TestAuthService_Login_ValidCredentials(t *testing.T) {
	token, err := newAuthSvc().Login("tecnico@prefeitura.rio", "painel@2024")
	require.NoError(t, err)
	assert.NotEmpty(t, token)
}

func TestAuthService_Login_WrongEmail(t *testing.T) {
	_, err := newAuthSvc().Login("wrong@example.com", "painel@2024")
	assert.ErrorIs(t, err, service.ErrInvalidCredentials)
}

func TestAuthService_Login_WrongPassword(t *testing.T) {
	_, err := newAuthSvc().Login("tecnico@prefeitura.rio", "wrong-pass")
	assert.ErrorIs(t, err, service.ErrInvalidCredentials)
}

func TestAuthService_Login_BothWrong(t *testing.T) {
	_, err := newAuthSvc().Login("x@x.com", "nope")
	assert.ErrorIs(t, err, service.ErrInvalidCredentials)
}

func TestAuthService_Login_EmptyCredentials(t *testing.T) {
	_, err := newAuthSvc().Login("", "")
	assert.ErrorIs(t, err, service.ErrInvalidCredentials)
}

func TestAuthService_Login_TokenContainsPreferredUsername(t *testing.T) {
	svc := newAuthSvc()
	tokenStr, _ := svc.Login("tecnico@prefeitura.rio", "painel@2024")
	claims, err := svc.ValidateToken(tokenStr)
	require.NoError(t, err)
	assert.Equal(t, "tecnico@prefeitura.rio", claims["preferred_username"])
}

func TestAuthService_Login_TokenIsNotSignedWithDifferentSecret(t *testing.T) {
	tokenStr, _ := newAuthSvc().Login("tecnico@prefeitura.rio", "painel@2024")

	otherSvc := service.NewAuthService("different-secret", &mockUserRepo{user: testUser()})
	_, err := otherSvc.ValidateToken(tokenStr)
	assert.Error(t, err)
}

// --- ValidateToken ---

func TestAuthService_ValidateToken_ValidToken(t *testing.T) {
	svc := newAuthSvc()
	tokenStr, _ := svc.Login("tecnico@prefeitura.rio", "painel@2024")
	claims, err := svc.ValidateToken(tokenStr)
	require.NoError(t, err)
	assert.NotNil(t, claims)
}

func TestAuthService_ValidateToken_ExpiredToken(t *testing.T) {
	svc := newAuthSvc()
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"preferred_username": "user@test.com",
		"exp":                time.Now().Add(-1 * time.Hour).Unix(),
	})
	tokenStr, _ := tok.SignedString([]byte("test-secret"))
	_, err := svc.ValidateToken(tokenStr)
	assert.Error(t, err)
}

func TestAuthService_ValidateToken_WrongSigningSecret(t *testing.T) {
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"preferred_username": "user@test.com",
		"exp":                time.Now().Add(1 * time.Hour).Unix(),
	})
	tokenStr, _ := tok.SignedString([]byte("attacker-secret"))
	_, err := newAuthSvc().ValidateToken(tokenStr)
	assert.Error(t, err)
}

func TestAuthService_ValidateToken_Malformed(t *testing.T) {
	_, err := newAuthSvc().ValidateToken("not.a.valid.jwt")
	assert.Error(t, err)
}

func TestAuthService_ValidateToken_Empty(t *testing.T) {
	_, err := newAuthSvc().ValidateToken("")
	assert.Error(t, err)
}

func TestAuthService_ValidateToken_AlgNone(t *testing.T) {
	tokenStr := "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZXN0In0."
	_, err := newAuthSvc().ValidateToken(tokenStr)
	assert.Error(t, err)
}

func TestAuthService_ValidateToken_TamperedPayload(t *testing.T) {
	svc := newAuthSvc()
	tokenStr, _ := svc.Login("tecnico@prefeitura.rio", "painel@2024")

	parts := splitJWT(tokenStr)
	parts[1] = "eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbkBldmlsLmNvbSJ9"
	tampered := parts[0] + "." + parts[1] + "." + parts[2]

	_, err := svc.ValidateToken(tampered)
	assert.Error(t, err)
}

func splitJWT(token string) []string {
	var parts []string
	start := 0
	for i, ch := range token {
		if ch == '.' {
			parts = append(parts, token[start:i])
			start = i + 1
		}
	}
	parts = append(parts, token[start:])
	return parts
}
