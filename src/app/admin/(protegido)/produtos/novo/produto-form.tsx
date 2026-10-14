"use client";

import { useActionState } from "react";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { criarProdutoAdmin, type CriarProdutoState } from "@/lib/api/admin-catalog";
import type { Category } from "@/types/catalog";

const ESTADO_INICIAL: CriarProdutoState = {};

export function ProdutoForm({ categorias }: { categorias: Category[] }) {
  const [state, formAction, isPending] = useActionState(criarProdutoAdmin, ESTADO_INICIAL);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" required />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" rows={4} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required className="font-mono" />
        </div>
        <div>
          <Label htmlFor="preco">Preço (R$)</Label>
          <Input id="preco" name="preco" required inputMode="decimal" placeholder="129,90" />
        </div>
      </div>

      <div>
        <Label htmlFor="categoriaId">Categoria</Label>
        <Select id="categoriaId" name="categoriaId" required defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.name}
            </option>
          ))}
        </Select>
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando..." : "Criar produto"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Depois de criar, você adiciona a variante (com estoque) na página do produto — sem
          variante ativa em estoque, o produto não aparece na loja.
        </p>
      </div>
    </form>
  );
}
