import { cartSubtotalInCents } from "@/features/cart/selectors";
import { FLAT_SHIPPING_CENTS } from "@/features/checkout/constants";
import type { CreateOrderInput, OrderSummary } from "@/types/order";

function generateOrderId(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${random}`;
}

/** Fonte única de verdade para "criar" um pedido mockado — usada tanto pelo
 * handler MSW (POST /orders) quanto diretamente por `src/lib/api/orders.ts`
 * quando o mock está ligado. Ver o comentário em `catalog-queries.ts` sobre
 * por que essa camada existe separada dos handlers. */
export function createOrderRecord(input: CreateOrderInput): OrderSummary {
  const subtotalInCents = cartSubtotalInCents(input.items);

  return {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    items: input.items,
    identification: input.identification,
    address: input.address,
    paymentMethod: input.paymentMethod,
    subtotalInCents,
    shippingInCents: FLAT_SHIPPING_CENTS,
    totalInCents: subtotalInCents + FLAT_SHIPPING_CENTS,
  };
}
