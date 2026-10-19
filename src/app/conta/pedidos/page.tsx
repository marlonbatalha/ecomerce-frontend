import type { Metadata } from "next";
import Link from "next/link";
import { PackageIcon } from "@/components/icons";
import { Pagination } from "@/components/pagination";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { ListaDePedidos } from "@/features/conta/components/lista-de-pedidos";
import { listarPedidos } from "@/lib/api/conta";
import { exigirSessao } from "@/lib/auth/sessao";

export const metadata: Metadata = { title: "Meus pedidos" };

const POR_PAGINA = 10;

export default async function PedidosPage(props: PageProps<"/conta/pedidos">) {
  const { pagina: paginaBruta } = await props.searchParams;
  const numero = Number(paginaBruta);
  const pagina = Number.isInteger(numero) && numero > 0 ? numero : 1;

  const sessao = await exigirSessao("/conta/pedidos");
  const pedidos = await listarPedidos(sessao, pagina, POR_PAGINA);

  return (
    <>
      <PageHeader
        title="Meus pedidos"
        description={`${pedidos.total} ${pedidos.total === 1 ? "pedido" : "pedidos"}`}
      />

      {pedidos.itens.length > 0 ? (
        <ListaDePedidos pedidos={pedidos.itens} />
      ) : (
        <EmptyState
          icon={<PackageIcon className="h-7 w-7" />}
          title={pagina > 1 ? "Nada nesta página" : "Nenhum pedido ainda"}
          description="Quando você comprar, seus pedidos aparecem aqui."
          action={
            <Link href={pagina > 1 ? "/conta/pedidos" : "/produtos"} className={buttonClasses()}>
              {pagina > 1 ? "Voltar à primeira página" : "Ver produtos"}
            </Link>
          }
        />
      )}

      <Pagination
        page={pagina}
        totalPages={pedidos.totalPaginas}
        hrefForPage={(p) => (p === 1 ? "/conta/pedidos" : `/conta/pedidos?pagina=${p}`)}
      />
    </>
  );
}
