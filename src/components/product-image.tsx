import Image from "next/image";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Wrapper sobre `next/image` para fotos de produto. SVGs (usados hoje como
 * placeholder, enquanto não há storage/CDN real de imagens — seção 1.4 do
 * plano) são servidos como `<img>` simples: o otimizador de imagens do
 * Next não processa SVG por padrão, e não há ganho de otimização em um
 * ícone vetorial de qualquer forma.
 */
export function ProductImage({ src, alt, className, sizes, priority }: ProductImageProps) {
  if (src.endsWith(".svg")) {
    // eslint-disable-next-line @next/next/no-img-element -- SVG local, sem otimização a fazer.
    return <img src={src} alt={alt} className={className} />;
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
