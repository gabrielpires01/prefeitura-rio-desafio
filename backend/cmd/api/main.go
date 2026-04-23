package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prefeiturario/painel-social/internal/config"
	"github.com/prefeiturario/painel-social/internal/database"
	"github.com/prefeiturario/painel-social/internal/handler"
	"github.com/prefeiturario/painel-social/internal/middleware"
	"github.com/prefeiturario/painel-social/internal/repository"
	"github.com/prefeiturario/painel-social/internal/service"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("conectar ao banco: %v", err)
	}
	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	if err := database.Migrate(db); err != nil {
		log.Fatalf("migração: %v", err)
	}

	if err := database.SeedIfEmpty(db, cfg.SeedFile); err != nil {
		log.Printf("aviso: seed falhou: %v", err)
	}

	authSvc := service.NewAuthService(cfg.JWTSecret)
	childRepo := repository.NewChildRepository(db)
	childSvc := service.NewChildService(childRepo)

	authHandler := handler.NewAuthHandler(authSvc)
	childHandler := handler.NewChildHandler(childSvc)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.POST("/auth/token", authHandler.Login)
	r.GET("/summary", childHandler.Summary)
	r.GET("/children", childHandler.List)
	r.GET("/children/:id", childHandler.GetByID)

	authorized := r.Group("/")
	authorized.Use(middleware.Auth(authSvc))
	authorized.PATCH("/children/:id/review", childHandler.Review)

	log.Printf("servidor iniciando na porta :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("executar: %v", err)
	}
}
