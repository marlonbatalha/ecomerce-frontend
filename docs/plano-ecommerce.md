# Plano de Criação do E-commerce — Frontend

> Repositório: `ecomerce-frontend`
> Escopo: aplicação frontend do e-commerce, consumindo uma API/backend própria (custom), desenvolvida separadamente.
> Status: rascunho inicial — a revisar conforme decisões forem tomadas.

## Sumário

1. [Infraestrutura](#1-infraestrutura)
2. [Tecnologias](#2-tecnologias)
3. [Arquitetura da Aplicação](#3-arquitetura-da-aplicação)
4. [Estrutura de Pastas Proposta](#4-estrutura-de-pastas-proposta)
5. [Fases do Projeto / Roadmap](#5-fases-do-projeto--roadmap)
6. [Requisitos Não Funcionais](#6-requisitos-não-funcionais)
7. [Próximos Passos](#7-próximos-passos)

---

## 1. Infraestrutura

Como o backend será construído sob medida (API própria, em repositório separado), o frontend precisa de uma infraestrutura enxuta, focada em performance, deploy contínuo e boa integração com essa API.

### 1.1 Hospedagem e Deploy

- **Plataforma**: Vercel (recomendado para Next.js — build, edge network e preview deploys nativos) como primeira opção; alternativas: Netlify ou AWS Amplify caso já exista padronização em AWS.
- **Ambientes**:
  - `production` — branch `main`, domínio final.
  - `staging` — branch `develop`, domínio tipo `staging.loja.com.br`, aponta para API de staging.
  - `preview` — deploy automático por Pull Request (URLs efêmeras), útil para revisão visual.
- **Deploy**: automático a cada push/merge nas branches acima, com build gerando artefatos estáticos + funções serverless/edge quando necessário (ex.: rotas de API do Next, webhooks).

### 1.2 CI/CD

- **GitHub Actions** com pipeline mínimo:
  1. Instalação de dependências (cache de `node_modules`).
  2. Lint (`eslint`) + checagem de tipos (`tsc --noEmit`).
  3. Testes unitários (`vitest`/`jest`).
  4. Build de produção.
  5. Testes E2E (Playwright) rodando contra o preview deploy ou build local, antes do merge em `main`.
  6. Deploy (delegado à Vercel via integração Git, ou `vercel deploy` na Action se preferir controle manual).
- **Estratégia de branches**: `main` (produção) → `develop` (staging) → `feature/*` (via PR obrigatório, com revisão de código).
- **Convenção de commits**: Conventional Commits (`feat:`, `fix:`, `chore:`...) + Commitlint, para permitir changelog automático no futuro.

### 1.3 Domínio, DNS e Certificados

- Registro do domínio (ex.: Registro.br para `.com.br`, ou provedor internacional).
- DNS gerenciado via **Cloudflare** (proxy, cache adicional, proteção DDoS básica) ou diretamente na Vercel.
- Certificado SSL/TLS automático (Let's Encrypt via Vercel/Cloudflare) — HTTPS obrigatório em todos os ambientes, inclusive staging.

### 1.4 CDN, Cache e Mídia

- Assets estáticos (JS/CSS/fonts) servidos automaticamente pela Edge Network da hospedagem.
- Imagens de produto:
  - Armazenamento em bucket externo (Cloudflare R2, AWS S3 ou similar) gerenciado pelo backend/admin.
  - Otimização e entrega via `next/image` ou serviço dedicado (Cloudinary/Imgix) se o volume/variedade de imagens justificar.
- Política de cache HTTP definida por rota: páginas de catálogo com ISR (revalidação periódica), páginas de conteúdo estático com cache longo, checkout sempre dinâmico/sem cache.

### 1.5 Observabilidade e Monitoramento

- **Erros de frontend**: Sentry (captura de exceptions JS, source maps por release).
- **Performance real**: Vercel Analytics / Web Vitals (LCP, CLS, INP) monitorados por página.
- **Uptime**: monitor externo simples (ex.: UptimeRobot/Better Uptime) apontando para a home e para o health-check da API.
- **Logs de build/deploy**: nativos da plataforma de hospedagem.

### 1.6 Segurança de Infraestrutura

- HTTPS forçado (HSTS) em todos os ambientes.
- Cabeçalhos de segurança: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` (configurados via middleware/`next.config`).
- Gestão de segredos: variáveis de ambiente por ambiente (dev/staging/prod) nos secrets da Vercel e do GitHub Actions — nunca commitadas no repositório (`.env.local` no `.gitignore`).
- Proteção básica contra bots/rate limiting na borda (Cloudflare), especialmente em rotas de busca e formulários (login, newsletter, cupom).

### 1.7 Integração com o Backend (API própria)

- Backend custom vive em repositório separado e expõe uma API (REST ou GraphQL — decisão a alinhar com quem for construí-lo).
- Frontend consome a API via `BACKEND_URL` (variável server-only, sem prefixo `NEXT_PUBLIC_`) — o browser nunca fala direto com o backend nem conhece sua URL real (host do App Service/VM). Toda chamada roda em Server Component/Route Handler/Server Action; um client component que precise disparar uma mutação (ex.: `checkout/pagamento`) chama uma Server Action (`"use server"`), que faz o fetch no servidor — decidido em 2026-09-06 depois de notar que `NEXT_PUBLIC_API_URL` (versão anterior) vazava a URL de infraestrutura do backend no bundle do cliente.
- Um ambiente de API por ambiente de frontend: `api-dev`, `api-staging`, `api` (produção) — evita staging do front acidentalmente escrever em dados de produção.
- CORS liberado no backend apenas para os domínios conhecidos do frontend (produção, staging, previews via wildcard controlado).
- Autenticação: token JWT (access + refresh) ou sessão via cookie `httpOnly` — decisão a formalizar na seção de tecnologias/auth abaixo, mas a infraestrutura precisa suportar cookies cross-domain se front e API ficarem em domínios/subdomínios diferentes.

### 1.8 Custos estimados (ordem de grandeza, a validar)

| Item                   | Serviço sugerido         | Faixa de custo inicial         |
| ---------------------- | ------------------------ | ------------------------------ |
| Hospedagem frontend    | Vercel (plano Pro)       | ~US$20/mês                     |
| DNS/CDN/WAF            | Cloudflare (Free/Pro)    | US$0–20/mês                    |
| Domínio                | Registro.br / Namecheap  | ~R$40/ano                      |
| Monitoramento de erros | Sentry (plano free/team) | US$0–26/mês                    |
| Storage de imagens     | Cloudflare R2 / S3       | pago por uso (baixo no início) |

---

## 2. Tecnologias

### 2.1 Core

- **Next.js** (React, App Router) — SSR/SSG/ISR nativo, essencial para SEO de páginas de produto e categoria.
- **TypeScript** — tipagem em todo o projeto, incluindo contratos da API (tipos gerados ou compartilhados).

### 2.2 UI e Estilização

- **Tailwind CSS** para estilização utilitária.
- **shadcn/ui** (ou Radix UI diretamente) para componentes acessíveis de base (modais, dropdowns, tabs) — customizáveis, sem lock-in de design system pesado.
- Design tokens simples (cores, espaçamentos, tipografia) centralizados no Tailwind config.

### 2.3 Dados e Estado

- **TanStack Query (React Query)** para fetch, cache e revalidação dos dados vindos da API própria (produtos, categorias, pedidos).
- **Zustand** para estado de UI/cliente (carrinho, filtros aplicados, estado de modais) — leve, sem boilerplate de Redux.

### 2.4 Formulários e Validação

- **React Hook Form** + **Zod** — formulários de checkout, login/cadastro, endereço, com validação tipada compartilhável com os contratos da API.

### 2.5 Testes

- **Vitest** + **React Testing Library** para testes unitários/componentes.
- **Playwright** para testes E2E dos fluxos críticos (busca → produto → carrinho → checkout).
- Testes de contrato/mocks da API com **MSW (Mock Service Worker)** para não depender do backend real em CI.

### 2.6 Qualidade de Código

- **ESLint** + **Prettier** com config compartilhada.
- **Husky** + **lint-staged** (pre-commit) e **Commitlint** (mensagens de commit).

### 2.7 SEO e Performance

- `next-seo` (ou metadata API nativa do App Router) para title/description/OpenGraph por página.
- Dados estruturados (schema.org `Product`, `BreadcrumbList`, `Offer`) para rich snippets no Google.
- Sitemap e `robots.txt` gerados automaticamente no build.
- Otimização de imagens via `next/image`, lazy loading, fontes com `next/font`.

### 2.8 Internacionalização (se necessário)

- `next-intl` caso o e-commerce precise atender mais de um idioma/moeda desde o início; caso contrário, deixar preparado mas não implementar na v1.

### 2.9 Pagamentos e Checkout

- Integração via SDK do gateway escolhido (ex.: Stripe, Mercado Pago, PagSeguro/PagBank) no frontend, com a orquestração de pedido/pagamento feita pela API própria no backend.
- Checkout com etapas claras: carrinho → identificação → endereço/frete → pagamento → confirmação.

### 2.10 Autenticação

- Fluxo de login/cadastro consumindo endpoints da API própria (JWT access + refresh token, ou sessão via cookie `httpOnly` gerenciada pelo backend).
- Rotas protegidas no Next.js via middleware, verificando sessão antes de renderizar áreas de conta/pedidos.

### 2.11 Analytics e Marketing

- Google Analytics 4 / Google Tag Manager para eventos de e-commerce (visualização de produto, add-to-cart, checkout, compra).
- Meta Pixel (se houver campanhas em Instagram/Facebook Ads).
- Heatmaps/gravação de sessão (Microsoft Clarity — gratuito) para entender comportamento no funil de compra.

---

## 3. Arquitetura da Aplicação

```
Cliente (browser)
      │
      ▼
CDN / Edge Network (Vercel + Cloudflare)
      │
      ▼
Next.js App (SSR / ISR / rotas client-side)
      │  fetch (TanStack Query)
      ▼
API própria (backend custom — repositório separado)
      │
      ▼
Banco de dados + serviços (pagamento, frete, e-mail)
```

- O frontend não acessa banco de dados nem serviços de terceiros diretamente — tudo passa pela API própria, que é a fonte da verdade e concentra as regras de negócio.
- Páginas de catálogo (home, categoria, produto) usam **ISR** para equilibrar SEO/performance com dados atualizados.
- Áreas autenticadas (conta, pedidos) e checkout são renderizadas dinamicamente (sem cache público).

---

## 4. Estrutura de Pastas Proposta

```
ecomerce-frontend/
├─ docs/                  # documentação do projeto (este arquivo, ADRs, etc.)
├─ src/
│  ├─ app/                # rotas (Next.js App Router)
│  ├─ components/         # componentes de UI reutilizáveis
│  ├─ features/           # lógica por domínio (carrinho, checkout, catálogo, conta)
│  ├─ lib/                # clients de API, utilitários, config
│  ├─ hooks/               # hooks compartilhados
│  ├─ styles/              # config Tailwind, estilos globais
│  └─ types/               # tipos compartilhados (contratos com a API)
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ public/                 # assets estáticos
└─ .github/workflows/      # pipelines CI/CD
```

---

## 5. Fases do Projeto / Roadmap

| Fase                           | Entregas principais                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **0. Setup**                   | Repositório configurado (Next.js + TS + Tailwind), lint/format/testes, CI básico, deploy de "hello world" na Vercel (dev/staging/prod). |
| **1. Catálogo**                | Home, listagem de categoria/busca, página de produto — consumindo API própria (ou mocks via MSW enquanto backend não está pronto).      |
| **2. Carrinho e Checkout**     | Carrinho persistente, fluxo de checkout completo, integração com gateway de pagamento.                                                  |
| **3. Conta do usuário**        | Login/cadastro, histórico de pedidos, endereços salvos, favoritos.                                                                      |
| **4. Integrações e Marketing** | Cálculo de frete, cupons, analytics/GTM, e-mails transacionais (via backend).                                                           |
| **5. Otimização e QA**         | Auditoria de performance (Core Web Vitals), acessibilidade (WCAG AA), testes E2E cobrindo fluxo de compra completo.                     |
| **6. Lançamento**              | Deploy em produção, monitoramento ativo (Sentry + uptime), plano de rollback.                                                           |
| **7. Pós-lançamento**          | Iteração baseada em analytics/heatmaps, otimizações de conversão.                                                                       |

---

## 6. Requisitos Não Funcionais

- **Performance**: metas de Core Web Vitals — LCP < 2.5s, CLS < 0.1, INP < 200ms nas páginas principais.
- **SEO**: páginas de produto e categoria indexáveis via SSR/ISR, dados estruturados válidos.
- **Acessibilidade**: WCAG 2.1 nível AA nos fluxos críticos (navegação por teclado, contraste, labels em formulários).
- **Segurança**: sem segredos no client-side, cabeçalhos de segurança configurados, dependências com auditoria automática (`npm audit`/Dependabot).
- **Escalabilidade**: front desacoplado do backend permite escalar/hospedar cada parte de forma independente.
- **Disponibilidade**: alvo inicial de 99.9% (limitado principalmente pela disponibilidade da API própria).

---

## 7. Próximos Passos

1. Validar com quem for construir o backend: protocolo da API (REST vs GraphQL), formato de autenticação (JWT vs cookie de sessão) e contrato inicial de endpoints (produtos, carrinho, pedidos, usuário).
2. Criar o projeto Next.js + TypeScript + Tailwind neste repositório (Fase 0).
3. Configurar CI (GitHub Actions) e deploy automático na Vercel para os três ambientes.
4. Definir o gateway de pagamento e o provedor de frete a serem integrados.
5. Detalhar wireframes/design das páginas principais antes de iniciar a Fase 1.

---

_Documento vivo — atualizar conforme decisões técnicas forem confirmadas._
