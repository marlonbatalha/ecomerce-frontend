/**
 * Preferência de tema do visitante: "light", "dark" ou "system" (segue o sistema operacional,
 * inclusive se ele mudar com a página aberta). Fica no localStorage e é aplicada como
 * `data-theme="light|dark"` no <html> — ver `globals.css` (tokens) e `SCRIPT_TEMA` (aplicação antes
 * da primeira pintura, sem "flash" de tema errado).
 */

export type PreferenciaDeTema = "light" | "dark" | "system";

export const CHAVE_TEMA = "tema";

const CONSULTA_ESCURO = "(prefers-color-scheme: dark)";

/**
 * Roda inline no <head>, de forma síncrona, antes do browser pintar qualquer coisa (padrão do guia
 * "Preventing flash before hydration" do Next). Mesma lógica de `resolverTema` — mantenha as duas
 * em sincronia. try/catch: localStorage pode não existir (modo privado restrito, etc.).
 */
export const SCRIPT_TEMA = `(function(){try{var p=localStorage.getItem("${CHAVE_TEMA}");var d=p==="dark"||(p!=="light"&&matchMedia("${CONSULTA_ESCURO}").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

const ouvintes = new Set<() => void>();

function ehPreferencia(valor: string | null): valor is PreferenciaDeTema {
  return valor === "light" || valor === "dark" || valor === "system";
}

export function lerPreferencia(): PreferenciaDeTema {
  try {
    const salva = localStorage.getItem(CHAVE_TEMA);
    return ehPreferencia(salva) ? salva : "system";
  } catch {
    return "system";
  }
}

function resolverTema(preferencia: PreferenciaDeTema): "light" | "dark" {
  if (preferencia !== "system") return preferencia;
  return window.matchMedia(CONSULTA_ESCURO).matches ? "dark" : "light";
}

export function aplicarTema(preferencia: PreferenciaDeTema = lerPreferencia()) {
  document.documentElement.setAttribute("data-theme", resolverTema(preferencia));
}

export function definirPreferencia(preferencia: PreferenciaDeTema) {
  try {
    if (preferencia === "system") localStorage.removeItem(CHAVE_TEMA);
    else localStorage.setItem(CHAVE_TEMA, preferencia);
  } catch {
    // Sem storage: o tema ainda muda nesta página, só não persiste.
  }
  aplicarTema(preferencia);
  ouvintes.forEach((ouvinte) => ouvinte());
}

/** Pra `useSyncExternalStore`: avisa quando a preferência muda (nesta aba, em outra aba ou no SO). */
export function assinarPreferencia(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);

  const consulta = window.matchMedia(CONSULTA_ESCURO);
  const aoMudarSistema = () => {
    if (lerPreferencia() === "system") aplicarTema("system");
    ouvinte();
  };
  const aoMudarStorage = (evento: StorageEvent) => {
    if (evento.key !== CHAVE_TEMA) return;
    aplicarTema();
    ouvinte();
  };

  consulta.addEventListener("change", aoMudarSistema);
  window.addEventListener("storage", aoMudarStorage);

  return () => {
    ouvintes.delete(ouvinte);
    consulta.removeEventListener("change", aoMudarSistema);
    window.removeEventListener("storage", aoMudarStorage);
  };
}
