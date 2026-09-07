"use server";

import { apiFetch } from "@/lib/api/client";
import { mockingEnabled } from "@/lib/api/mocking";
import { delay } from "@/lib/delay";
import { createOrderRecord } from "@/mocks/data/orders-queries";
import type { CreateOrderInput, OrderSummary } from "@/types/order";

/**
 * "Cria" o pedido — no mock, isso simula tanto a orquestração de
 * pedido/pagamento que a API própria fará (seção 1.7/2.9 do plano) quanto a
 * chamada ao gateway de pagamento (ainda não escolhido — ver Próximos
 * Passos do plano). Nenhum dado de pagamento sai do navegador nesse modo.
 *
 * Server Action ("use server" acima): quem chama isso é `checkout/pagamento/page.tsx`,
 * um client component. Sem isso, o fetch pra API própria (`apiFetch`, dentro de
 * `client.ts`) rodaria no browser e precisaria de uma variável NEXT_PUBLIC_* —
 * expondo a URL real do backend (host do App Service/VM) no bundle do cliente.
 * Como Server Action, o código roda só no servidor; o browser só enxerga uma
 * chamada RPC pro próprio Next.js, nunca a URL do backend (ver BACKEND_URL em
 * client.ts).
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderSummary> {
  if (mockingEnabled()) {
    await delay(900); // simula latência de rede + processamento do pagamento
    return createOrderRecord(input);
  }

  return apiFetch<OrderSummary>("/orders", { method: "POST", json: input });
}
