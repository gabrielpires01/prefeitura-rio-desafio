package database

import (
	"database/sql"
	"embed"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

//go:embed migrations/001_init.sql
var migrations embed.FS

func Connect(dsn string) (*gorm.DB, error) {
	sqlDB, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("abrir banco: %w", err)
	}
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	db, err := gorm.Open(postgres.New(postgres.Config{Conn: sqlDB}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("inicializar ORM: %w", err)
	}
	return db, nil
}

func Migrate(db *gorm.DB) error {
	data, err := migrations.ReadFile("migrations/001_init.sql")
	if err != nil {
		return fmt.Errorf("ler migração: %w", err)
	}
	return db.Exec(string(data)).Error
}
