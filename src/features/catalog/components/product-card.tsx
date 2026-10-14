import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import type { ProductListItem } from "@/types/catalog";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elevated"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        <ProductImage
          src={product.imageUrl}
          alt={product.imageAlt}
          className={`object-contain p-6 transition-transform duration-300 group-hover:scale-105 ${
            product.inStock ? "" : "opacity-60 grayscale"
          }`}
        />
        {!product.inStock && (
          <span className="absolute top-3 left-3 rounded-full bg-foreground/90 px-2.5 py-1 text-xs font-medium text-background">
            Esgotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium">{product.name}</h3>
        <p className="mt-auto text-base font-semibold tracking-tight tabular-nums">
          {formatCurrency(product.priceInCents)}
        </p>
      </div>
    </Link>
  );
}
