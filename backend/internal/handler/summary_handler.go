package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *ChildHandler) Summary(c *gin.Context) {
	s, err := h.svc.Summary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, s)
}
