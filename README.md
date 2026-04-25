# Desafio Técnico — Full-stack Pleno

# Instruções

## Deploy
Projeto disponível em: [Link](https://prefeitura-rio-desafio.vercel.app/)

ou

Para rodar localmente:
1. Clone o repositório
2. Acesse a pasta do projeto: `cd prefeitura-rio-desafio`
    1. Se quiser crie um arquivo `.env` na raiz do projeto baseado no `.env.example`.
3. Suba os containers: `docker compose up`
4. Acesse `http://localhost:3000` ou onde configurar no `.env` no seu navegador


## Decisões arquiteturais e trade-offs

### Pensamento e Arquitetura
- Models, Arquitetura e Fluxo de Uso estão no arquivo `docs/architecture.md`

### Backend
- **Go 1.24+ com Gin**: Escolhi Go por conveniência pessoal e querer aprender mais sobre a linguagem. Acredito que qualquer linguagem poderia ser usada para esse desafio e iria ter a mesma perfomance e velocidade de desenvolvimento.
- **Seed ao iniciar**: Optei por carregar os dados do `data/seed.json` diretamente na memória ao iniciar o servidor, poderia ter feito por migração que surgiria quase o mesmo efeito e seria verificado apenas 1x em um unico servidor, contra a escolha de ao inciar o servidor que iria checar se a base está vazia sempre que o deploys atualizasse.
- **Dados faltantes**: A opção que abordei para lidar com esse caso é apenas informar que a criança não tem dados para aquela área, idealmente deveria notificar o técnico e o serviço faltante para que esse problema seja resolvido em um tempo determinado, essa abordagem não foi feita dado o desconhecimento na profundidade e contexto do projeto.

### Frontend
- **Vitest e React Testing Library(RTL)**: Optei por usar o Vitest para os testes, pois é uma ferramenta leve e fácil de configurar, além de ser compatível com o Next.js e TypeScript.
- **Leaflet**: Para a visualização de mapas, escolhi o Leaflet por ser uma biblioteca de código aberto e amplamente utilizada para mapas interativos, além de ser fácil de integrar com React e também eu tinha algum conhecimento anterior em estágio.

### Credenciais de teste
- login: `tecnico@prefeitura.rio`
- senha: `painel@2024`


### O que faria diferente com mais tempo
- Principalmente entenderia mais profundamente o contexto do projeto, para entender melhor as necessidades dos técnicos de campo e como eles usam o painel e também a necessidade das crianças e instituições, isso ajudaria a tomar decisões mais informadas sobre a interface e funcionalidades. Com um melhor conhecimento do contexto apra qual estou desenvolvemtne aplicar Engenharia de Software deixaria o projeto mais robusto e fácil de ser desenvolvido.
- **Backend**: Mudaria o seed para ser feito por migração, isso facilitaria a manutenção e o controle dos dados, além de ser mais escalável para um ambiente de produção.
- **Segurança**: Implementaria uma camada de segurança mais robusta, como criptografia de senhas e proteção contra ataques comuns (ex: SQL injection, XSS).
- **APIs**: Adicionaria mais endpoints para permitir operações adicionais, como criação, atualização e exclusão de crianças, além de endpoints para gerenciar técnicos e suas permissões.
- **Acessibilidade**: Investiria mais tempo em garantir que a interface seja acessível para todos os usuários, incluindo aqueles com deficiências, seguindo as diretrizes de acessibilidade da web (WCAG).


---

## Contexto

A Prefeitura acompanha crianças em situação de vulnerabilidade social cruzando informações de três áreas: saúde, educação e assistência social. Os técnicos de campo precisam de um painel para identificar rapidamente quais crianças têm alertas ativos — vacinas atrasadas, frequência escolar baixa, benefícios suspensos — e registrar o acompanhamento realizado.

Sua tarefa é construir esse painel do zero: backend, frontend e a integração entre os dois.

---

## O que construir

### Backend

Uma API que serve os dados das crianças acompanhadas. O repositório inclui `data/seed.json` com 25 crianças fictícias — você decide como carregá-los e armazená-los, mas a decisão deve estar documentada.

**Endpoints necessários:**

- `POST /auth/token` — autentica um técnico e retorna um JWT. Credenciais de teste: `tecnico@prefeitura.rio` / `painel@2024`
- `GET /children` — lista crianças com suporte a filtros (bairro, presença de alertas, status de revisão) e paginação
- `GET /children/:id` — detalhe completo de uma criança
- `GET /summary` — agrega os dados para o painel: total de crianças, quantas têm alertas por área, quantas já foram revisadas
- `PATCH /children/:id/review` — registra que o técnico autenticado revisou o caso (requer JWT)

Os paths acima são sugestão. O JWT gerado deve conter o campo `preferred_username` com o e-mail do técnico autenticado.

### Frontend (Next.js + TypeScript)

Um painel funcional que consome essa API. Esperamos encontrar:

- **Login** com proteção de rotas e redirecionamento automático quando o JWT expirar
- **Dashboard** com cards de resumo a partir do `GET /summary`
- **Lista de crianças** com filtros funcionais (bairro, alertas, status de revisão) e paginação
- **Detalhe da criança** mostrando o status nas três áreas (saúde, educação, assistência social)
- **Ação de marcar como revisado** via `PATCH /children/:id/review` com feedback visual

Um ponto importante: nem todas as crianças têm dados nas três áreas — algumas aparecem só na saúde, outras têm dados de educação e assistência social mas não de saúde. O painel precisa lidar com esses casos de forma útil, não só deixar o campo em branco.

Pense em quem vai usar isso: um técnico de campo que acessa o painel várias vezes ao dia, muitas vezes num celular ou num computador mais simples. Interface responsiva de 375px a 1440px.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Go 1.24+ (Gin) ou Node.js — justifique a escolha |
| Frontend | Next.js 14+ com TypeScript (App Router) |
| Estilização | Tailwind CSS — ou justifique outra escolha |
| Infraestrutura | Docker — `docker compose up` tem que subir tudo do zero |

Bibliotecas de componentes, clientes HTTP e outras dependências são escolha sua — documente o raciocínio.

---

## Entregáveis

1. **Repositório Git público** com histórico de commits que mostre como o trabalho evoluiu
2. **`docker compose up`** deve subir a aplicação completa sem configuração adicional
3. **README atualizado** cobrindo:
   - Como rodar o projeto localmente
   - Decisões arquiteturais e trade-offs
   - Credenciais de teste
   - O que faria diferente com mais tempo
4. **Envio**: responda ao e-mail de convite com o link do repositório (ou deploy público)

> Queremos conseguir abrir `http://localhost:3000`, fazer login, usar o painel e entender o que está acontecendo — sem precisar perguntar nada.

---

## O que avaliamos

- Qualidade do código e organização do projeto
- Clareza e consistência na construção da API e integração entre frontend e backend
- Boas práticas de desenvolvimento (clean code, componentização, modularidade)
- Tratamento de dados, incluindo cenários com informações incompletas ou inconsistentes
- Usabilidade, responsividade e clareza da interface, especialmente em contextos reais de uso
- Gestão de estado e comunicação eficiente com a API
- Segurança básica da aplicação (autenticação e proteção de rotas)
- Documentação e capacidade de comunicar decisões e trade-offs

Os dados do seed têm casos-limite intencionais — crianças sem dados em nenhum sistema, com alertas em todas as áreas ao mesmo tempo, com dados parciais. Como o sistema se comporta nesses casos é parte do que avaliamos.

---

## Diferenciais

Não são obrigatórios, mas agregam:

- **shadcn/ui**: uso da biblioteca de componentes no frontend
- **Testes**: unitários no backend, de componente no frontend, E2E com Playwright
- **Acessibilidade**: navegação por teclado, ARIA labels, contraste adequado (WCAG AA)
- **Deploy publicado**: URL acessível sem configuração local (Vercel + Render, Railway ou equivalente)
- **Visualizações**: gráficos sobre os dados agregados, mapa de calor por bairro
- **Dark mode**

---

Dúvidas: **selecao.pcrj@gmail.com**
