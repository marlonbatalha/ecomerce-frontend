import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import type { ProductListItem } from "@/types/catalog";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:shadow-md dark:border-zinc-800"
    >
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900">
        <ProductImage
          src={product.imageUrl}
          alt={product.imageAlt}
          className="object-contain p-6 transition-transform group-hover:scale-105"
        />
        {!product.inStock && (
          <span className="absolute top-2 left-2 rounded-full bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-100/90 dark:text-black">
            Esgotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {product.name}
        </h3>
        <p className="mt-auto text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {formatCurrency(product.priceInCents)}
        </p>
      </div>
    </Link>
  );
}
