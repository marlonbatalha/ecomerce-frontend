import { describe, expect, it } from "vitest";
import { FLAT_SHIPPING_CENTS } from "@/features/checkout/constants";
import { createOrderRecord } from "@/mocks/data/orders-queries";
import type { CreateOrderInput } from "@/types/order";

const input: CreateOrderInput = {
  items: [
    {
      productId: "prod_1",
      slug: "produto-teste",
      name: "Produto Teste",
      priceInCents: 1000,
      imageUrl: "/images/product-placeholder.svg",
      imageAlt: "Produto teste",
      quantity: 2,
    },
  ],
  identification: { name: "Maria Silva", email: "maria@example.com", phone: "11912345678" },
  address: {
    zipCode: "01310-100",
    street: "Av. Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  },
  paymentMethod: "pix",
};

describe("createOrderRecord", () => {
  it("calcula subtotal, frete e total corretamente", () => {
    const order = createOrderRecord(input);

    expect(order.subtotalInCents).toBe(2000);
    expect(order.shippingInCents).toBe(FLAT_SHIPPING_CENTS);
    expect(order.totalInCents).toBe(2000 + FLAT_SHIPPING_CENTS);
  });

  it("gera um id único por pedido", () => {
    const first = createOrderRecord(input);
    const second = createOrderRecord(input);

    expect(first.id).not.toBe(second.id);
    expect(first.id).toMatch(/^ORD-/);
  });

  it("preserva os dados de identificação, endereço e pagamento", () => {
    const order = createOrderRecord(input);

    expect(order.identification).toEqual(input.identification);
    expect(order.address).toEqual(input.address);
    expect(order.paymentMethod).toBe("pix");
  });
});
