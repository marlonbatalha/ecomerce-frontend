import { beforeEach, describe, expect, it } from "vitest";
import { cartItemCount, cartSubtotalInCents } from "@/features/cart/selectors";
import { useCartStore } from "@/features/cart/store";
import type { ProductListItem } from "@/types/catalog";

const product: ProductListItem = {
  id: "prod_1",
  slug: "produto-teste",
  name: "Produto Teste",
  priceInCents: 1000,
  categorySlug: "eletronicos",
  imageUrl: "/images/product-placeholder.svg",
  imageAlt: "Produto teste",
  inStock: true,
};

const otherProduct: ProductListItem = {
  ...product,
  id: "prod_2",
  slug: "outro-produto",
  name: "Outro Produto",
  priceInCents: 2500,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("useCartStore", () => {
  it("adiciona um item novo com a quantidade informada", () => {
    useCartStore.getState().addItem(product, 2);

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({ productId: "prod_1", quantity: 2 }),
    ]);
  });

  it("soma a quantidade ao adicionar um item já existente", () => {
    useCartStore.getState().addItem(product, 1);
    useCartStore.getState().addItem(product, 3);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it("remove um item pelo productId", () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(otherProduct);

    useCartStore.getState().removeItem("prod_1");

    expect(useCartStore.getState().items.map((i) => i.productId)).toEqual(["prod_2"]);
  });

  it("atualiza a quantidade de um item", () => {
    useCartStore.getState().addItem(product);

    useCartStore.getState().setQuantity("prod_1", 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("remove o item se a quantidade for ajustada para zero ou menos", () => {
    useCartStore.getState().addItem(product);

    useCartStore.getState().setQuantity("prod_1", 0);

    expect(useCartStore.getState().items).toEqual([]);
  });

  it("limpa o carrinho", () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(otherProduct);

    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe("cartItemCount", () => {
  it("soma as quantidades de todos os itens", () => {
    useCartStore.getState().addItem(product, 2);
    useCartStore.getState().addItem(otherProduct, 3);

    expect(cartItemCount(useCartStore.getState().items)).toBe(5);
  });
});

describe("cartSubtotalInCents", () => {
  it("soma preço x quantidade de todos os itens", () => {
    useCartStore.getState().addItem(product, 2); // 1000 * 2
    useCartStore.getState().addItem(otherProduct, 1); // 2500 * 1

    expect(cartSubtotalInCents(useCartStore.getState().items)).toBe(4500);
  });
});
