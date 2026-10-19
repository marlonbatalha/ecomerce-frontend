"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { criarCupomAdmin } from "@/lib/api/admin-vendas";
import type { EstadoDoFormulario } from "@/lib/api/conta-acoes";

const ESTADO_INICIAL: EstadoDoFormulario = {};

export function CupomForm() {
  const [estado, acao, enviando] = useActionState(criarCupomAdmin, ESTADO_INICIAL);
  const [tipo, setTipo] = useState("Percentual");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.sucesso) formRef.current?.reset();
  }, [estado]);

  const valor = (campo: string) => (estado.sucesso ? undefined : estado.valores?.[campo]);

  return (
    <form ref={formRef} action={acao} className="grid gap-4 sm:grid-cols-2">
      <Field
        id="codigo"
        label="Código"
        hint="Letras e números, sem espaço."
        error={estado.campos?.codigo}
      >
        {(props) => (
          <Input
            {...props}
            name="codigo"
            required
            maxLength={30}
            className="font-mono uppercase"
            defaultValue={valor("codigo")}
          />
        )}
      </Field>

      <Field id="descricao" label="Descrição (opcional)" error={estado.campos?.descricao}>
        {(props) => (
          <Input {...props} name="descricao" maxLength={200} defaultValue={valor("descricao")} />
        )}
      </Field>

      <Field id="tipo" label="Tipo de desconto">
        {(props) => (
          <Select {...props} name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="Percentual">Percentual (%)</option>
            <option value="ValorFixo">Valor fixo (R$)</option>
          </Select>
        )}
      </Field>

      <Field
        id="valor"
        label={tipo === "Percentual" ? "Desconto (%)" : "Desconto (R$)"}
        error={estado.campos?.valor}
      >
        {(props) => (
          <Input
            {...props}
            name="valor"
            required
            inputMode="decimal"
            placeholder={tipo === "Percentual" ? "10" : "20,00"}
            defaultValue={valor("valor")}
          />
        )}
      </Field>

      <Field
        id="valorMinimo"
        label="Pedido mínimo (R$, opcional)"
        error={estado.campos?.valorMinimoDoPedido}
      >
        {(props) => (
          <Input
            {...props}
            name="valorMinimo"
            inputMode="decimal"
            defaultValue={valor("valorMinimo")}
          />
        )}
      </Field>

      <Field
        id="limiteDeUsos"
        label="Limite de usos (opcional)"
        error={estado.campos?.limiteDeUsos}
      >
        {(props) => (
          <Input
            {...props}
            name="limiteDeUsos"
            type="number"
            min={1}
            defaultValue={valor("limiteDeUsos")}
          />
        )}
      </Field>

      <Field
        id="validoAte"
        label="Válido até (opcional)"
        hint="Até o fim do dia, horário de Brasília."
        error={estado.campos?.validoAteUtc}
      >
        {(props) => (
          <Input {...props} name="validoAte" type="date" defaultValue={valor("validoAte")} />
        )}
      </Field>

      <div className="flex flex-col justify-end gap-3 sm:col-span-2">
        <Aviso tom="erro">{estado.erro}</Aviso>
        <Aviso tom="sucesso">{estado.sucesso}</Aviso>
        <div>
          <Button type="submit" disabled={enviando}>
            {enviando ? "Criando..." : "Criar cupom"}
          </Button>
        </div>
      </div>
    </form>
  );
}
