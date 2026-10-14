"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { adicionarVarianteAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};

export function VarianteForm({ produtoId }: { produtoId: string }) {
  const acaoComProduto = adicionarVarianteAdmin.bind(null, produtoId);
  const [state, formAction, isPending] = useActionState(acaoComProduto, ESTADO_INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor="v-nome" className="text-xs">
          Nome
        </Label>
        <Input id="v-nome" name="nome" required placeholder="Padrão" />
      </div>
      <div>
        <Label htmlFor="v-sku" className="text-xs">
          SKU
        </Label>
        <Input id="v-sku" name="sku" required className="font-mono" />
      </div>
      <div>
        <Label htmlFor="v-preco" className="text-xs">
          Preço (R$)
        </Label>
        <Input id="v-preco" name="preco" required inputMode="decimal" placeholder="129,90" />
      </div>
      <div>
        <Label htmlFor="v-estoque" className="text-xs">
          Estoque
        </Label>
        <Input id="v-estoque" name="estoque" type="number" min={0} required />
      </div>

      <div className="col-span-full flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending}>
          <PlusIcon className="h-4 w-4" />
          {isPending ? "Adicionando..." : "Adicionar variante"}
        </Button>
        {state.error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-danger">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
