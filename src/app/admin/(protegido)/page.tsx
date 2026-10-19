import Link from "next/link";
import {
  CartIcon,
  ChevronRightIcon,
  PackageIcon,
  PercentIcon,
  TagIcon,
  UserIcon,
} from "@/components/icons";
import { PageHeader } from "@/components/ui/card";
import { contarPedidosAdmin } from "@/lib/api/admin-vendas";
import { cn } from "@/lib/cn";

const ATALHOS = [
  {
    href: "/admin/pedidos",
    titulo: "Pedidos",
    texto: "Enviar, acompanhar e entregar.",
    Icone: CartIcon,
  },
  {
    href: "/admin/produtos",
    titulo: "Produtos",
    texto: "Cadastro, variantes, estoque e imagens.",
    Icone: PackageIcon,
  },
  {
    href: "/admin/categorias",
    titulo: "Categorias",
    texto: "Organização do catálogo.",
    Icone: TagIcon,
  },
  { href: "/admin/cupons", titulo: "Cupons", texto: "Descontos do checkout.", Icone: PercentIcon },
  {
    href: "/admin/clientes",
    titulo: "Clientes",
    texto: "Busca por nome ou e-mail.",
    Icone: UserIcon,
  },
];

export default async function AdminPainelPage() {
  const [aEnviar, aguardandoPagamento] = await Promise.all([
    contarPedidosAdmin("PagamentoConfirmado"),
    contarPedidosAdmin("Pendente"),
  ]);

  const indicadores = [
    {
      href: "/admin/pedidos?status=PagamentoConfirmado",
      valor: aEnviar,
      rotulo: aEnviar === 1 ? "pedido pago aguardando envio" : "pedidos pagos aguardando envio",
      destaque: aEnviar > 0,
    },
    {
      href: "/admin/pedidos?status=Pendente",
      valor: aguardandoPagamento,
      rotulo:
        aguardandoPagamento === 1 ? "pedido aguardando pagamento" : "pedidos aguardando pagamento",
      destaque: false,
    },
  ];

  return (
    <div>
      <PageHeader title="Painel admin" description="Visão geral da loja." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {indicadores.map((indicador) => (
          <Link
            key={indicador.href}
            href={indicador.href}
            className={cn(
              "rounded-2xl border p-6 shadow-card transition-[border-color,box-shadow] hover:shadow-elevated",
              indicador.destaque
                ? "border-accent/40 bg-accent-soft"
                : "border-border bg-surface hover:border-border-strong",
            )}
          >
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{indicador.valor}</p>
            <p className="mt-1 text-sm text-muted-foreground">{indicador.rotulo}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ATALHOS.map(({ href, titulo, texto, Icone }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-elevated"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icone className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{titulo}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{texto}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
