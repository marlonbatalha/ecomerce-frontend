/**
 * Único lugar que lê `NEXT_PUBLIC_API_MOCKING` pra decidir se o app usa dado
 * fictício (`src/mocks/data`) em vez de chamar a API própria de verdade
 * (`apiFetch`, em `client.ts`). Extraído de `catalog.ts`/`orders.ts`, que
 * tinham a mesma função duplicada — qualquer outro lugar que precise dessa
 * checagem (ex.: `src/mocks/init.ts`, que liga o worker do MSW) importa
 * daqui em vez de reler a env var direto.
 *
 * É uma flag de configuração fixa (definida em build/deploy), não uma
 * decisão em tempo de execução — não é "se o backend não responder, usa
 * mock". Uma falha real de rede em `apiFetch` continua sendo um erro de
 * verdade (`ApiError`/exceção), nunca cai pra dado fictício.
 */
export function mockingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
}
