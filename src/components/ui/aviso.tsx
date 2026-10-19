import type { ReactNode } from "react";
import { AlertIcon, CheckCircleIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/** Mensagem de resultado de formulário (erro da API, "salvo com sucesso"...). */
export function Aviso({
  tom,
  children,
  className,
}: {
  tom: "erro" | "sucesso";
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  const Icone = tom === "erro" ? AlertIcon : CheckCircleIcon;

  return (
    <p
      role={tom === "erro" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm",
        tom === "erro" ? "bg-danger-soft text-danger" : "bg-success-soft text-success",
        className,
      )}
    >
      <Icone className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
