package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/service"
)

type ChildHandler struct {
	svc service.ChildServicer
}

func NewChildHandler(svc service.ChildServicer) *ChildHandler {
	return &ChildHandler{svc: svc}
}

func (h *ChildHandler) List(c *gin.Context) {
	params := domain.ChildListParams{
		Bairro:   c.Query("bairro"),
		Page:     queryInt(c, "page", 1),
		PageSize: queryInt(c, "page_size", 20),
	}

	if v := c.Query("com_alertas"); v != "" {
		b, _ := strconv.ParseBool(v)
		params.ComAlertas = &b
	}
	if v := c.Query("revisado"); v != "" {
		b, _ := strconv.ParseBool(v)
		params.Revisado = &b
	}

	result, err := h.svc.List(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *ChildHandler) GetByID(c *gin.Context) {
	child, err := h.svc.GetByID(c.Param("id"))
	if err == service.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "não encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, child)
}

func (h *ChildHandler) Review(c *gin.Context) {
	username, _ := c.Get("username")
	reviewer, _ := username.(string)

	err := h.svc.MarkReviewed(c.Param("id"), reviewer)
	if err == service.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "não encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "revisado"})
}

func queryInt(c *gin.Context, key string, def int) int {
	v, err := strconv.Atoi(c.Query(key))
	if err != nil || v < 1 {
		return def
	}
	return v
}
