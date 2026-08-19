/** Espera `ms` milissegundos — usado para simular latência de rede nos mocks. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
