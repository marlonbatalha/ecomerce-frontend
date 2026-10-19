"use client";

import { useActionState } from "react";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { entregarPedidoAdmin, enviarPedidoAdmin } from "@/lib/api/admin-vendas";
import type { EstadoDoFormulario } from "@/lib/api/conta-acoes";
import type { StatusPedido } from "@/types/conta";

const ESTADO_INICIAL: EstadoDoFormulario = {};

function EnviarPedido({ pedidoId }: { pedidoId: string }) {
  const [estado, acao, enviando] = useActionState(enviarPedidoAdmin, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-3">
      <input type="hidden" name="id" value={pedidoId} />
      <Field id="codigoRastreio" label="Código de rastreio" error={estado.campos?.codigoRastreio}>
        {(props) => (
          <Input
            {...props}
            name="codigoRastreio"
            required
            maxLength={50}
            placeholder="AA123456789BR"
            className="font-mono uppercase"
            defaultValue={estado.valores?.codigoRastreio}
          />
        )}
      </Field>
      <Aviso tom="erro">{estado.erro}</Aviso>
      <Aviso tom="sucesso">{estado.sucesso}</Aviso>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Marcar como enviado"}
      </Button>
    </form>
  );
}

function EntregarPedido({ pedidoId }: { pedidoId: string }) {
  const [estado, acao, enviando] = useActionState(entregarPedidoAdmin, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-3">
      <input type="hidden" name="id" value={pedidoId} />
      <p className="text-sm text-muted-foreground">
        Confirme quando a transportadora registrar a entrega.
      </p>
      <Aviso tom="erro">{estado.erro}</Aviso>
      <Aviso tom="sucesso">{estado.sucesso}</Aviso>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Marcar como entregue"}
      </Button>
    </form>
  );
}

/** Próximo passo do pedido conforme o status — só existe ação pra pago (enviar) e enviado (entregar). */
export function AcoesDoPedido({ pedidoId, status }: { pedidoId: string; status: StatusPedido }) {
  if (status === "PagamentoConfirmado") return <EnviarPedido pedidoId={pedidoId} />;
  if (status === "Enviado") return <EntregarPedido pedidoId={pedidoId} />;
  return null;
}
