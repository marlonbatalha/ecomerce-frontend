"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Providers globais do app (client component — precisa ficar numa fronteira
 * client/server explícita). Hoje só o TanStack Query (usado a partir da
 * Fase 2, para mutações de carrinho/pedidos) e a ativação do mock de API no
 * browser; novos providers globais (tema, etc.) entram aqui.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // useState garante que o QueryClient só é criado uma vez por sessão do
  // browser, sem recriar (e perder o cache) a cada re-render.
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    import("@/mocks/init").then(({ initMocks }) => initMocks());
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
