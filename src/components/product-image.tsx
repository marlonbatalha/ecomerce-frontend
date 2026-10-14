import Image from "next/image";
import { ImageIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Mesmo caminho usado em `lib/api/catalog.ts` quando o produto ainda não tem imagem. */
const PLACEHOLDER = "/images/product-placeholder.svg";

/**
 * Wrapper sobre `next/image` para fotos de produto. Produto sem imagem ganha um placeholder
 * desenhado com os tokens do tema (o SVG estático tinha fundo claro fixo, que destoava no tema
 * escuro). Outros SVGs são servidos como `<img>` simples: o otimizador de imagens do Next não
 * processa SVG por padrão, e não há ganho de otimização em um vetor de qualquer forma.
 */
export function ProductImage({ src, alt, className, sizes, priority }: ProductImageProps) {
  if (src === PLACEHOLDER) {
    return (
      <div
        role="img"
        aria-label={alt || "Imagem do produto indisponível"}
        className="absolute inset-0 flex items-center justify-center text-muted-foreground/40"
      >
        <ImageIcon className="h-1/4 max-h-16 w-1/4 max-w-16" />
      </div>
    );
  }

  if (src.endsWith(".svg")) {
    // eslint-disable-next-line @next/next/no-img-element -- SVG local, sem otimização a fazer.
    return <img src={src} alt={alt} className={cn("h-full w-full", className)} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
      className={className}
      priority={priority}
    />
  );
}
