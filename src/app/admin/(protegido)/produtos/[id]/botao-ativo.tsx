"use client";

import { useActionState } from "react";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { alternarAtivoAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};

/** Ativa/inativa produto (`varianteId` null) ou variante, mostrando o motivo se a API recusar. */
export function BotaoAtivo({
  produtoId,
  varianteId = null,
  ativo,
  rotulo,
}: {
  produtoId: string;
  varianteId?: string | null;
  ativo: boolean;
  /** Ex.: "produto", "variante" — completa "Ativar …"/"Inativar …". */
  rotulo: string;
}) {
  const [estado, acao, enviando] = useActionState(
    alternarAtivoAdmin.bind(null, produtoId, varianteId, !ativo),
    ESTADO_INICIAL,
  );

  return (
    <form action={acao} className="inline-flex flex-wrap items-center gap-2">
      <Button
        type="submit"
        variante={ativo ? "outline" : "primary"}
        tamanho="sm"
        disabled={enviando}
      >
        {enviando ? "Salvando..." : `${ativo ? "Inativar" : "Ativar"} ${rotulo}`}
      </Button>
      {estado.error && (
        <span role="alert" className="flex items-center gap-1.5 text-sm text-danger">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {estado.error}
        </span>
      )}
    </form>
  );
}
