"use client";

import { useState } from "react";
import { useCartStore } from "@/features/cart/store";
import type { Product } from "@/types/catalog";

export function AddToCartForm({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product.inStock) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-full bg-zinc-200 px-6 py-3 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
      >
        Produto esgotado
      </button>
    );
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
        <button
          type="button"
          aria-label="Diminuir quantidade"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center text-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Aumentar quantidade"
          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          className="flex h-10 w-10 items-center justify-center text-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          addItem(product, quantity);
          setQuantity(1);
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 2000);
        }}
        className="flex-1 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        {justAdded ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
