"use client";

import { useActionState } from "react";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { DICA_DE_SENHA } from "@/features/conta/senha";
import { atualizarDados, trocarSenha, type EstadoDoFormulario } from "@/lib/api/conta-acoes";

const ESTADO_INICIAL: EstadoDoFormulario = {};

export function FormularioDadosPessoais({ nome, email }: { nome: string; email: string }) {
  const [estado, acao, enviando] = useActionState(atualizarDados, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-4">
      <Field id="nome" label="Nome completo" error={estado.campos?.nome}>
        {(props) => (
          <Input
            {...props}
            name="nome"
            required
            maxLength={150}
            autoComplete="name"
            defaultValue={estado.valores?.nome ?? nome}
          />
        )}
      </Field>

      <Field
        id="email"
        label="E-mail"
        hint="O e-mail é o seu login e não pode ser alterado por aqui."
      >
        {(props) => <Input {...props} value={email} disabled readOnly />}
      </Field>

      <Aviso tom="erro">{estado.erro}</Aviso>
      <Aviso tom="sucesso">{estado.sucesso}</Aviso>

      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar dados"}
      </Button>
    </form>
  );
}

export function FormularioTrocarSenha() {
  const [estado, acao, enviando] = useActionState(trocarSenha, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-4">
      <Field id="senhaAtual" label="Senha atual" error={estado.campos?.senhaAtual}>
        {(props) => (
          <Input
            {...props}
            name="senhaAtual"
            type="password"
            required
            autoComplete="current-password"
          />
        )}
      </Field>

      <Field
        id="novaSenha"
        label="Nova senha"
        hint={DICA_DE_SENHA}
        error={estado.campos?.novaSenha}
      >
        {(props) => (
          <Input
            {...props}
            name="novaSenha"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        )}
      </Field>

      <Field id="confirmacao" label="Confirme a nova senha" error={estado.campos?.confirmacao}>
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
      <Aviso tom="sucesso">{estado.sucesso}</Aviso>

      <Button type="submit" disabled={enviando}>
        {enviando ? "Alterando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
