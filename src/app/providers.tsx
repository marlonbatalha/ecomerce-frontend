"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Providers globais do app (client component — precisa ficar numa fronteira client/server
 * explícita). Hoje só o TanStack Query; novos providers globais entram aqui.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // useState garante que o QueryClient só é criado uma vez por sessão do
  // browser, sem recriar (e perder o cache) a cada re-render.
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
