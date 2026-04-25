package config_test

import (
	"os"
	"testing"

	"github.com/prefeiturario/painel-social/internal/config"
	"github.com/stretchr/testify/assert"
)

func clearConfigEnv(t *testing.T) {
	t.Helper()
	for _, key := range []string{"DATABASE_URL", "JWT_SECRET", "PORT", "SEED_FILE", "ALLOWED_ORIGINS"} {
		os.Unsetenv(key)
	}
}

func TestLoad_Defaults(t *testing.T) {
	clearConfigEnv(t)

	cfg := config.Load()

	assert.Equal(t, "dev-secret-key", cfg.JWTSecret)
	assert.Equal(t, "8080", cfg.Port)
	assert.Equal(t, "data/seed.json", cfg.SeedFile)
	assert.Equal(t, []string{"http://localhost:3000"}, cfg.AllowedOrigins)
}

func TestLoad_DatabaseURLFromEnv(t *testing.T) {
	clearConfigEnv(t)
	t.Setenv("DATABASE_URL", "postgres://user:pass@host:5432/db")

	cfg := config.Load()

	assert.Equal(t, "postgres://user:pass@host:5432/db", cfg.DatabaseURL)
}

func TestLoad_CustomPort(t *testing.T) {
	clearConfigEnv(t)
	t.Setenv("PORT", "9090")

	cfg := config.Load()

	assert.Equal(t, "9090", cfg.Port)
}

func TestLoad_CustomJWTSecret(t *testing.T) {
	clearConfigEnv(t)
	t.Setenv("JWT_SECRET", "super-secret-production-key")

	cfg := config.Load()

	assert.Equal(t, "super-secret-production-key", cfg.JWTSecret)
}

func TestLoad_CustomSeedFile(t *testing.T) {
	clearConfigEnv(t)
	t.Setenv("SEED_FILE", "/app/data/seed.json")

	cfg := config.Load()

	assert.Equal(t, "/app/data/seed.json", cfg.SeedFile)
}

func TestLoad_MultipleAllowedOrigins(t *testing.T) {
	clearConfigEnv(t)
	t.Setenv("ALLOWED_ORIGINS", "https://app.example.com,https://staging.example.com")

	cfg := config.Load()

	assert.Equal(t, []string{"https://app.example.com", "https://staging.example.com"}, cfg.AllowedOrigins)
}

func TestLoad_AllowedOriginsTrimsSpaces(t *testing.T) {
	clearConfigEnv(t)
	t.Setenv("ALLOWED_ORIGINS", "https://app.example.com , https://staging.example.com")

	cfg := config.Load()

	assert.Equal(t, []string{"https://app.example.com", "https://staging.example.com"}, cfg.AllowedOrigins)
}

func TestLoad_SingleAllowedOrigin(t *testing.T) {
	clearConfigEnv(t)
	t.Setenv("ALLOWED_ORIGINS", "https://prod.example.com")

	cfg := config.Load()

	assert.Equal(t, []string{"https://prod.example.com"}, cfg.AllowedOrigins)
}
