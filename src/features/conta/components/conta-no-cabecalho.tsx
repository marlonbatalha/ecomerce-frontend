"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { COOKIE_NOME } from "@/lib/auth/cookies-publicos";

function lerPrimeiroNome(): string | null {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_NOME}=`));
  if (!par) return null;
  try {
    return decodeURIComponent(par.slice(COOKIE_NOME.length + 1)) || null;
  } catch {
    return null;
  }
}

/**
 * "Entrar" ou "Olá, Fulano" no cabeçalho. Lê um cookie não-httpOnly com o primeiro nome em vez da
 * sessão no servidor: o cabeçalho está no layout raiz, e ler cookies lá deixaria TODAS as páginas
 * dinâmicas (o catálogo perderia o ISR). Relido a cada navegação — login e logout trocam de página.
 */
export function ContaNoCabecalho() {
  const pathname = usePathname();
  const [nome, setNome] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o cookie (estado externo ao React) a cada navegação.
  useEffect(() => setNome(lerPrimeiroNome()), [pathname]);

  // Volta pra página atual depois do login — menos quando ela já é a de login/cadastro.
  const paginaDeAcesso = pathname === "/entrar" || pathname === "/cadastro";
  const entrarHref = paginaDeAcesso
    ? "/entrar"
    : `/entrar?redirecionar=${encodeURIComponent(pathname)}`;

  return (
    <Link
      href={nome ? "/conta" : entrarHref}
      className={buttonClasses({ variante: "ghost", tamanho: "sm", className: "gap-1.5 px-3" })}
      aria-label={nome ? `Minha conta (${nome})` : "Entrar"}
    >
      <UserIcon className="h-[18px] w-[18px]" />
      <span className="hidden max-w-28 truncate sm:inline">{nome ? `Olá, ${nome}` : "Entrar"}</span>
    </Link>
  );
}
