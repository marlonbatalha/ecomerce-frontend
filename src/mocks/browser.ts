import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Worker MSW para uso no browser durante o desenvolvimento, enquanto a API
 * própria (backend, repositório separado) ainda não está disponível.
 * Ativar via `src/mocks/init.ts` (ou equivalente) apenas quando
 * `NEXT_PUBLIC_API_MOCKING=enabled`.
 */
export const worker = setupWorker(...handlers);
