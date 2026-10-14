import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export const CHECKOUT_STEPS = [
  { key: "identificacao", label: "Identificação" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
  { key: "confirmacao", label: "Confirmação" },
] as const;

export type CheckoutStepKey = (typeof CHECKOUT_STEPS)[number]["key"];

export function CheckoutSteps({ current }: { current: CheckoutStepKey }) {
  const currentIndex = CHECKOUT_STEPS.findIndex((step) => step.key === current);

  return (
    <nav aria-label="Etapas do checkout" className="mb-10">
      <ol className="flex items-center">
        {CHECKOUT_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? "step" : undefined}
              className={cn("flex items-center", index < CHECKOUT_STEPS.length - 1 && "flex-1")}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isDone && "bg-success text-white dark:text-background",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                    !isDone && !isCurrent && "border border-border-strong text-muted-foreground",
                  )}
                >
                  {isDone ? <CheckIcon className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-sm sm:inline",
                    isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < CHECKOUT_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("mx-3 h-px flex-1", isDone ? "bg-success" : "bg-border-strong")}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-muted-foreground sm:hidden">
        Etapa {currentIndex + 1} de {CHECKOUT_STEPS.length}:{" "}
        <span className="font-medium text-foreground">{CHECKOUT_STEPS[currentIndex].label}</span>
      </p>
    </nav>
  );
}
