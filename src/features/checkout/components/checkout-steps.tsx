import { CheckCircleIcon } from "@/components/icons";

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
    <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
      {CHECKOUT_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.key} className="flex items-center gap-2">
            {index > 0 && <span className="mx-1 text-zinc-300 dark:text-zinc-700">/</span>}
            <span
              className={
                isCurrent
                  ? "flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-50"
                  : isDone
                    ? "flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400"
                    : "flex items-center gap-1.5 text-zinc-400 dark:text-zinc-600"
              }
            >
              {isDone ? <CheckCircleIcon className="h-4 w-4" /> : `${index + 1}.`}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
