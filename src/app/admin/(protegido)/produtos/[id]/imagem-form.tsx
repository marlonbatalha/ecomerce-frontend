"use client";

import { useActionState, useRef, useState } from "react";
import { AlertIcon, ImageIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { adicionarImagemAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};

export function ImagemForm({ produtoId }: { produtoId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string>();

  // Limpa o campo dentro da própria action (em vez de num effect reagindo ao resultado): o
  // reset acontece na mesma transição que atualiza o estado do formulário.
  const [state, formAction, isPending] = useActionState(
    async (estadoAnterior: FormState, formData: FormData) => {
      const resultado = await adicionarImagemAdmin(produtoId, estadoAnterior, formData);
      if (resultado.success) {
        formRef.current?.reset();
        setNomeArquivo(undefined);
      }
      return resultado;
    },
    ESTADO_INICIAL,
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <label
        htmlFor="arquivo"
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border-strong px-4 py-4 transition-colors focus-within:border-accent hover:border-accent hover:bg-accent-soft/40"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0 text-sm">
          <span className="block truncate font-medium">{nomeArquivo ?? "Escolher imagem"}</span>
          <span className="text-xs text-muted-foreground">JPEG, PNG ou WebP · até 5 MB</span>
        </span>
        <input
          id="arquivo"
          type="file"
          name="arquivo"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(evento) => setNomeArquivo(evento.target.files?.[0]?.name)}
          className="sr-only"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variante="outline" disabled={isPending || !nomeArquivo}>
          {isPending ? "Enviando..." : "Enviar imagem"}
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
