"use client";

import { useActionState, useEffect, useRef } from "react";
import { adicionarImagemAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};

export function ImagemForm({ produtoId }: { produtoId: string }) {
  const acaoComProduto = adicionarImagemAdmin.bind(null, produtoId);
  const [state, formAction, isPending] = useActionState(acaoComProduto, ESTADO_INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-3">
      <input
        type="file"
        name="arquivo"
        accept="image/jpeg,image/png,image/webp"
        required
        className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 dark:file:bg-zinc-100 dark:file:text-black dark:hover:file:bg-zinc-300"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-zinc-500 disabled:opacity-60 dark:border-zinc-700"
      >
        {isPending ? "Enviando..." : "Enviar imagem"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
