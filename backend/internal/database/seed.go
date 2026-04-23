package database

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"

	"github.com/prefeiturario/painel-social/internal/domain"
)

// Structs de seed espelham o seed.json sem campos GORM internos.
type seedSaude struct {
	UltimaConsulta *string  `json:"ultima_consulta"`
	VacinasEmDia   bool     `json:"vacinas_em_dia"`
	Alertas        []string `json:"alertas"`
}

type seedEducacao struct {
	Escola            *string  `json:"escola"`
	FrequenciaPercent *float64 `json:"frequencia_percent"`
	Alertas           []string `json:"alertas"`
}

type seedAssistencia struct {
	CadUnico       bool     `json:"cad_unico"`
	BeneficioAtivo bool     `json:"beneficio_ativo"`
	Alertas        []string `json:"alertas"`
}

type seedRecord struct {
	ID             string           `json:"id"`
	Nome           string           `json:"nome"`
	DataNascimento string           `json:"data_nascimento"`
	Bairro         string           `json:"bairro"`
	Responsavel    string           `json:"responsavel"`
	Saude          *seedSaude       `json:"saude"`
	Educacao       *seedEducacao    `json:"educacao"`
	AssistSocial   *seedAssistencia `json:"assistencia_social"`
	Revisado       bool             `json:"revisado"`
	RevisadoPor    *string          `json:"revisado_por"`
	RevisadoEm     *string          `json:"revisado_em"`
}

func SeedIfEmpty(db *gorm.DB, seedFile string) error {
	var count int64
	if err := db.Model(&domain.Child{}).Count(&count).Error; err != nil {
		return fmt.Errorf("verificar contagem: %w", err)
	}
	if count > 0 {
		return nil
	}

	data, err := os.ReadFile(seedFile)
	if err != nil {
		return fmt.Errorf("ler arquivo seed: %w", err)
	}

	var records []seedRecord
	if err := json.Unmarshal(data, &records); err != nil {
		return fmt.Errorf("processar seed: %w", err)
	}

	return db.Transaction(func(tx *gorm.DB) error {
		for _, sr := range records {
			child := domain.Child{
				ID:             sr.ID,
				Nome:           sr.Nome,
				DataNascimento: sr.DataNascimento,
				Bairro:         sr.Bairro,
				Responsavel:    sr.Responsavel,
				Revisado:       sr.Revisado,
				RevisadoPor:    sr.RevisadoPor,
			}
			if sr.RevisadoEm != nil {
				t, _ := time.Parse(time.RFC3339, *sr.RevisadoEm)
				child.RevisadoEm = &t
			}
			if err := tx.Create(&child).Error; err != nil {
				return fmt.Errorf("inserir %s: %w", sr.ID, err)
			}

			if sr.Saude != nil {
				saude := domain.Saude{
					ID:           newUUID(),
					CriancaID:    sr.ID,
					VacinasEmDia: sr.Saude.VacinasEmDia,
					Alertas:      pq.StringArray(sr.Saude.Alertas),
				}
				if sr.Saude.UltimaConsulta != nil && *sr.Saude.UltimaConsulta != "" {
					saude.UltimaConsulta = sr.Saude.UltimaConsulta
				}
				if err := tx.Create(&saude).Error; err != nil {
					return fmt.Errorf("inserir saude %s: %w", sr.ID, err)
				}
			}

			if sr.Educacao != nil {
				educacaoID := newUUID()
				educ := domain.Educacao{
					ID:        educacaoID,
					CriancaID: sr.ID,
					Escola:    sr.Educacao.Escola,
					Alertas:   pq.StringArray(sr.Educacao.Alertas),
					FrequenciaPercent: sr.Educacao.FrequenciaPercent,
				}
				if err := tx.Create(&educ).Error; err != nil {
					return fmt.Errorf("inserir educacao %s: %w", sr.ID, err)
				}
			}

			if sr.AssistSocial != nil {
				assist := domain.AssistenciaSocial{
					ID:             newUUID(),
					CriancaID:      sr.ID,
					CadUnico:       sr.AssistSocial.CadUnico,
					BeneficioAtivo: sr.AssistSocial.BeneficioAtivo,
					Alertas:        pq.StringArray(sr.AssistSocial.Alertas),
				}
				if err := tx.Create(&assist).Error; err != nil {
					return fmt.Errorf("inserir assistencia_social %s: %w", sr.ID, err)
				}
			}
		}
		return nil
	})
}

func newUUID() string {
	var b [16]byte
	rand.Read(b[:])
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
