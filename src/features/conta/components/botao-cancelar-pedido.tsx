"use client";

import { useActionState } from "react";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { cancelarPedido, type EstadoDoFormulario } from "@/lib/api/conta-acoes";

const ESTADO_INICIAL: EstadoDoFormulario = {};

export function BotaoCancelarPedido({ pedidoId }: { pedidoId: string }) {
  const [estado, acao, enviando] = useActionState(cancelarPedido, ESTADO_INICIAL);

  return (
    <form
      action={acao}
      onSubmit={(evento) => {
        if (!window.confirm("Cancelar este pedido? Essa ação não pode ser desfeita.")) {
          evento.preventDefault();
        }
      }}
      className="space-y-3"
    >
      <input type="hidden" name="id" value={pedidoId} />
      <Button type="submit" variante="danger" disabled={enviando}>
        {enviando ? "Cancelando..." : "Cancelar pedido"}
      </Button>
      <Aviso tom="erro">{estado.erro}</Aviso>
    </form>
  );
}
