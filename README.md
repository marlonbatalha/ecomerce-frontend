# ecomerce-frontend

Frontend do e-commerce (Next.js App Router), consumindo uma API própria desenvolvida em repositório separado.

Veja o plano completo do projeto em [`docs/plano-ecommerce.md`](./docs/plano-ecommerce.md).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) — testes unitários/componentes
- [Playwright](https://playwright.dev) — testes E2E
- [MSW](https://mswjs.io) — mocks de API (dev sem backend pronto + testes)
- ESLint + Prettier, Husky + lint-staged, Commitlint ([Conventional Commits](https://www.conventionalcommits.org/))

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

Copie `.env.example` para `.env.local` e ajuste conforme necessário.

## Scripts

| Script                         | Descrição                                                       |
| ------------------------------ | --------------------------------------------------------------- |
| `pnpm dev`                     | Sobe o servidor de desenvolvimento                              |
| `pnpm build`                   | Build de produção                                               |
| `pnpm start`                   | Sobe o build de produção                                        |
| `pnpm lint` / `lint:fix`       | ESLint                                                          |
| `pnpm format` / `format:check` | Prettier                                                        |
| `pnpm typecheck`               | `tsc --noEmit`                                                  |
| `pnpm test`                    | Testes unitários (Vitest)                                       |
| `pnpm test:watch`              | Testes unitários em modo watch                                  |
| `pnpm test:coverage`           | Testes unitários com cobertura                                  |
| `pnpm test:e2e`                | Testes E2E (Playwright — requer `pnpm exec playwright install`) |

## Estrutura de pastas

Ver seção 4 de [`docs/plano-ecommerce.md`](./docs/plano-ecommerce.md#4-estrutura-de-pastas-proposta).

```
src/
├─ app/          # rotas (Next.js App Router)
├─ components/   # componentes de UI reutilizáveis
├─ features/     # lógica por domínio (carrinho, checkout, catálogo, conta)
├─ lib/          # clients de API, utilitários, config
├─ hooks/        # hooks compartilhados
├─ mocks/        # handlers MSW (dev + testes)
├─ styles/       # config Tailwind, estilos globais
└─ types/        # tipos compartilhados (contratos com a API)
tests/
├─ unit/         # Vitest + React Testing Library
└─ e2e/          # Playwright
```

## Commits

Mensagens de commit seguem [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`...), validado pelo Commitlint no hook `commit-msg`. O hook `pre-commit` roda lint-staged (ESLint + Prettier) nos arquivos alterados.
