"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarCategoriaAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};

export function CategoriaForm() {
  const [state, formAction, isPending] = useActionState(criarCategoriaAdmin, ESTADO_INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-8 flex items-end gap-3">
      <div className="flex-1">
        <label htmlFor="nome" className="mb-1 block text-sm font-medium">
          Nova categoria
        </label>
        <input
          id="nome"
          name="nome"
          required
          placeholder="Ex.: Eletrônicos"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        {isPending ? "Criando..." : "Criar"}
      </button>
      {state.error && <p className="ml-2 self-center text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
