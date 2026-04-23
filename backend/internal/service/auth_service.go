package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidCredentials = errors.New("credenciais inválidas")
)

type AuthService struct {
	secret string
}

func NewAuthService(secret string) *AuthService {
	return &AuthService{secret: secret}
}

func (s *AuthService) Login(email, password string) (string, error) {
	if email != "tecnico@prefeitura.rio" || password != "painel@2024" {
		return "", ErrInvalidCredentials
	}

	claims := jwt.MapClaims{
		"preferred_username": email,
		"exp":                time.Now().Add(8 * time.Hour).Unix(),
		"iat":                time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secret))
}

func (s *AuthService) ValidateToken(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de assinatura inesperado")
		}
		return []byte(s.secret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("token inválido")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("claims inválidos")
	}
	return claims, nil
}
