"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockIcon, MapPinIcon, PackageIcon, UserIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const ITENS = [
  { href: "/conta", rotulo: "Resumo", Icone: UserIcon, exato: true },
  { href: "/conta/pedidos", rotulo: "Meus pedidos", Icone: PackageIcon, exato: false },
  { href: "/conta/enderecos", rotulo: "Endereços", Icone: MapPinIcon, exato: false },
  { href: "/conta/dados", rotulo: "Dados e senha", Icone: LockIcon, exato: false },
];

export function NavDaConta() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Minha conta"
      className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0"
    >
      {ITENS.map(({ href, rotulo, Icone, exato }) => {
        const ativo = exato ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              ativo
                ? "bg-surface-muted text-foreground"
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
