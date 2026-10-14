import Link from "next/link";
import { ChevronRightIcon, PackageIcon, TagIcon } from "@/components/icons";
import { PageHeader } from "@/components/ui/card";

const ATALHOS = [
  {
    href: "/admin/categorias",
    titulo: "Categorias",
    texto: "Criar e ver categorias do catálogo.",
    Icone: TagIcon,
  },
  {
    href: "/admin/produtos",
    titulo: "Produtos",
    texto: "Cadastrar produto, variantes, estoque e imagens.",
    Icone: PackageIcon,
  },
];

export default function AdminPainelPage() {
  return (
    <div>
      <PageHeader title="Painel admin" description="Gerencie o catálogo da loja." />
      <div className="grid gap-4 sm:grid-cols-2">
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
