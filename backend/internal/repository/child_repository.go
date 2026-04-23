package repository

import (
	"database/sql"
	"math"
	"time"

	"gorm.io/gorm"

	"github.com/prefeiturario/painel-social/internal/domain"
)

type ChildRepository struct {
	db *gorm.DB
}

func NewChildRepository(db *gorm.DB) *ChildRepository {
	return &ChildRepository{db: db}
}

func (r *ChildRepository) List(params domain.ChildListParams) (*domain.ChildListResult, error) {
	q := r.db.Model(&domain.Child{})

	if params.Bairro != "" {
		q = q.Where("bairro = ?", params.Bairro)
	}
	if params.Revisado != nil {
		q = q.Where("revisado = ?", *params.Revisado)
	}
	if params.ComAlertas != nil {
		if *params.ComAlertas {
			q = q.Where(`
				EXISTS (SELECT 1 FROM saude          WHERE crianca_id = children.id AND array_length(alertas,1) > 0)
				OR EXISTS (SELECT 1 FROM educacao       WHERE crianca_id = children.id AND array_length(alertas,1) > 0)
				OR EXISTS (SELECT 1 FROM assistencia_social WHERE crianca_id = children.id AND array_length(alertas,1) > 0)
			`)
		} else {
			q = q.Where(`
				NOT EXISTS (SELECT 1 FROM saude          WHERE crianca_id = children.id AND array_length(alertas,1) > 0)
				AND NOT EXISTS (SELECT 1 FROM educacao       WHERE crianca_id = children.id AND array_length(alertas,1) > 0)
				AND NOT EXISTS (SELECT 1 FROM assistencia_social WHERE crianca_id = children.id AND array_length(alertas,1) > 0)
			`)
		}
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	var children []domain.Child
	err := q.
		Preload("Saude").
		Preload("AssistenciaSocial").
		Preload("Educacao").
		Order("nome ASC").
		Limit(params.PageSize).
		Offset((params.Page - 1) * params.PageSize).
		Find(&children).Error
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(params.PageSize)))
	return &domain.ChildListResult{
		Children:   children,
		Total:      int(total),
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalPages: totalPages,
	}, nil
}

func (r *ChildRepository) GetByID(id string) (*domain.Child, error) {
	var child domain.Child
	err := r.db.
		Preload("Saude").
		Preload("AssistenciaSocial").
		Preload("Educacao").
		First(&child, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &child, nil
}

func (r *ChildRepository) MarkReviewed(id, reviewer string) error {
	result := r.db.Model(&domain.Child{}).
		Where("id = ?", id).
		Updates(map[string]any{
			"revisado":     true,
			"revisado_por": reviewer,
			"revisado_em":  time.Now().UTC(),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *ChildRepository) Summary() (*domain.Summary, error) {
	var s domain.Summary
	err := r.db.Raw(`
		SELECT
			COUNT(*)                                                                          AS total_criancas,
			COUNT(*) FILTER (WHERE EXISTS (
				SELECT 1 FROM saude WHERE crianca_id = children.id AND array_length(alertas,1) > 0
			))                                                                                AS com_alertas_saude,
			COUNT(*) FILTER (WHERE EXISTS (
				SELECT 1 FROM educacao WHERE crianca_id = children.id AND array_length(alertas,1) > 0
			))                                                                                AS com_alertas_educacao,
			COUNT(*) FILTER (WHERE EXISTS (
				SELECT 1 FROM assistencia_social WHERE crianca_id = children.id AND array_length(alertas,1) > 0
			))                                                                                AS com_alertas_assistencia_social,
			COUNT(*) FILTER (WHERE revisado)                                                  AS revisadas,
			COUNT(*) FILTER (WHERE
				NOT EXISTS (SELECT 1 FROM saude               WHERE crianca_id = children.id)
				AND NOT EXISTS (SELECT 1 FROM educacao         WHERE crianca_id = children.id)
				AND NOT EXISTS (SELECT 1 FROM assistencia_social WHERE crianca_id = children.id)
			)                                                                                 AS sem_dados
		FROM children
	`).Scan(&s).Error
	return &s, err
}
