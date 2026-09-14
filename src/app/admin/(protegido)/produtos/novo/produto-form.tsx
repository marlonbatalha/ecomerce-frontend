"use client";

import { useActionState } from "react";
import { criarProdutoAdmin, type CriarProdutoState } from "@/lib/api/admin-catalog";
import type { Category } from "@/types/catalog";

const ESTADO_INICIAL: CriarProdutoState = {};
const CAMPO =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

export function ProdutoForm({ categorias }: { categorias: Category[] }) {
  const [state, formAction, isPending] = useActionState(criarProdutoAdmin, ESTADO_INICIAL);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label htmlFor="nome" className="mb-1 block text-sm font-medium">
          Nome
        </label>
        <input id="nome" name="nome" required className={CAMPO} />
      </div>

      <div>
        <label htmlFor="descricao" className="mb-1 block text-sm font-medium">
          Descrição
        </label>
        <textarea id="descricao" name="descricao" rows={3} className={CAMPO} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sku" className="mb-1 block text-sm font-medium">
            SKU
          </label>
          <input id="sku" name="sku" required className={CAMPO} />
        </div>
        <div>
          <label htmlFor="preco" className="mb-1 block text-sm font-medium">
            Preço (R$)
          </label>
          <input
            id="preco"
            name="preco"
            required
            inputMode="decimal"
            placeholder="129,90"
            className={CAMPO}
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoriaId" className="mb-1 block text-sm font-medium">
          Categoria
        </label>
        <select id="categoriaId" name="categoriaId" required className={CAMPO}>
          <option value="">Selecione...</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.name}
            </option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        {isPending ? "Criando..." : "Criar produto"}
      </button>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Depois de criar, você adiciona a variante (com estoque) na página do produto — sem variante
        ativa em estoque, o produto não aparece na loja.
      </p>
    </form>
  );
}
