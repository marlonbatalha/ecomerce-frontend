import type { Metadata } from "next";
import Link from "next/link";
import { MapPinIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { FormularioEndereco } from "@/features/conta/components/formulario-endereco";
import { listarEnderecos } from "@/lib/api/conta";
import { removerEndereco, tornarEnderecoPadrao } from "@/lib/api/conta-acoes";
import { exigirSessao } from "@/lib/auth/sessao";

export const metadata: Metadata = { title: "Endereços" };

export default async function EnderecosPage(props: PageProps<"/conta/enderecos">) {
  const { editar } = await props.searchParams;
  const sessao = await exigirSessao("/conta/enderecos");
  const enderecos = await listarEnderecos(sessao);

  // Padrão primeiro: é o que o checkout vai sugerir.
  const ordenados = [...enderecos].sort((a, b) => Number(b.padrao) - Number(a.padrao));
  const emEdicao = typeof editar === "string" ? enderecos.find((e) => e.id === editar) : undefined;

  return (
    <>
      <PageHeader title="Endereços" description="Onde você recebe seus pedidos." />

      {ordenados.length > 0 && (
        <ul className="mb-10 grid gap-3 sm:grid-cols-2">
          {ordenados.map((endereco) => (
            <li key={endereco.id}>
              <Card
                className={`flex h-full flex-col p-5 ${endereco.id === emEdicao?.id ? "ring-2 ring-accent/40" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{endereco.rotulo}</span>
                  {endereco.padrao && <Badge tom="accent">Padrão</Badge>}
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {endereco.logradouro}, {endereco.numero}
                  {endereco.complemento && ` — ${endereco.complemento}`}
                  <br />
                  {endereco.bairro}, {endereco.cidade}/{endereco.estado}
                  <br />
                  CEP {endereco.cep}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/conta/enderecos?editar=${endereco.id}`}
                    className={buttonClasses({ variante: "outline", tamanho: "sm" })}
                  >
                    Editar
                  </Link>
                  {!endereco.padrao && (
                    <form action={tornarEnderecoPadrao}>
                      <input type="hidden" name="id" value={endereco.id} />
                      <Button type="submit" variante="ghost" tamanho="sm">
                        Tornar padrão
                      </Button>
                    </form>
                  )}
                  <form action={removerEndereco}>
                    <input type="hidden" name="id" value={endereco.id} />
                    <Button
                      type="submit"
                      variante="ghost"
                      tamanho="sm"
                      className="text-danger hover:bg-danger-soft hover:text-danger"
                    >
                      Remover
                    </Button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          {emEdicao ? `Editar "${emEdicao.rotulo}"` : "Novo endereço"}
        </h2>
        <Card className="p-5 sm:p-6">
          {/* key: trocar de endereço em edição remonta o formulário com os valores certos. */}
          <FormularioEndereco key={emEdicao?.id ?? "novo"} endereco={emEdicao} />
        </Card>
        {enderecos.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            O primeiro endereço cadastrado vira o padrão automaticamente.
          </p>
        )}
      </section>
    </>
  );
}
