"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon, PackageIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { useCartStore } from "@/features/cart/store";
import { useCheckoutStore } from "@/features/checkout/store";
import { formatCurrency } from "@/lib/format";

const PAYMENT_METHOD_LABELS = {
  pix: "Pix",
  boleto: "Boleto",
  cartao: "Cartão de crédito",
};

export default function ConfirmationPage() {
  const router = useRouter();
  const order = useCheckoutStore((state) => state.lastOrder);
  const clearCart = useCartStore((state) => state.clear);

  useEffect(() => {
    if (!order) {
      router.replace("/");
      return;
    }
    // Só limpa o carrinho depois que o pedido já existe e a confirmação
    // está de fato sendo exibida (ver comentário no passo de pagamento).
    clearCart();
  }, [order, router, clearCart]);

  if (!order) return null;

  return (
    <div>
      <CheckoutSteps current="confirmacao" />

      <div className="mx-auto max-w-xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Pedido confirmado!</h1>
          <p className="mt-2 text-muted-foreground">
            Pedido <strong className="font-semibold text-foreground">{order.id}</strong> — pagamento
            via {PAYMENT_METHOD_LABELS[order.paymentMethod]}.
          </p>
        </div>

        <Card className="mt-8 p-6">
          <ul className="space-y-2.5 text-sm">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  {item.quantity}× {item.name}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatCurrency(item.priceInCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(order.subtotalInCents)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Frete</dt>
              <dd className="tabular-nums">{formatCurrency(order.shippingInCents)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-lg tracking-tight tabular-nums">
                {formatCurrency(order.totalInCents)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex gap-3 rounded-xl bg-surface-muted p-4 text-sm">
            <PackageIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="text-muted-foreground">
              <p className="font-medium text-foreground">Enviar para</p>
              <p>
                {order.address.street}, {order.address.number}
                {order.address.complement ? ` — ${order.address.complement}` : ""}
              </p>
              <p>
                {order.address.neighborhood}, {order.address.city} - {order.address.state}
              </p>
              <p>CEP {order.address.zipCode}</p>
            </div>
          </div>
        </Card>

        <div className="mt-8 flex justify-center">
          <Link href="/produtos" className={buttonClasses({ tamanho: "lg" })}>
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
