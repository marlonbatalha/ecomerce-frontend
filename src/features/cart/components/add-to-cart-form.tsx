"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CartIcon, CheckIcon } from "@/components/icons";
import { Button, buttonClasses } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCartStore } from "@/features/cart/store";
import type { Product } from "@/types/catalog";

export function AddToCartForm({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  if (!product.inStock) {
    return (
      <Button disabled tamanho="lg" variante="outline" className="mt-8 w-full">
        Produto esgotado
      </Button>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
          onIncrement={() => setQuantity((q) => Math.min(99, q + 1))}
        />

        <Button
          tamanho="lg"
          className="min-w-[14rem] flex-1"
          onClick={() => {
            addItem(product, quantity);
            setQuantity(1);
            setJustAdded(true);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setJustAdded(false), 2500);
          }}
        >
          {justAdded ? (
            <>
              <CheckIcon className="h-4 w-4" />
              Adicionado ✓
            </>
          ) : (
            <>
              <CartIcon className="h-4 w-4" />
              Adicionar ao carrinho
            </>
          )}
        </Button>
      </div>

      {justAdded && (
        <p
          role="status"
          className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-success-soft px-4 py-3 text-sm text-success"
        >
          <span className="font-medium">Produto adicionado ao carrinho.</span>
          <Link
            href="/carrinho"
            className={buttonClasses({
              variante: "ghost",
              tamanho: "sm",
              className: "text-success hover:bg-success/10 hover:text-success",
            })}
          >
            Ver carrinho
          </Link>
        </p>
      )}
    </div>
  );
}
