import { MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/** Seletor −/+ de quantidade (carrinho e página de produto). */
export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  min = 1,
  max = 99,
  label,
  size = "md",
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  /** Complemento do aria-label dos botões, ex.: "de Fone Bluetooth". */
  label?: string;
  size?: "sm" | "md";
}) {
  const botao = cn(
    "flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-10 w-10",
  );

  return (
    <div className="inline-flex items-center rounded-full border border-border-strong bg-surface p-0.5">
      <button
        type="button"
        aria-label={`Diminuir quantidade${label ? ` ${label}` : ""}`}
        onClick={onDecrement}
        disabled={value <= min}
        className={botao}
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Aumentar quantidade${label ? ` ${label}` : ""}`}
        onClick={onIncrement}
        disabled={value >= max}
        className={botao}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
