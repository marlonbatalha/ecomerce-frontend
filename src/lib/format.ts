/**
 * Formata um valor em centavos (inteiro, para evitar erros de ponto
 * flutuante em preços) como moeda localizada. Ex.: formatCurrency(19990)
 * -> "R$ 199,90".
 */
export function formatCurrency(
  valueInCents: number,
  { locale = "pt-BR", currency = "BRL" }: { locale?: string; currency?: string } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(valueInCents / 100);
}
