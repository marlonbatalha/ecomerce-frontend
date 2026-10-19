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
  - **Implementado (2026-09-07):** armazenamento é responsabilidade do **backend** (`IArmazenamentoDeImagens` — hoje disco local do servidor, trocável por Object Storage OCI depois, nunca bucket externo tipo R2/S3 — decisão do backend, ver `ecomerce-backend/.claude/plano-ecommerce.md` seção 2.10). O frontend só recebe a URL absoluta pronta no JSON da API (`imagemPrincipalUrl`/`imagens[].url`) e a passa direto pro `next/image`; `next.config.ts` precisa liberar o host do backend em `images.remotePatterns` (lido de `BACKEND_URL` em build/start) — é o único lugar do app em que uma URL derivada de `BACKEND_URL` chega ao browser de propósito, porque imagem (diferente de dado de API) é buscada pelo browser direto, não tem como esconder.
  - Otimização e entrega via `next/image`; Cloudinary/Imgix fica como evolução futura só se volume/variedade justificar — não decidido ainda.
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
- CORS liberado no backend apenas para os domínios conhecidos do frontend (produção, staging, previews via wildcard controlado) — **na prática, com toda chamada rodando server-side (ver acima), CORS não entra em jogo hoje** (é enforcement de browser, não existe requisição cross-origin feita pelo browser); só volta a importar se algum dia um client component chamar a API direto.
- **Catálogo conectado de verdade (2026-09-07):** `getCategories`/`getCategoryBySlug`/`getProducts`/`getProductBySlug` (`src/lib/api/catalog.ts`) chamam `api/v1/categorias`/`api/v1/produtos` reais sempre, sem desvio de mock — traduzem o formato da API (português, categoria em árvore, preço decimal, sem `categorySlug`/`imageAlt`/`inStock` prontos) pro contrato `Category`/`Product` que o resto do app usa. Exigiu adicionar `Slug` a `Produto` no backend (não existia — só `Sku`). Carrinho/Checkout continuam mockados (`NEXT_PUBLIC_API_MOCKING=enabled`) — ver seção 6/Fase 3 pra quando isso for endereçado; o modelo de carrinho da API (recurso no servidor, item a item) é incompatível com o payload único que o checkout manda hoje.
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

- Gateway: **Mercado Pago (Checkout Pro)**, que substituiu o PagBank (decisão do backend). O cliente paga **no Mercado Pago** (Pix, cartão ou boleto): nenhum dado de pagamento passa pelo frontend nem pela API.
- **Implementado (2026-10-19):** carrinho no servidor (API), inclusive para visitante, mesclado no carrinho da conta ao entrar. `/checkout` numa página: endereço salvo ou novo, frete calculado pelo CEP, cupom com prévia e resumo. "Ir para o pagamento" cria o pedido na API e redireciona para o Mercado Pago, que devolve o cliente em `/checkout/confirmacao?pedido=…`. Exige login. O valor do frete e o desconto são sempre recalculados pela API.

### 2.10 Autenticação

Duas áreas distintas, com estado bem diferente:

- **Conta do cliente** — **implementada (2026-10-19)**: `/entrar`, `/cadastro` e a área `/conta` (resumo, pedidos com paginação e detalhe, endereços, dados e senha). Sessão em cookies `httpOnly` do próprio frontend (`sessao_acesso`, `sessao_renovacao`), com **renovação automática** no `src/proxy.ts`: quando o access token está para vencer, o proxy chama `/api/v1/auth/atualizar-token` e repassa o token novo à própria requisição. A API tolera renovações paralelas (responde 409 em vez de tratar como reuso de token). O cabeçalho mostra o nome lendo um cookie não-`httpOnly` só com o primeiro nome, para o layout raiz não ficar dinâmico.
- **Área administrativa `/admin`** — **implementada (2026-09-07)**, ver seção 2.10.1 abaixo.

#### 2.10.1 Área administrativa (`/admin`)

Login exclusivo pra quem tem role `admin` na API própria — não existe cadastro nem é a mesma coisa que "conta do cliente" acima (aliás, hoje a área admin é a **única** parte do app com qualquer autenticação implementada).

- **Rotas**: `/admin/login` (form, fora da guarda de rota — ver route group abaixo), `/admin` (painel com pedidos a enviar/aguardando pagamento), `/admin/pedidos` e `/admin/pedidos/[id]` (filtro por status; enviar com rastreio, marcar entregue), `/admin/categorias` (listar/criar), `/admin/produtos` (listar todos, inclusive sem estoque), `/admin/produtos/novo` (criar), `/admin/produtos/[id]` (variantes, imagens, ativar/inativar), `/admin/produtos/[id]/variantes/[varianteId]` (ajuste de estoque com motivo e histórico), `/admin/cupons` (criar, ativar/inativar), `/admin/clientes` (busca).
- **Sessão**: cookie `httpOnly` **do próprio frontend** (`admin_session`, `path=/admin`) guardando só o access token da API. Deliberadamente **não** repassa o refresh token que a API seta em `/api/v1/auth/login` (esse cookie é `SameSite=None; Secure`, escopado ao domínio do _backend_ — não faz sentido repassar pro browser já que o browser nunca fala com o backend direto, ver seção 1.7). Consequência aceita: **sem renovação automática** — sessão expira em ~15 min (igual o access token da API) e pede login de novo. Renovação automática (chamando `/api/v1/auth/atualizar-token` via um Route Handler/Server Action que faça o proxy do cookie de refresh) fica como evolução futura, não implementada.
- **Autorização**: no login (`loginAdmin`, Server Action em `src/lib/api/admin-auth.ts`), o JWT recebido é decodificado (sem verificar assinatura — seguro aqui porque veio direto da própria API confiável) só pra checar a claim de role; login recusado se não tiver `admin`.
- **Guarda de rota**: route group `src/app/admin/(protegido)/layout.tsx` — checa o cookie e redireciona pra `/admin/login` se ausente. `/admin/login` fica **fora** do route group de propósito (senão o redirect do layout entraria em loop nele mesmo).
- **Limitação conhecida**: o header/footer da loja pública (layout raiz, `src/app/layout.tsx`) aparecem em volta do admin também — layout raiz é único e compartilhado por todo o app; separar visualmente exigiria reestruturar as rotas do site inteiro em múltiplos root layouts, não feito (funciona, só não é visualmente separado).
- Mutações (criar categoria/produto, adicionar variante/imagem) são Server Actions que chamam a API própria com `Authorization: Bearer <token do cookie>` — nunca expostas ao browser como fetch direto.

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
4. ~~Definir o gateway de pagamento~~ — **resolvido em 2026-09-07: PagBank** (decisão espelhada no plano do backend). Falta integrar de verdade no checkout (hoje é mock) e definir o provedor de frete, que segue em aberto.
5. Detalhar wireframes/design das páginas principais antes de iniciar a Fase 1.
6. Conectar Carrinho/Checkout à API própria de verdade (hoje só Catálogo está conectado, ver seção 1.7) — exige decisão de arquitetura (sincronizar carrinho item a item com o backend, ou endpoint de checkout "de uma vez"), não feito ainda.
7. Implementar login/cadastro da **conta do cliente** (distinto da área admin, que já existe — ver seção 2.10).

---

_Documento vivo — atualizar conforme decisões técnicas forem confirmadas._
