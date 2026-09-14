"use client";

import { useActionState, useEffect, useRef } from "react";
import { adicionarVarianteAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};
const CAMPO =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

export function VarianteForm({ produtoId }: { produtoId: string }) {
  const acaoComProduto = adicionarVarianteAdmin.bind(null, produtoId);
  const [state, formAction, isPending] = useActionState(acaoComProduto, ESTADO_INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div>
        <label htmlFor="v-nome" className="mb-1 block text-xs font-medium">
          Nome
        </label>
        <input id="v-nome" name="nome" required placeholder="Padrão" className={CAMPO} />
      </div>
      <div>
        <label htmlFor="v-sku" className="mb-1 block text-xs font-medium">
          SKU
        </label>
        <input id="v-sku" name="sku" required className={CAMPO} />
      </div>
      <div>
        <label htmlFor="v-preco" className="mb-1 block text-xs font-medium">
          Preço (R$)
        </label>
        <input
          id="v-preco"
          name="preco"
          required
          inputMode="decimal"
          placeholder="129,90"
          className={CAMPO}
        />
      </div>
      <div>
        <label htmlFor="v-estoque" className="mb-1 block text-xs font-medium">
          Estoque
        </label>
        <input id="v-estoque" name="estoque" type="number" min={0} required className={CAMPO} />
      </div>

      <div className="col-span-full flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          {isPending ? "Adicionando..." : "Adicionar variante"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
