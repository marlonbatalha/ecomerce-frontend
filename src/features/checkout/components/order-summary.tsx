import { ProductImage } from "@/components/product-image";
import { Card } from "@/components/ui/card";
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
    <Card className="p-5 lg:sticky lg:top-32">
      <h2 className="mb-4 font-semibold">Resumo do pedido</h2>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
              <ProductImage
                src={item.imageUrl}
                alt={item.imageAlt}
                className="object-contain p-1.5"
                sizes="56px"
              />
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background tabular-nums">
                {item.quantity}
              </span>
            </div>
            <p className="min-w-0 flex-1 truncate text-sm">{item.name}</p>
            <p className="shrink-0 text-sm font-medium tabular-nums">
              {formatCurrency(item.priceInCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatCurrency(subtotalInCents)}</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt>Frete</dt>
          <dd className="tabular-nums">{formatCurrency(shippingInCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="text-lg tracking-tight tabular-nums">{formatCurrency(totalInCents)}</dd>
        </div>
      </dl>
    </Card>
  );
}
