//go:build integration

package repository_test

import (
	"context"
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	gpostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/prefeiturario/painel-social/internal/database"
)

var sharedDB *gorm.DB

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

	migSQL, err := os.ReadFile("../database/migrations/001_init.sql")
	if err != nil {
		log.Fatalf("read migration: %v", err)
	}
	if err = sharedDB.Exec(string(migSQL)).Error; err != nil {
		log.Fatalf("run migration: %v", err)
	}

	if err = database.SeedIfEmpty(sharedDB, "../database/data/seed.json"); err != nil {
		log.Fatalf("seed: %v", err)
	}

	os.Exit(m.Run())
}

func newTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	return sharedDB
}

func newTestTx(t *testing.T) *gorm.DB {
	t.Helper()
	tx := sharedDB.Begin()
	require.NoError(t, tx.Error)
	t.Cleanup(func() { tx.Rollback() })
	return tx
}
