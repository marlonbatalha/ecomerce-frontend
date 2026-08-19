import { ProductImage } from "@/components/product-image";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types/cart";

export function OrderSummary({
  items,
  shippingInCents,
}: {
  items: CartItem[];
  shippingInCents: number;
}) {
  const subtotalInCents = items.reduce(
    (total, item) => total + item.priceInCents * item.quantity,
    0,
  );
  const totalInCents = subtotalInCents + shippingInCents;

  return (
    <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Resumo do pedido
      </h2>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 rounded bg-zinc-100 dark:bg-zinc-900">
              <ProductImage
                src={item.imageUrl}
                alt={item.imageAlt}
                className="object-contain p-1.5"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {item.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Qtd. {item.quantity}</p>
            </div>
            <p className="shrink-0 text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {formatCurrency(item.priceInCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-1.5 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(subtotalInCents)}</dd>
        </div>
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <dt>Frete</dt>
          <dd>{formatCurrency(shippingInCents)}</dd>
        </div>
        <div className="flex justify-between pt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          <dt>Total</dt>
          <dd>{formatCurrency(totalInCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
