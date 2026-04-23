CREATE TABLE IF NOT EXISTS children (
    id              VARCHAR(10) PRIMARY KEY,
    nome            VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    bairro          VARCHAR(100) NOT NULL,
    responsavel     VARCHAR(255) NOT NULL,
    revisado        BOOLEAN NOT NULL DEFAULT FALSE,
    revisado_por    VARCHAR(255),
    revisado_em     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS saude (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crianca_id      VARCHAR(10) NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    ultima_consulta DATE,
    vacinas_em_dia  BOOLEAN NOT NULL DEFAULT FALSE,
    alertas         TEXT[] NOT NULL DEFAULT '{}',
    CONSTRAINT uq_saude_crianca UNIQUE (crianca_id)
);

CREATE TABLE IF NOT EXISTS educacao (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crianca_id VARCHAR(10) NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    escola     VARCHAR(255),
    alertas    TEXT[] NOT NULL DEFAULT '{}',
    CONSTRAINT uq_educacao_crianca UNIQUE (crianca_id)
);

CREATE TABLE IF NOT EXISTS frequencia_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    educacao_id UUID NOT NULL REFERENCES educacao(id) ON DELETE CASCADE,
    data        DATE NOT NULL,
    presente    BOOLEAN NOT NULL,
    CONSTRAINT uq_frequencia_dia UNIQUE (educacao_id, data)
);

CREATE TABLE IF NOT EXISTS assistencia_social (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crianca_id      VARCHAR(10) NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    cad_unico       BOOLEAN NOT NULL DEFAULT FALSE,
    beneficio_ativo BOOLEAN NOT NULL DEFAULT FALSE,
    alertas         TEXT[] NOT NULL DEFAULT '{}',
    CONSTRAINT uq_assistencia_crianca UNIQUE (crianca_id)
);

CREATE INDEX IF NOT EXISTS idx_children_bairro   ON children(bairro);
CREATE INDEX IF NOT EXISTS idx_children_revisado  ON children(revisado);
CREATE INDEX IF NOT EXISTS idx_frequencia_educ_id ON frequencia_log(educacao_id);
