import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * Servidor MSW para uso em testes (Node/Vitest). Ver `tests/unit/setup.ts`.
 */
export const server = setupServer(...handlers);
