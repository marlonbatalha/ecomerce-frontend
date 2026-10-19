/**
 * Cookies que o JavaScript do browser pode ler — só dado de exibição, nada sensível. Existem pra
 * o cabeçalho (layout raiz) mostrar nome e quantidade no carrinho sem ler a sessão no servidor,
 * o que deixaria todas as páginas dinâmicas. Separado de `tokens.ts` pra não puxar código de
 * servidor pro bundle do cliente.
 */
export const COOKIE_NOME = "cliente_nome";

/** Soma das quantidades do carrinho, regravada a cada mudança no carrinho (Server Actions). */
export const COOKIE_QUANTIDADE_CARRINHO = "carrinho_itens";

/** Evento disparado no browser depois de uma ação que mudou o carrinho — o ícone relê o cookie. */
export const EVENTO_CARRINHO_ATUALIZADO = "carrinho:atualizado";
