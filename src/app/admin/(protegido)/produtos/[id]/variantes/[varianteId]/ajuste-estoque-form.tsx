"use client";

import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { ajustarEstoqueAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};

export function AjusteEstoqueForm({
  produtoId,
  varianteId,
  estoqueAtual,
}: {
  produtoId: string;
  varianteId: string;
  estoqueAtual: number;
}) {
  const [estado, acao, enviando] = useActionState(
    ajustarEstoqueAdmin.bind(null, produtoId, varianteId),
    ESTADO_INICIAL,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.success) formRef.current?.reset();
  }, [estado]);

  return (
    <form ref={formRef} action={acao} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <div>
          <Label htmlFor="novoEstoque">Novo estoque</Label>
          <Input
            id="novoEstoque"
            name="novoEstoque"
            type="number"
            min={0}
            required
            defaultValue={estoqueAtual}
            key={estoqueAtual}
          />
        </div>
        <div>
          <Label htmlFor="motivo">Motivo</Label>
          <Input
            id="motivo"
            name="motivo"
            required
            maxLength={200}
            placeholder="Ex.: inventário, avaria, reposição do fornecedor"
          />
        </div>
      </div>

      <Aviso tom="erro">{estado.error}</Aviso>
      <Aviso tom="sucesso">{estado.success ? "Estoque ajustado." : undefined}</Aviso>

      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Ajustar estoque"}
      </Button>
    </form>
  );
}
