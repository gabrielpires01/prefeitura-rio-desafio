package domain_test

import (
	"testing"

	"github.com/lib/pq"
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/stretchr/testify/assert"
)

func TestHasAlerts_NoRelations(t *testing.T) {
	c := domain.Child{}
	assert.False(t, c.HasAlerts())
}

func TestHasAlerts_NilPointers(t *testing.T) {
	c := domain.Child{Saude: nil, Educacao: nil, AssistenciaSocial: nil}
	assert.False(t, c.HasAlerts())
}

func TestHasAlerts_AllEmptyAlerts(t *testing.T) {
	c := domain.Child{
		Saude:             &domain.Saude{Alertas: pq.StringArray{}},
		Educacao:          &domain.Educacao{Alertas: pq.StringArray{}},
		AssistenciaSocial: &domain.AssistenciaSocial{Alertas: pq.StringArray{}},
	}
	assert.False(t, c.HasAlerts())
}

func TestHasAlerts_SaudeAlert(t *testing.T) {
	c := domain.Child{
		Saude: &domain.Saude{Alertas: pq.StringArray{"vacinação atrasada"}},
	}
	assert.True(t, c.HasAlerts())
}

func TestHasAlerts_EducacaoAlert(t *testing.T) {
	c := domain.Child{
		Educacao: &domain.Educacao{Alertas: pq.StringArray{"falta excessiva"}},
	}
	assert.True(t, c.HasAlerts())
}

func TestHasAlerts_AssistenciaAlert(t *testing.T) {
	c := domain.Child{
		AssistenciaSocial: &domain.AssistenciaSocial{Alertas: pq.StringArray{"benefício vencido"}},
	}
	assert.True(t, c.HasAlerts())
}

func TestHasAlerts_MultipleAlerts(t *testing.T) {
	c := domain.Child{
		Saude:             &domain.Saude{Alertas: pq.StringArray{"alerta1", "alerta2"}},
		AssistenciaSocial: &domain.AssistenciaSocial{Alertas: pq.StringArray{"alerta3"}},
	}
	assert.True(t, c.HasAlerts())
}

func TestHasAlerts_OnlySaudePresent_NoAlert(t *testing.T) {
	c := domain.Child{
		Saude: &domain.Saude{Alertas: pq.StringArray{}},
	}
	assert.False(t, c.HasAlerts())
}
