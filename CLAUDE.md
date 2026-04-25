# Guia de Desenvolvimento - Painel de Acompanhamento Social

## Comandos Úteis
### Infraestrutura
- `docker compose up --build`: Sobe todo o ambiente (Go + Next.js + Postgres).
- `docker compose down`: Encerra os serviços.

### Backend (Go)
- `go run cmd/api/main.go`: Executa o servidor localmente.
- `go test ./...`: Executa todos os testes unitários.
- `go test -tags integration -timeout 120s ./...`: Executa testes de integração (requer Docker).
- `./scripts/test-coverage.sh`: Todos os testes com cobertura, excluindo pacotes de infraestrutura (`cmd/api`, `internal/database`).
- `go mod tidy`: Limpa e atualiza dependências.

### Frontend (Next.js)
- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Gera o build de produção.
- `npm run lint`: Executa a verificação de linting.

## Padrões de Código
- **Arquitetura (Backend):** Camadas (Controller -> Service -> Repository).
- **Tratamento de Erros:** Erros em Go devem ser tratados explicitamente; retornar mensagens claras via JSON na API.
- **Estilização (Frontend):** Mobile-first utilizando Tailwind CSS.
- **Componentes:** Utilizar Shadcn/UI para consistência visual.
- **Convenção de Commits:** [Conventional Commits](https://www.conventionalcommits.org/).

## Decisões Técnicas
- **Data Seed:** O `seed.json` é processado na inicialização do banco de dados (PostgreSQL) para garantir persistência e facilitar filtros complexos via SQL.
- **JWT:** Armazenado em `HttpOnly` cookies no frontend para maior segurança.
