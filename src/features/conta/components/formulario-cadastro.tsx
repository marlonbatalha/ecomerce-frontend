"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cadastrar, type EstadoDoFormulario } from "@/lib/api/conta-acoes";
import { DICA_DE_SENHA } from "@/features/conta/senha";

const ESTADO_INICIAL: EstadoDoFormulario = {};

export function FormularioCadastro({ redirecionar }: { redirecionar?: string }) {
  const [estado, acao, enviando] = useActionState(cadastrar, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-4">
      {redirecionar && <input type="hidden" name="redirecionar" value={redirecionar} />}

      <Field id="nome" label="Nome completo" error={estado.campos?.nome}>
        {(props) => (
          <Input
            {...props}
            name="nome"
            required
            maxLength={150}
            autoComplete="name"
            defaultValue={estado.valores?.nome}
          />
        )}
      </Field>

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

      <Field id="senha" label="Senha" hint={DICA_DE_SENHA} error={estado.campos?.senha}>
        {(props) => (
          <Input
            {...props}
            name="senha"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        )}
      </Field>

      <Field id="confirmacao" label="Confirme a senha" error={estado.campos?.confirmacao}>
        {(props) => (
          <Input
            {...props}
            name="confirmacao"
            type="password"
            required
            autoComplete="new-password"
          />
        )}
      </Field>

      <Aviso tom="erro">{estado.erro}</Aviso>

      <Button type="submit" disabled={enviando} tamanho="lg" className="w-full">
        {enviando ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href={
            redirecionar ? `/entrar?redirecionar=${encodeURIComponent(redirecionar)}` : "/entrar"
          }
          className="font-medium text-accent hover:text-accent-hover"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
