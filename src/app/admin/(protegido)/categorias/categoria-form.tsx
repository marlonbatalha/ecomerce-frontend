"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { criarCategoriaAdmin, type FormState } from "@/lib/api/admin-catalog";

const ESTADO_INICIAL: FormState = {};

export function CategoriaForm() {
  const [state, formAction, isPending] = useActionState(criarCategoriaAdmin, ESTADO_INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <Label htmlFor="nome">Nova categoria</Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input id="nome" name="nome" required placeholder="Ex.: Eletrônicos" />
        <Button type="submit" disabled={isPending} className="shrink-0">
          <PlusIcon className="h-4 w-4" />
          {isPending ? "Criando..." : "Criar"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-danger">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
    </form>
  );
}
