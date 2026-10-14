import { SearchIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/card";
import type { ProductListItem } from "@/types/catalog";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<SearchIcon className="h-7 w-7" />}
        title="Nenhum produto encontrado"
        description="Tente buscar por outro termo ou explore outra categoria."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
