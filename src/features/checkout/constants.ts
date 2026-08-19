/**
 * Frete fixo até a integração real de cálculo de frete (Fase 4 do plano —
 * fora do escopo do carrinho/checkout da Fase 2). Usado tanto na prévia do
 * resumo do pedido (passo de pagamento) quanto na criação mockada do
 * pedido (`src/mocks/data/orders-queries.ts`), pra não duplicar o valor.
 */
export const FLAT_SHIPPING_CENTS = 1990;
