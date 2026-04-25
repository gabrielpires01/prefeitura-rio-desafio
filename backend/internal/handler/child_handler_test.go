package handler_test

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/handler"
	"github.com/prefeiturario/painel-social/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockChildSvc struct {
	listFn       func(domain.ChildListParams) (*domain.ChildListResult, error)
	getByIDFn    func(string) (*domain.Child, error)
	markReviewFn func(string, string) error
	summaryFn    func() (*domain.Summary, error)
}

func (m *mockChildSvc) List(p domain.ChildListParams) (*domain.ChildListResult, error) {
	return m.listFn(p)
}
func (m *mockChildSvc) GetByID(id string) (*domain.Child, error) { return m.getByIDFn(id) }
func (m *mockChildSvc) MarkReviewed(id, r string) error          { return m.markReviewFn(id, r) }
func (m *mockChildSvc) Summary() (*domain.Summary, error)        { return m.summaryFn() }

func childRouter(svc service.ChildServicer) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := handler.NewChildHandler(svc)
	r.GET("/children", h.List)
	r.GET("/children/:id", h.GetByID)
	r.PATCH("/children/:id/review", func(c *gin.Context) {
		c.Set("username", "analista@prefeitura.rio")
		h.Review(c)
	})
	r.GET("/summary", h.Summary)
	return r
}

func get(r *gin.Engine, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func patch(r *gin.Engine, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPatch, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func listOf(children ...domain.Child) *domain.ChildListResult {
	return &domain.ChildListResult{Children: children, Total: len(children), Page: 1, PageSize: 20, TotalPages: 1}
}

// --- List ---

func TestChildHandler_List_ReturnsOK(t *testing.T) {
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		return listOf(domain.Child{ID: "C001", Nome: "Ana"}), nil
	}}
	w := get(childRouter(mock), "/children")
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestChildHandler_List_DefaultPageAndPageSize(t *testing.T) {
	var gotPage, gotSize int
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		gotPage, gotSize = p.Page, p.PageSize
		return listOf(), nil
	}}
	get(childRouter(mock), "/children")
	assert.Equal(t, 1, gotPage)
	assert.Equal(t, 20, gotSize)
}

func TestChildHandler_List_BairroQueryParam(t *testing.T) {
	var gotBairro string
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		gotBairro = p.Bairro
		return listOf(), nil
	}}
	get(childRouter(mock), "/children?bairro=Copacabana")
	assert.Equal(t, "Copacabana", gotBairro)
}

func TestChildHandler_List_ComAlertasTrue(t *testing.T) {
	var got *bool
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.ComAlertas
		return listOf(), nil
	}}
	get(childRouter(mock), "/children?com_alertas=true")
	require.NotNil(t, got)
	assert.True(t, *got)
}

func TestChildHandler_List_ComAlertasFalse(t *testing.T) {
	var got *bool
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.ComAlertas
		return listOf(), nil
	}}
	get(childRouter(mock), "/children?com_alertas=false")
	require.NotNil(t, got)
	assert.False(t, *got)
}

func TestChildHandler_List_ComAlertasAbsent_IsNil(t *testing.T) {
	var got *bool
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.ComAlertas
		return listOf(), nil
	}}
	get(childRouter(mock), "/children")
	assert.Nil(t, got)
}

func TestChildHandler_List_RevisadoTrue(t *testing.T) {
	var got *bool
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.Revisado
		return listOf(), nil
	}}
	get(childRouter(mock), "/children?revisado=true")
	require.NotNil(t, got)
	assert.True(t, *got)
}

func TestChildHandler_List_InvalidPageFallsBackTo1(t *testing.T) {
	var gotPage int
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		gotPage = p.Page
		return listOf(), nil
	}}
	get(childRouter(mock), "/children?page=abc")
	assert.Equal(t, 1, gotPage)
}

func TestChildHandler_List_ZeroPageFallsBackTo1(t *testing.T) {
	var gotPage int
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		gotPage = p.Page
		return listOf(), nil
	}}
	get(childRouter(mock), "/children?page=0")
	assert.Equal(t, 1, gotPage)
}

func TestChildHandler_List_ServiceError_Returns500(t *testing.T) {
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		return nil, errors.New("db unavailable")
	}}
	w := get(childRouter(mock), "/children")
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestChildHandler_List_ResponseJSON(t *testing.T) {
	freq := 90.0
	mock := &mockChildSvc{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		return listOf(domain.Child{
			ID:   "C001",
			Nome: "Ana",
			Educacao: &domain.Educacao{
				FrequenciaPercent: &freq,
				Alertas:           pq.StringArray{},
			},
		}), nil
	}}
	w := get(childRouter(mock), "/children")
	var resp domain.ChildListResult
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, 1, resp.Total)
	assert.Equal(t, "C001", resp.Children[0].ID)
}

// --- GetByID ---

func TestChildHandler_GetByID_Found(t *testing.T) {
	mock := &mockChildSvc{getByIDFn: func(id string) (*domain.Child, error) {
		return &domain.Child{ID: id, Nome: "Maria"}, nil
	}}
	w := get(childRouter(mock), "/children/C001")
	assert.Equal(t, http.StatusOK, w.Code)
	var c domain.Child
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &c))
	assert.Equal(t, "C001", c.ID)
}

func TestChildHandler_GetByID_NotFound_Returns404(t *testing.T) {
	mock := &mockChildSvc{getByIDFn: func(id string) (*domain.Child, error) {
		return nil, service.ErrNotFound
	}}
	w := get(childRouter(mock), "/children/MISSING")
	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestChildHandler_GetByID_ServiceError_Returns500(t *testing.T) {
	mock := &mockChildSvc{getByIDFn: func(id string) (*domain.Child, error) {
		return nil, errors.New("timeout")
	}}
	w := get(childRouter(mock), "/children/C001")
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestChildHandler_GetByID_PassesIDCorrectly(t *testing.T) {
	var gotID string
	mock := &mockChildSvc{getByIDFn: func(id string) (*domain.Child, error) {
		gotID = id
		return &domain.Child{ID: id}, nil
	}}
	get(childRouter(mock), "/children/C042")
	assert.Equal(t, "C042", gotID)
}

// --- Review ---

func TestChildHandler_Review_Success(t *testing.T) {
	var gotID, gotReviewer string
	mock := &mockChildSvc{markReviewFn: func(id, rev string) error {
		gotID, gotReviewer = id, rev
		return nil
	}}
	w := patch(childRouter(mock), "/children/C001/review")
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "C001", gotID)
	assert.Equal(t, "analista@prefeitura.rio", gotReviewer)
	var resp map[string]string
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, "revisado", resp["message"])
}

func TestChildHandler_Review_NotFound_Returns404(t *testing.T) {
	mock := &mockChildSvc{markReviewFn: func(id, rev string) error { return service.ErrNotFound }}
	w := patch(childRouter(mock), "/children/MISSING/review")
	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestChildHandler_Review_ServiceError_Returns500(t *testing.T) {
	mock := &mockChildSvc{markReviewFn: func(id, rev string) error { return errors.New("db locked") }}
	w := patch(childRouter(mock), "/children/C001/review")
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// --- Summary ---

func TestChildHandler_Summary_Success(t *testing.T) {
	mock := &mockChildSvc{summaryFn: func() (*domain.Summary, error) {
		return &domain.Summary{TotalCriancas: 25, Revisadas: 10}, nil
	}}
	w := get(childRouter(mock), "/summary")
	assert.Equal(t, http.StatusOK, w.Code)
	var s domain.Summary
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &s))
	assert.Equal(t, 25, s.TotalCriancas)
	assert.Equal(t, 10, s.Revisadas)
}

func TestChildHandler_Summary_ServiceError_Returns500(t *testing.T) {
	mock := &mockChildSvc{summaryFn: func() (*domain.Summary, error) {
		return nil, errors.New("query failed")
	}}
	w := get(childRouter(mock), "/summary")
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}
