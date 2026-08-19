import { apiFetch } from "@/lib/api/client";
import { delay } from "@/lib/delay";
import { createOrderRecord } from "@/mocks/data/orders-queries";
import type { CreateOrderInput, OrderSummary } from "@/types/order";

function mockingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
}

/**
 * "Cria" o pedido — no mock, isso simula tanto a orquestração de
 * pedido/pagamento que a API própria fará (seção 1.7/2.9 do plano) quanto a
 * chamada ao gateway de pagamento (ainda não escolhido — ver Próximos
 * Passos do plano). Nenhum dado de pagamento sai do navegador nesse modo.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderSummary> {
  if (mockingEnabled()) {
    await delay(900); // simula latência de rede + processamento do pagamento
    return createOrderRecord(input);
  }

  return apiFetch<OrderSummary>("/orders", { method: "POST", json: input });
}
