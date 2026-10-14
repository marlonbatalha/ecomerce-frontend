"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  aplicarTema,
  assinarPreferencia,
  definirPreferencia,
  lerPreferencia,
  type PreferenciaDeTema,
} from "./theme";

const OPCOES: { valor: PreferenciaDeTema; rotulo: string; Icone: typeof SunIcon }[] = [
  { valor: "light", rotulo: "Claro", Icone: SunIcon },
  { valor: "dark", rotulo: "Escuro", Icone: MoonIcon },
  { valor: "system", rotulo: "Sistema", Icone: MonitorIcon },
];

export function ThemeToggle() {
  // No servidor (e no 1º render da hidratação) não há como saber a preferência — "system" é o
  // valor neutro; o useSyncExternalStore troca pro valor real logo em seguida, sem mismatch.
  const preferencia = useSyncExternalStore(assinarPreferencia, lerPreferencia, () => "system");
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);

  // Em dev, o Strict Mode remonta e o React limpa atributos do <html> que ele não controla
  // (inclusive o data-theme posto pelo script inline) — reaplica antes da pintura. No-op em produção.
  useLayoutEffect(() => {
    aplicarTema();
  }, []);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: PointerEvent) {
      if (!raizRef.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }

    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <div ref={raizRef} className="relative">
      <button
        type="button"
        aria-label="Alterar tema"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((valor) => !valor)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        {/* Os dois ícones ficam no DOM e o CSS mostra o certo: funciona antes mesmo da hidratação. */}
        <SunIcon className="h-[18px] w-[18px] dark:hidden" />
        <MoonIcon className="hidden h-[18px] w-[18px] dark:block" />
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label="Tema"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-elevated"
        >
          {OPCOES.map(({ valor, rotulo, Icone }) => (
            <button
              key={valor}
              type="button"
              role="menuitemradio"
              aria-checked={preferencia === valor}
              onClick={() => {
                definirPreferencia(valor);
                setAberto(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted",
                preferencia === valor ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              <Icone className="h-4 w-4" />
              {rotulo}
              {preferencia === valor && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
