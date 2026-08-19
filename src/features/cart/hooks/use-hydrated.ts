import { useSyncExternalStore } from "react";
import { useCartStore } from "@/features/cart/store";

/**
 * `true` só depois que o carrinho persistido (localStorage) terminou de
 * hidratar no cliente. No SSR/primeiro paint, o carrinho sempre está vazio;
 * sem essa checagem, mostrar a contagem de itens direto causaria mismatch
 * de hidratação sempre que o visitante já tiver algo salvo.
 */
export function useHasCartHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useCartStore.persist.onFinishHydration(onStoreChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
