"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Aviso } from "@/components/ui/aviso";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { salvarEndereco, type EstadoDoFormulario } from "@/lib/api/conta-acoes";
import type { Endereco } from "@/types/conta";

const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const ESTADO_INICIAL: EstadoDoFormulario = {};

/**
 * Cadastro (sem `endereco`) ou edição de endereço. Limites de tamanho = os do backend (`Endereco`).
 * `noCheckout`: depois de salvar, volta pro checkout com o endereço novo escolhido.
 */
export function FormularioEndereco({
  endereco,
  noCheckout = false,
}: {
  endereco?: Endereco;
  noCheckout?: boolean;
}) {
  const [estado, acao, enviando] = useActionState(salvarEndereco, ESTADO_INICIAL);

  // Depois de um erro, mostra o que a pessoa digitou; antes, os dados salvos (edição) ou vazio.
  const valor = (campo: keyof Endereco) =>
    estado.valores?.[campo] ?? (endereco ? String(endereco[campo] ?? "") : "");
  const erro = (campo: string) => estado.campos?.[campo];

  return (
    <form action={acao} className="grid gap-4 sm:grid-cols-6">
      {endereco && <input type="hidden" name="id" value={endereco.id} />}
      {noCheckout && <input type="hidden" name="voltar" value="checkout" />}

      <Field
        id="rotulo"
        label="Nome do endereço"
        hint="Ex.: Casa, Trabalho"
        error={erro("rotulo")}
        className="sm:col-span-3"
      >
        {(props) => (
          <Input {...props} name="rotulo" required maxLength={50} defaultValue={valor("rotulo")} />
        )}
      </Field>

      <Field id="cep" label="CEP" error={erro("cep")} className="sm:col-span-3">
        {(props) => (
          <Input
            {...props}
            name="cep"
            required
            inputMode="numeric"
            pattern="\d{5}-?\d{3}"
            placeholder="00000-000"
            autoComplete="postal-code"
            defaultValue={valor("cep")}
          />
        )}
      </Field>

      <Field
        id="logradouro"
        label="Rua / avenida"
        error={erro("logradouro")}
        className="sm:col-span-4"
      >
        {(props) => (
          <Input
            {...props}
            name="logradouro"
            required
            maxLength={200}
            autoComplete="address-line1"
            defaultValue={valor("logradouro")}
          />
        )}
      </Field>

      <Field id="numero" label="Número" error={erro("numero")} className="sm:col-span-2">
        {(props) => (
          <Input {...props} name="numero" required maxLength={20} defaultValue={valor("numero")} />
        )}
      </Field>

      <Field
        id="complemento"
        label="Complemento (opcional)"
        error={erro("complemento")}
        className="sm:col-span-3"
      >
        {(props) => (
          <Input
            {...props}
            name="complemento"
            maxLength={100}
            autoComplete="address-line2"
            defaultValue={valor("complemento")}
          />
        )}
      </Field>

      <Field id="bairro" label="Bairro" error={erro("bairro")} className="sm:col-span-3">
        {(props) => (
          <Input {...props} name="bairro" required maxLength={100} defaultValue={valor("bairro")} />
        )}
      </Field>

      <Field id="cidade" label="Cidade" error={erro("cidade")} className="sm:col-span-4">
        {(props) => (
          <Input
            {...props}
            name="cidade"
            required
            maxLength={100}
            autoComplete="address-level2"
            defaultValue={valor("cidade")}
          />
        )}
      </Field>

      <Field id="estado" label="Estado" error={erro("estado")} className="sm:col-span-2">
        {(props) => (
          <Select
            {...props}
            name="estado"
            required
            defaultValue={valor("estado")}
            autoComplete="address-level1"
          >
            <option value="" disabled>
              UF
            </option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Aviso tom="erro" className="sm:col-span-6">
        {estado.erro}
      </Aviso>

      <div className="flex flex-wrap gap-3 sm:col-span-6">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : endereco ? "Salvar alterações" : "Cadastrar endereço"}
        </Button>
        {endereco && (
          <Link href="/conta/enderecos" className={buttonClasses({ variante: "ghost" })}>
            Cancelar edição
          </Link>
        )}
      </div>
    </form>
  );
}
