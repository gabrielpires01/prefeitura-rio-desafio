# Diagramas de Arquitetura

## Arquitetura do Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Go (Gin)                            │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │   Handler    │──▶│   Service    │──▶│   Repository     │   │
│  │              │   │              │   │                  │   │
│  │ auth_handler │   │ auth_service │   │ child_repository │   │
│  │child_handler │   │child_service │   │  (queries SQL)   │   │
│  │summary_handl │   │              │   │                  │   │
│  └──────┬───────┘   └──────────────┘   └────────┬─────────┘   │
│         │                                        │             │
│  ┌──────▼───────┐                      ┌────────▼─────────┐   │
│  │  Middleware  │                      │    PostgreSQL     │   │
│  │  Auth (JWT)  │                      │    tabela        │   │
│  └──────────────┘                      │    children      │   │
│                                        └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
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
Child {
  id, nome, data_nascimento, bairro, responsavel
  saude?              { ultima_consulta, vacinas_em_dia, alertas[] }
  educacao?           { escola, frequencia_percent, alertas[] }
  assistencia_social? { cad_unico, beneficio_ativo, alertas[] }
  revisado, revisado_por, revisado_em
}

// Casos especiais tratados:
// - saude = null          → placeholder "Sem dados" exibido
// - educacao = null       → placeholder "Sem dados" exibido
// - assistencia = null    → placeholder "Sem dados" exibido
// - todos três = null     → contado como sem_dados no resumo
// - escola = null         → exibido como "Não informada"
// - frequencia = null     → exibido como "—"
```

## Serviços do Docker Compose

```
┌──────────────────────────────────────────┐
│            docker-compose.yml            │
│                                          │
│  postgres:5432  ──▶  backend:8080        │
│  (healthcheck)       (aguarda o pg)      │
│                                          │
│  frontend:3000  ──▶  backend:8080        │
│  (Next.js)           (via API_URL)       │
│                                          │
│  navegador      ──▶  localhost:3000      │
│                 ──▶  localhost:8080      │
└──────────────────────────────────────────┘
```
