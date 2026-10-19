import Link from "next/link";
import { SearchIcon, UserIcon } from "@/components/icons";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { buscarClientesAdmin } from "@/lib/api/admin-vendas";

function link(termo: string | undefined, pagina: number): string {
  const params = new URLSearchParams();
  if (termo) params.set("termo", termo);
  if (pagina > 1) params.set("pagina", String(pagina));
  const qs = params.toString();
  return qs ? `/admin/clientes?${qs}` : "/admin/clientes";
}

export default async function AdminClientesPage(props: PageProps<"/admin/clientes">) {
  const { termo: termoBruto, pagina: paginaBruta } = await props.searchParams;
  const termo = typeof termoBruto === "string" && termoBruto.trim() ? termoBruto.trim() : undefined;
  const numero = Number(paginaBruta);
  const pagina = Number.isInteger(numero) && numero > 0 ? numero : 1;

  const clientes = await buscarClientesAdmin(termo, pagina);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clientes.total} ${clientes.total === 1 ? "conta" : "contas"}${termo ? ` para "${termo}"` : ""}`}
      />

      <form action="/admin/clientes" role="search" className="mb-6 flex max-w-lg gap-2">
        <label htmlFor="termo" className="sr-only">
          Buscar por nome ou e-mail
        </label>
        <Input id="termo" name="termo" defaultValue={termo} placeholder="Nome ou e-mail" />
        <Button type="submit" variante="outline">
          <SearchIcon className="h-4 w-4" />
          Buscar
        </Button>
        {termo && (
          <Link href="/admin/clientes" className="self-center text-sm font-medium text-accent">
            Limpar
          </Link>
        )}
      </form>

      {clientes.itens.length === 0 ? (
        <EmptyState icon={<UserIcon className="h-7 w-7" />} title="Nenhum cliente encontrado" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">E-mail</th>
                <th className="px-4 py-2.5 font-medium">Papel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientes.itens.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="px-4 py-3 font-medium">{cliente.nome}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${cliente.email}`}
                      className="text-accent hover:text-accent-hover"
                    >
                      {cliente.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {cliente.papeis.includes("admin") ? (
                      <Badge tom="accent">Admin</Badge>
                    ) : (
                      <Badge>Cliente</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={pagina}
        totalPages={clientes.totalPaginas}
        hrefForPage={(p) => link(termo, p)}
      />
    </div>
  );
}
