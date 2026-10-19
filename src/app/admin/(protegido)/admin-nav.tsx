"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CartIcon,
  GridIcon,
  PackageIcon,
  PercentIcon,
  TagIcon,
  UserIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";

const ITENS = [
  { href: "/admin", rotulo: "Painel", Icone: GridIcon },
  { href: "/admin/pedidos", rotulo: "Pedidos", Icone: CartIcon },
  { href: "/admin/produtos", rotulo: "Produtos", Icone: PackageIcon },
  { href: "/admin/categorias", rotulo: "Categorias", Icone: TagIcon },
  { href: "/admin/cupons", rotulo: "Cupons", Icone: PercentIcon },
  { href: "/admin/clientes", rotulo: "Clientes", Icone: UserIcon },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex [scrollbar-width:none] gap-1 overflow-x-auto">
      {ITENS.map(({ href, rotulo, Icone }) => {
        // "/admin" só fica ativo na própria página; as demais também nas subpáginas.
        const ativo = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              ativo
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <Icone className="h-4 w-4" />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
