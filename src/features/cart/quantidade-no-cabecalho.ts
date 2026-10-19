"use client";

import { useSyncExternalStore } from "react";
import {
  COOKIE_QUANTIDADE_CARRINHO,
  EVENTO_CARRINHO_ATUALIZADO,
} from "@/lib/auth/cookies-publicos";

function lerQuantidade(): number {
  const par = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_QUANTIDADE_CARRINHO}=`));
  const quantidade = Number(par?.slice(COOKIE_QUANTIDADE_CARRINHO.length + 1));
  return Number.isInteger(quantidade) && quantidade > 0 ? quantidade : 0;
}

function assinar(aoMudar: () => void): () => void {
  window.addEventListener(EVENTO_CARRINHO_ATUALIZADO, aoMudar);
  // Outra aba mexeu no carrinho e o usuário voltou pra esta.
  window.addEventListener("focus", aoMudar);
  return () => {
    window.removeEventListener(EVENTO_CARRINHO_ATUALIZADO, aoMudar);
    window.removeEventListener("focus", aoMudar);
  };
}

/**
 * Quantidade no carrinho pro ícone do cabeçalho — lida do cookie que as Server Actions do carrinho
 * regravam (ver `gravarQuantidadeDoCarrinho`). No servidor é sempre 0 (o cabeçalho é estático).
 */
export function useQuantidadeNoCarrinho(): number {
  return useSyncExternalStore(assinar, lerQuantidade, () => 0);
}

/** Chamar depois de uma Server Action que mudou o carrinho. */
export function avisarCarrinhoAtualizado(): void {
  window.dispatchEvent(new Event(EVENTO_CARRINHO_ATUALIZADO));
}
