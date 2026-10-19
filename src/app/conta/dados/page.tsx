import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui/card";
import {
  FormularioDadosPessoais,
  FormularioTrocarSenha,
} from "@/features/conta/components/formularios-de-dados";
import { obterPerfil } from "@/lib/api/conta";
import { exigirSessao } from "@/lib/auth/sessao";

export const metadata: Metadata = { title: "Dados e senha" };

export default async function DadosPage() {
  const sessao = await exigirSessao("/conta/dados");
  const perfil = await obterPerfil(sessao);

  return (
    <>
      <PageHeader title="Dados e senha" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-semibold">Dados pessoais</h2>
          <FormularioDadosPessoais nome={perfil.nome} email={perfil.email} />
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-semibold">Alterar senha</h2>
          <FormularioTrocarSenha />
        </Card>
      </div>
    </>
  );
}
