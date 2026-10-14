import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variante = "primary" | "accent" | "outline" | "ghost" | "danger";
type Tamanho = "sm" | "md" | "lg" | "icon";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const VARIANTES: Record<Variante, string> = {
  primary: "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover",
  accent: "bg-accent text-accent-foreground shadow-card hover:bg-accent-hover",
  outline: "border border-border-strong bg-surface text-foreground hover:bg-surface-muted",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
};

const TAMANHOS: Record<Tamanho, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
  icon: "h-9 w-9",
};

/**
 * Classes do botão — exportadas pra estilizar um `<Link>` como botão sem duplicar a receita
 * (`<Link className={buttonClasses({ variante: "outline" })}>`).
 */
export function buttonClasses({
  variante = "primary",
  tamanho = "md",
  className,
}: { variante?: Variante; tamanho?: Tamanho; className?: string } = {}) {
  return cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: Tamanho;
};

export function Button({ variante, tamanho, className, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variante, tamanho, className })} {...props} />
  );
}
