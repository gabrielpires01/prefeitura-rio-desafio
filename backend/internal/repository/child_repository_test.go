//go:build integration

package repository_test

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/repository"
)

// Seed data summary (seed.json — 25 children):
//   Bairros: Rocinha×5, Maré×5, Jacarezinho×5, Complexo do Alemão×5, Mangueira×5
//   Revisado=true:  c003, c008, c013, c020             → 4
//   Revisado=false:                                    → 21
//   ComAlertas=true:                                   → 17
//   ComAlertas=false: c005,c007,c010,c015,c016,c018,c022,c024 → 8
//   SemDados (no rows in any related table): c015       → 1

// ── List ──────────────────────────────────────────────────────────────────────

func TestChildRepository_List_Total(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{Page: 1, PageSize: 50})
	require.NoError(t, err)
	assert.Equal(t, 25, result.Total)
	assert.Len(t, result.Children, 25)
}

func TestChildRepository_List_SortedByName(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{Page: 1, PageSize: 50})
	require.NoError(t, err)
	for i := 1; i < len(result.Children); i++ {
		assert.LessOrEqual(t, result.Children[i-1].Nome, result.Children[i].Nome)
	}
}

func TestChildRepository_List_PreloadsRelations(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{Page: 1, PageSize: 50})
	require.NoError(t, err)

	var c001 *domain.Child
	for i := range result.Children {
		if result.Children[i].ID == "c001" {
			c001 = &result.Children[i]
			break
		}
	}
	require.NotNil(t, c001, "c001 should be in the list")
	assert.NotNil(t, c001.Saude)
	assert.NotNil(t, c001.Educacao)
	assert.NotNil(t, c001.AssistenciaSocial)
}

func TestChildRepository_List_FilterBairro(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{Bairro: "Rocinha", Page: 1, PageSize: 50})
	require.NoError(t, err)
	assert.Equal(t, 5, result.Total)
	for _, c := range result.Children {
		assert.Equal(t, "Rocinha", c.Bairro)
	}
}

func TestChildRepository_List_FilterRevisadoTrue(t *testing.T) {
	rev := true
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{Revisado: &rev, Page: 1, PageSize: 50})
	require.NoError(t, err)
	assert.Equal(t, 4, result.Total)
	for _, c := range result.Children {
		assert.True(t, c.Revisado)
	}
}

func TestChildRepository_List_FilterRevisadoFalse(t *testing.T) {
	rev := false
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{Revisado: &rev, Page: 1, PageSize: 50})
	require.NoError(t, err)
	assert.Equal(t, 21, result.Total)
	for _, c := range result.Children {
		assert.False(t, c.Revisado)
	}
}

func TestChildRepository_List_FilterComAlertasTrue(t *testing.T) {
	ca := true
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{ComAlertas: &ca, Page: 1, PageSize: 50})
	require.NoError(t, err)
	assert.Equal(t, 17, result.Total)
	for _, c := range result.Children {
		assert.True(t, c.HasAlerts(), "child %s should have alerts", c.ID)
	}
}

func TestChildRepository_List_FilterComAlertasFalse(t *testing.T) {
	ca := false
	repo := repository.NewChildRepository(newTestDB(t))

	result, err := repo.List(domain.ChildListParams{ComAlertas: &ca, Page: 1, PageSize: 50})
	require.NoError(t, err)
	assert.Equal(t, 8, result.Total)
	for _, c := range result.Children {
		assert.False(t, c.HasAlerts(), "child %s should not have alerts", c.ID)
	}
}

func TestChildRepository_List_Pagination(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	page1, err := repo.List(domain.ChildListParams{Page: 1, PageSize: 10})
	require.NoError(t, err)
	assert.Equal(t, 25, page1.Total)
	assert.Len(t, page1.Children, 10)
	assert.Equal(t, 3, page1.TotalPages)

	page3, err := repo.List(domain.ChildListParams{Page: 3, PageSize: 10})
	require.NoError(t, err)
	assert.Len(t, page3.Children, 5)

	// pages must not overlap
	ids1 := make(map[string]bool)
	for _, c := range page1.Children {
		ids1[c.ID] = true
	}
	for _, c := range page3.Children {
		assert.False(t, ids1[c.ID], "child %s appears on both page 1 and page 3", c.ID)
	}
}

func TestChildRepository_List_BairroAndRevisado(t *testing.T) {
	rev := true
	repo := repository.NewChildRepository(newTestDB(t))

	// c003, c008, c013 are all in Jacarezinho and revisado=true
	result, err := repo.List(domain.ChildListParams{
		Bairro:   "Jacarezinho",
		Revisado: &rev,
		Page:     1,
		PageSize: 50,
	})
	require.NoError(t, err)
	assert.Equal(t, 3, result.Total)
	for _, c := range result.Children {
		assert.Equal(t, "Jacarezinho", c.Bairro)
		assert.True(t, c.Revisado)
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestChildRepository_GetByID_Found(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	child, err := repo.GetByID("c001")
	require.NoError(t, err)
	require.NotNil(t, child)
	assert.Equal(t, "c001", child.ID)
	assert.Equal(t, "Ana Clara Mendes", child.Nome)
	assert.Equal(t, "Rocinha", child.Bairro)
	assert.NotNil(t, child.Saude)
	assert.NotNil(t, child.Educacao)
	assert.NotNil(t, child.AssistenciaSocial)
}

func TestChildRepository_GetByID_NotFound(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	child, err := repo.GetByID("nonexistent")
	require.NoError(t, err)
	assert.Nil(t, child)
}

func TestChildRepository_GetByID_NilRelations(t *testing.T) {
	// c015 has no saude, educacao, or assistencia_social records
	repo := repository.NewChildRepository(newTestDB(t))

	child, err := repo.GetByID("c015")
	require.NoError(t, err)
	require.NotNil(t, child)
	assert.Nil(t, child.Saude)
	assert.Nil(t, child.Educacao)
	assert.Nil(t, child.AssistenciaSocial)
}

func TestChildRepository_GetByID_AlertsLoaded(t *testing.T) {
	// c002 has saude alerts: ["vacinas_atrasadas", "consulta_atrasada"]
	repo := repository.NewChildRepository(newTestDB(t))

	child, err := repo.GetByID("c002")
	require.NoError(t, err)
	require.NotNil(t, child)
	require.NotNil(t, child.Saude)
	assert.ElementsMatch(t, []string{"vacinas_atrasadas", "consulta_atrasada"}, []string(child.Saude.Alertas))
}

// ── MarkReviewed ──────────────────────────────────────────────────────────────

func TestChildRepository_MarkReviewed_Success(t *testing.T) {
	// c004 starts as revisado=false
	repo := repository.NewChildRepository(newTestDB(t))

	err := repo.MarkReviewed("c004", "auditor@test.com")
	require.NoError(t, err)

	child, err := repo.GetByID("c004")
	require.NoError(t, err)
	require.NotNil(t, child)
	assert.True(t, child.Revisado)
	require.NotNil(t, child.RevisadoPor)
	assert.Equal(t, "auditor@test.com", *child.RevisadoPor)
	assert.NotNil(t, child.RevisadoEm)
}

func TestChildRepository_MarkReviewed_NotFound(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	err := repo.MarkReviewed("ghost", "auditor@test.com")
	assert.ErrorIs(t, err, sql.ErrNoRows)
}

func TestChildRepository_MarkReviewed_AlreadyReviewed(t *testing.T) {
	// c003 is already revisado=true; marking it again should succeed (idempotent update)
	repo := repository.NewChildRepository(newTestDB(t))

	err := repo.MarkReviewed("c003", "another@test.com")
	require.NoError(t, err)

	child, err := repo.GetByID("c003")
	require.NoError(t, err)
	require.NotNil(t, child.RevisadoPor)
	assert.Equal(t, "another@test.com", *child.RevisadoPor)
}

// ── Summary ───────────────────────────────────────────────────────────────────

func TestChildRepository_Summary(t *testing.T) {
	repo := repository.NewChildRepository(newTestDB(t))

	s, err := repo.Summary()
	require.NoError(t, err)
	require.NotNil(t, s)

	assert.Equal(t, 25, s.TotalCriancas)
	assert.Equal(t, 8, s.ComAlertasSaude)
	assert.Equal(t, 9, s.ComAlertasEduc)
	assert.Equal(t, 8, s.ComAlertasAssist)
	assert.Equal(t, 4, s.Revisadas)
	assert.Equal(t, 1, s.SemDados)
}
