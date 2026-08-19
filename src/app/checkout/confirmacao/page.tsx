"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@/components/icons";
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

      <div className="flex flex-col items-center py-6 text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-500" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pedido confirmado!
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Pedido <strong>{order.id}</strong> — pagamento via{" "}
          {PAYMENT_METHOD_LABELS[order.paymentMethod]}.
        </p>
      </div>

      <div className="mx-auto max-w-md rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatCurrency(item.priceInCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1.5 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(order.subtotalInCents)}</dd>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <dt>Frete</dt>
            <dd>{formatCurrency(order.shippingInCents)}</dd>
          </div>
          <div className="flex justify-between pt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <dt>Total</dt>
            <dd>{formatCurrency(order.totalInCents)}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Enviar para</p>
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

      <div className="mt-8 flex justify-center">
        <Link
          href="/produtos"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
