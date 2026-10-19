"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/cn";
import type { ProductImageData } from "@/types/catalog";

type ProductGalleryProps = {
  images: ProductImageData[];
  /** Usada quando o produto não tem nenhuma imagem (placeholder). */
  fallback: ProductImageData;
};

/** Foto principal + miniaturas (só quando há mais de uma foto). */
export function ProductGallery({ images, fallback }: ProductGalleryProps) {
  const fotos = images.length > 0 ? images : [fallback];
  const [indice, setIndice] = useState(0);
  const atual = fotos[indice] ?? fotos[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface-muted">
        <ProductImage
          src={atual.url}
          alt={atual.alt}
          className="object-contain p-10 sm:p-14"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2" role="group" aria-label="Fotos do produto">
          {fotos.map((foto, i) => (
            <button
              key={foto.url}
              type="button"
              aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
              aria-pressed={i === indice}
              onClick={() => setIndice(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border bg-surface-muted transition-colors",
                i === indice
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-border-strong",
              )}
            >
              <ProductImage src={foto.url} alt="" className="object-contain p-1.5" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
