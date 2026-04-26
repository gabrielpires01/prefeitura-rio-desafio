package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prefeiturario/painel-social/internal/service"
)

type UserHandler struct {
	svc service.UserServicer
}

func NewUserHandler(svc service.UserServicer) *UserHandler {
	return &UserHandler{svc: svc}
}

type createUserRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Email    string `json:"email"     binding:"required,email"`
	Password string `json:"password"  binding:"required,min=6"`
}

type updateUserRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Email    string `json:"email"     binding:"required,email"`
}

type changePasswordRequest struct {
	Password string `json:"password" binding:"required,min=6"`
}

func (h *UserHandler) Create(c *gin.Context) {
	var req createUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "dados inválidos"})
		return
	}
	user, err := h.svc.CreateUser(req.FullName, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "e-mail já cadastrado"})
		return
	}
	c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) List(c *gin.Context) {
	users, err := h.svc.ListUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erro ao listar usuários"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	user, err := h.svc.GetUser(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Update(c *gin.Context) {
	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "dados inválidos"})
		return
	}
	user, err := h.svc.UpdateUser(c.Param("id"), req.FullName, req.Email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "senha inválida"})
		return
	}
	if err := h.svc.ChangePassword(c.Param("id"), req.Password); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *UserHandler) Delete(c *gin.Context) {
	if err := h.svc.DeleteUser(c.Param("id")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}
	c.Status(http.StatusNoContent)
}
