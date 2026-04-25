package domain

import (
	"time"

	"github.com/lib/pq"
)

type Child struct {
	ID                string             `gorm:"primaryKey;column:id"           json:"id"`
	Nome              string             `gorm:"column:nome"                    json:"nome"`
	DataNascimento    string             `gorm:"column:data_nascimento"         json:"data_nascimento"`
	Bairro            string             `gorm:"column:bairro"                  json:"bairro"`
	Responsavel       string             `gorm:"column:responsavel"             json:"responsavel"`
	Revisado          bool               `gorm:"column:revisado"                json:"revisado"`
	RevisadoPor       *string            `gorm:"column:revisado_por"            json:"revisado_por"`
	RevisadoEm        *time.Time         `gorm:"column:revisado_em"             json:"revisado_em"`
	Saude             *Saude             `gorm:"foreignKey:CriancaID"           json:"saude"`
	Educacao          *Educacao          `gorm:"foreignKey:CriancaID"           json:"educacao"`
	AssistenciaSocial *AssistenciaSocial `gorm:"foreignKey:CriancaID"           json:"assistencia_social"`
}

func (Child) TableName() string { return "children" }

type Saude struct {
	ID             string         `gorm:"primaryKey;column:id"            json:"-"`
	CriancaID      string         `gorm:"column:crianca_id"               json:"-"`
	UltimaConsulta *string        `gorm:"column:ultima_consulta"          json:"ultima_consulta"`
	VacinasEmDia   bool           `gorm:"column:vacinas_em_dia"           json:"vacinas_em_dia"`
	Alertas        pq.StringArray `gorm:"type:text[];column:alertas"      json:"alertas"`
}

func (Saude) TableName() string { return "saude" }

type Educacao struct {
	ID                string         `gorm:"primaryKey;column:id"            json:"-"`
	CriancaID         string         `gorm:"column:crianca_id"               json:"-"`
	Escola            *string        `gorm:"column:escola"                   json:"escola"`
	Alertas           pq.StringArray `gorm:"type:text[];column:alertas"      json:"alertas"`
	FrequenciaPercent *float64       `gorm:"column:frequencia_percent"       json:"frequencia_percent"`
}

func (Educacao) TableName() string { return "educacao" }

type AssistenciaSocial struct {
	ID             string         `gorm:"primaryKey;column:id"            json:"-"`
	CriancaID      string         `gorm:"column:crianca_id"               json:"-"`
	CadUnico       bool           `gorm:"column:cad_unico"                json:"cad_unico"`
	BeneficioAtivo bool           `gorm:"column:beneficio_ativo"          json:"beneficio_ativo"`
	Alertas        pq.StringArray `gorm:"type:text[];column:alertas"      json:"alertas"`
}

func (AssistenciaSocial) TableName() string { return "assistencia_social" }

func (c *Child) HasAlerts() bool {
	if c.Saude != nil && len(c.Saude.Alertas) > 0 {
		return true
	}
	if c.Educacao != nil && len(c.Educacao.Alertas) > 0 {
		return true
	}
	if c.AssistenciaSocial != nil && len(c.AssistenciaSocial.Alertas) > 0 {
		return true
	}
	return false
}

type ChildListParams struct {
	Bairro     string
	ComAlertas *bool
	Revisado   *bool
	Page       int
	PageSize   int
}

type ChildListResult struct {
	Children   []Child `json:"children"`
	Total      int     `json:"total"`
	Page       int     `json:"page"`
	PageSize   int     `json:"page_size"`
	TotalPages int     `json:"total_pages"`
}

type Summary struct {
	TotalCriancas    int `gorm:"column:total_criancas"               json:"total_criancas"`
	ComAlertasSaude  int `gorm:"column:com_alertas_saude"            json:"com_alertas_saude"`
	ComAlertasEduc   int `gorm:"column:com_alertas_educacao"         json:"com_alertas_educacao"`
	ComAlertasAssist int `gorm:"column:com_alertas_assistencia_social" json:"com_alertas_assistencia_social"`
	Revisadas        int `gorm:"column:revisadas"                    json:"revisadas"`
	SemDados         int `gorm:"column:sem_dados"                    json:"sem_dados"`
}
