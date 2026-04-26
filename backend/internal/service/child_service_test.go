package service_test

import (
	"database/sql"
	"errors"
	"testing"

	"gorm.io/gorm"

	"github.com/prefeiturario/painel-social/internal/cache"
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newSvc(repo *mockRepo) *service.ChildService {
	return service.NewChildService(repo, &cache.NoopCache{})
}

type mockRepo struct {
	listFn       func(domain.ChildListParams) (*domain.ChildListResult, error)
	getByIDFn    func(string) (*domain.Child, error)
	markReviewFn func(string, string) error
	summaryFn    func() (*domain.Summary, error)
}

func (m *mockRepo) List(p domain.ChildListParams) (*domain.ChildListResult, error) {
	return m.listFn(p)
}
func (m *mockRepo) GetByID(id string) (*domain.Child, error) { return m.getByIDFn(id) }
func (m *mockRepo) MarkReviewed(id, rev string) error        { return m.markReviewFn(id, rev) }
func (m *mockRepo) Summary() (*domain.Summary, error)        { return m.summaryFn() }

func listResult(children ...domain.Child) *domain.ChildListResult {
	return &domain.ChildListResult{
		Children: children, Total: len(children), Page: 1, PageSize: 20, TotalPages: 1,
	}
}

// --- List ---

func TestChildService_List_Success(t *testing.T) {
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		return listResult(domain.Child{ID: "C001"}), nil
	}}
	res, err := newSvc(repo).List(domain.ChildListParams{Page: 1, PageSize: 20})
	require.NoError(t, err)
	assert.Equal(t, 1, res.Total)
}

func TestChildService_List_ZeroPageNormalisedToOne(t *testing.T) {
	var got int
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.Page
		return listResult(), nil
	}}
	newSvc(repo).List(domain.ChildListParams{Page: 0, PageSize: 20})
	assert.Equal(t, 1, got)
}

func TestChildService_List_NegativePageNormalisedToOne(t *testing.T) {
	var got int
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.Page
		return listResult(), nil
	}}
	newSvc(repo).List(domain.ChildListParams{Page: -99, PageSize: 20})
	assert.Equal(t, 1, got)
}

func TestChildService_List_ZeroPageSizeNormalisedTo20(t *testing.T) {
	var got int
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.PageSize
		return listResult(), nil
	}}
	newSvc(repo).List(domain.ChildListParams{Page: 1, PageSize: 0})
	assert.Equal(t, 20, got)
}

func TestChildService_List_PageSizeOver100NormalisedTo20(t *testing.T) {
	var got int
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.PageSize
		return listResult(), nil
	}}
	newSvc(repo).List(domain.ChildListParams{Page: 1, PageSize: 101})
	assert.Equal(t, 20, got)
}

func TestChildService_List_PageSize100IsAllowed(t *testing.T) {
	var got int
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.PageSize
		return listResult(), nil
	}}
	newSvc(repo).List(domain.ChildListParams{Page: 1, PageSize: 100})
	assert.Equal(t, 100, got)
}

func TestChildService_List_BairroFilterPassedThrough(t *testing.T) {
	var got string
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.Bairro
		return listResult(), nil
	}}
	newSvc(repo).List(domain.ChildListParams{Page: 1, PageSize: 20, Bairro: "Copacabana"})
	assert.Equal(t, "Copacabana", got)
}

func TestChildService_List_ComAlertasFilterPassedThrough(t *testing.T) {
	val := true
	var got *bool
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		got = p.ComAlertas
		return listResult(), nil
	}}
	newSvc(repo).List(domain.ChildListParams{Page: 1, PageSize: 20, ComAlertas: &val})
	require.NotNil(t, got)
	assert.True(t, *got)
}

func TestChildService_List_RepoError(t *testing.T) {
	repo := &mockRepo{listFn: func(p domain.ChildListParams) (*domain.ChildListResult, error) {
		return nil, errors.New("db unavailable")
	}}
	_, err := newSvc(repo).List(domain.ChildListParams{Page: 1, PageSize: 20})
	assert.Error(t, err)
}

// --- GetByID ---

func TestChildService_GetByID_Found(t *testing.T) {
	repo := &mockRepo{getByIDFn: func(id string) (*domain.Child, error) {
		return &domain.Child{ID: id, Nome: "Maria"}, nil
	}}
	c, err := newSvc(repo).GetByID("C001")
	require.NoError(t, err)
	assert.Equal(t, "C001", c.ID)
}

func TestChildService_GetByID_RepoReturnsNil_MapsToErrNotFound(t *testing.T) {
	repo := &mockRepo{getByIDFn: func(id string) (*domain.Child, error) {
		return nil, nil
	}}
	_, err := newSvc(repo).GetByID("MISSING")
	assert.ErrorIs(t, err, service.ErrNotFound)
}

func TestChildService_GetByID_RepoError_Propagated(t *testing.T) {
	repo := &mockRepo{getByIDFn: func(id string) (*domain.Child, error) {
		return nil, errors.New("connection timeout")
	}}
	_, err := newSvc(repo).GetByID("C001")
	assert.Error(t, err)
	assert.NotErrorIs(t, err, service.ErrNotFound)
}

// --- MarkReviewed ---

func TestChildService_MarkReviewed_Success(t *testing.T) {
	repo := &mockRepo{markReviewFn: func(id, rev string) error { return nil }}
	err := newSvc(repo).MarkReviewed("C001", "analista@prefeitura.rio")
	assert.NoError(t, err)
}

func TestChildService_MarkReviewed_SqlErrNoRows_MapsToErrNotFound(t *testing.T) {
	repo := &mockRepo{markReviewFn: func(id, rev string) error { return sql.ErrNoRows }}
	err := newSvc(repo).MarkReviewed("MISSING", "analista")
	assert.ErrorIs(t, err, service.ErrNotFound)
}

func TestChildService_MarkReviewed_GormRecordNotFound_MapsToErrNotFound(t *testing.T) {
	repo := &mockRepo{markReviewFn: func(id, rev string) error { return gorm.ErrRecordNotFound }}
	err := newSvc(repo).MarkReviewed("MISSING", "analista")
	assert.ErrorIs(t, err, service.ErrNotFound)
}

func TestChildService_MarkReviewed_OtherError_Propagated(t *testing.T) {
	repo := &mockRepo{markReviewFn: func(id, rev string) error { return errors.New("db locked") }}
	err := newSvc(repo).MarkReviewed("C001", "analista")
	assert.Error(t, err)
	assert.NotErrorIs(t, err, service.ErrNotFound)
}

func TestChildService_MarkReviewed_PassesReviewerThrough(t *testing.T) {
	var gotID, gotReviewer string
	repo := &mockRepo{markReviewFn: func(id, rev string) error {
		gotID, gotReviewer = id, rev
		return nil
	}}
	newSvc(repo).MarkReviewed("C042", "tecnico@prefeitura.rio")
	assert.Equal(t, "C042", gotID)
	assert.Equal(t, "tecnico@prefeitura.rio", gotReviewer)
}

// --- Summary ---

func TestChildService_Summary_Success(t *testing.T) {
	want := &domain.Summary{TotalCriancas: 10, Revisadas: 3, ComAlertasSaude: 2}
	repo := &mockRepo{summaryFn: func() (*domain.Summary, error) { return want, nil }}
	got, err := newSvc(repo).Summary()
	require.NoError(t, err)
	assert.Equal(t, want, got)
}

func TestChildService_Summary_Error(t *testing.T) {
	repo := &mockRepo{summaryFn: func() (*domain.Summary, error) {
		return nil, errors.New("query failed")
	}}
	_, err := newSvc(repo).Summary()
	assert.Error(t, err)
}
