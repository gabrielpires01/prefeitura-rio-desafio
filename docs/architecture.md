# Diagramas de Arquitetura

## Arquitetura do Backend

```
┌──────────────────────────────────────────────────────────────────────┐
│                           API Go (Gin)                               │
│                                                                      │
│  ┌──────────────┐   ┌─────────────────────────────────────────┐    │
│  │   Handler    │──▶│               Service                   │    │
│  │              │   │                                         │    │
│  │ auth_handler │   │  1. tenta cache (RedisCache/NoopCache)  │    │
│  │child_handler │   │  2. em cache miss → Repository          │    │
│  │summary_handl │   │  3. em review → invalida cache          │    │
│  └──────┬───────┘   └────────┬──────────────────┬────────────┘    │
│         │                    │ hit               │ miss            │
│  ┌──────▼───────┐   ┌────────▼───────┐  ┌───────▼────────────┐   │
│  │  Middleware  │   │  Cache Layer   │  │    Repository      │   │
│  │  Auth (JWT)  │   │  (Cacher)      │  │ child_repository   │   │
│  └──────────────┘   │                │  │  (GORM queries)    │   │
│                     │ RedisCache     │  └───────┬────────────┘   │
│                     │ NoopCache      │          │                 │
│                     │ (fallback)     │  ┌───────▼────────────┐   │
│                     └────────┬───────┘  │     PostgreSQL     │   │
│                              │          │    (5 tabelas)     │   │
│                     ┌────────▼───────┐  └────────────────────┘   │
│                     │     Redis      │                            │
│                     └────────────────┘                            │
└──────────────────────────────────────────────────────────────────────┘
```

## Endpoints da API

```
POST   /auth/token              → Login, retorna JWT
GET    /summary                 → Estatísticas agregadas (público)
GET    /children                → Lista + filtros + paginação (público)
GET    /children/:id            → Detalhe da criança (público)
PATCH  /children/:id/review     → Marcar como revisado (requer JWT)
```

## Fluxo da Aplicação Frontend

```
Navegador
  │
  ▼
┌─────────────────────────────────────────────────────┐
│               Middleware do Next.js                  │
│      verifica o cookie "token" em cada requisição    │
│                                                     │
│   Sem token → redireciona para /login               │
│   Com token + em /login → redireciona para /        │
└──────────────────────────┬──────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
     ┌─────▼──────┐                ┌───────▼────────┐
     │ /login     │                │ / (Painel)     │
     │            │                │ /children      │
     │ POST       │    sucesso     │ /children/:id  │
     │ /auth/token│───────────────▶│                │
     │            │                │                │
     └────────────┘                └────────────────┘
```

## Fluxo do Usuário

```
Técnico abre o navegador
        │
        ▼
  Não autenticado?
        │
    sim │              não
        ▼               ▼
  página /login    / Painel
        │
  Informa e-mail + senha
        │
  POST /auth/token
        │
   token salvo
   localStorage + cookie
        │
        ▼
  / Painel
  ┌─────────────────┐
  │ Cartões Resumo  │  ← GET /summary
  │ Gráfico Barras  │
  └────────┬────────┘
           │
  Navegar para /children
  ┌─────────────────┐
  │ Barra Filtros   │  ← GET /children?bairro=&com_alertas=&revisado=&page=
  │ Cartões Criança │
  │ Paginação       │
  └────────┬────────┘
           │
  Clicar no cartão da criança
  ┌─────────────────┐
  │ Detalhe Criança │  ← GET /children/:id
  │ Cartão Saúde    │
  │ Cartão Educação │
  │ Assist. Social  │
  │ Botão Revisão   │  ← PATCH /children/:id/review (requer JWT)
  └─────────────────┘
```

## Modelo de Dados

```
children                          saude
──────────────────────            ──────────────────────────────
id           VARCHAR(10) PK       id              UUID PK
nome         VARCHAR               crianca_id      VARCHAR(10) FK → children.id
data_nasc.   DATE                  ultima_consulta DATE
bairro       VARCHAR               vacinas_em_dia  BOOLEAN
responsavel  VARCHAR               alertas         TEXT[]
revisado     BOOLEAN
revisado_por VARCHAR               assistencia_social
revisado_em  TIMESTAMPTZ           ──────────────────────────────
                                   id              UUID PK
educacao                           crianca_id      VARCHAR(10) FK → children.id
──────────────────────────         cad_unico       BOOLEAN
id         UUID PK                 beneficio_ativo BOOLEAN
crianca_id VARCHAR(10) FK → ch.    alertas         TEXT[]
escola     VARCHAR
alertas    TEXT[]                 


// Regras:
// - cada criança pode ter 0 ou 1 registro em cada tabela auxiliar
// - ON DELETE CASCADE em todas as FKs filhas
```

## Camada ORM (GORM)

```
domain.Child          → tabela children
domain.Saude          → tabela saude           (HasOne via CriancaID)
domain.Educacao       → tabela educacao        (HasOne via CriancaID)
domain.AssistenciaSocial → tabela assistencia_social (HasOne via CriancaID)

Preload na consulta:
  db.Preload("Saude").
     Preload("AssistenciaSocial").
     Preload("Educacao").
     First(&child, "id = ?", id)
```

## Serviços do Docker Compose

```
┌──────────────────────────────────────────┐
│            docker-compose.yml            │
│                                          │
│  postgres:5432  ──▶  backend:8080        │
│  (healthcheck)       (aguarda o pg       │
│                       e o redis)         │
│  redis:6379     ──▶  backend:8080        │
│  (healthcheck)                           │
│                                          │
│  frontend:3000  ──▶  backend:8080        │
│  (Next.js)           (via API_URL)       │
│                                          │
│  navegador      ──▶  localhost:3000      │
│                 ──▶  localhost:8080      │
└──────────────────────────────────────────┘
```
