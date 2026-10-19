"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { entrar, type EstadoDoFormulario } from "@/lib/api/conta-acoes";

const ESTADO_INICIAL: EstadoDoFormulario = {};

export function FormularioEntrar({ redirecionar }: { redirecionar?: string }) {
  const [estado, acao, enviando] = useActionState(entrar, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-4">
      {redirecionar && <input type="hidden" name="redirecionar" value={redirecionar} />}

      <Field id="email" label="E-mail" error={estado.campos?.email}>
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={estado.valores?.email}
          />
        )}
      </Field>

      <Field id="senha" label="Senha" error={estado.campos?.senha}>
        {(props) => (
          <Input {...props} name="senha" type="password" required autoComplete="current-password" />
        )}
      </Field>

      <Aviso tom="erro">{estado.erro}</Aviso>

      <Button type="submit" disabled={enviando} tamanho="lg" className="w-full">
        {enviando ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href={
            redirecionar
              ? `/cadastro?redirecionar=${encodeURIComponent(redirecionar)}`
              : "/cadastro"
          }
          className="font-medium text-accent hover:text-accent-hover"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
