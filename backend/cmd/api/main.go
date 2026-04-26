package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prefeiturario/painel-social/internal/cache"
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

	if err := database.SeedDefaultUser(db); err != nil {
		log.Printf("aviso: seed de usuário falhou: %v", err)
	}

	var childCache cache.Cacher = &cache.NoopCache{}
	if cfg.RedisURL != "" {
		rc, err := cache.NewRedisCache(cfg.RedisURL)
		if err != nil {
			log.Printf("aviso: redis indisponível, cache desativado: %v", err)
		} else {
			childCache = rc
			log.Println("redis conectado")
		}
	}

	userRepo := repository.NewUserRepository(db)
	childRepo := repository.NewChildRepository(db)

	authSvc := service.NewAuthService(cfg.JWTSecret, userRepo)
	childSvc := service.NewChildService(childRepo, childCache)
	userSvc := service.NewUserService(userRepo)

	authHandler := handler.NewAuthHandler(authSvc)
	childHandler := handler.NewChildHandler(childSvc)
	userHandler := handler.NewUserHandler(userSvc)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.POST("/auth/token", authHandler.Login)
	r.POST("/auth/logout", func(c *gin.Context) { c.Status(204) })

	authorized := r.Group("/")
	authorized.Use(middleware.Auth(authSvc))

	authorized.GET("/summary", childHandler.Summary)
	authorized.GET("/children", childHandler.List)
	authorized.GET("/children/:id", childHandler.GetByID)
	authorized.PATCH("/children/:id/review", childHandler.Review)

	authorized.GET("/users", userHandler.List)
	authorized.POST("/users", userHandler.Create)
	authorized.GET("/users/:id", userHandler.GetByID)
	authorized.PUT("/users/:id", userHandler.Update)
	authorized.PATCH("/users/:id/password", userHandler.ChangePassword)
	authorized.DELETE("/users/:id", userHandler.Delete)

	log.Printf("servidor iniciando na porta :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("executar: %v", err)
	}
}
