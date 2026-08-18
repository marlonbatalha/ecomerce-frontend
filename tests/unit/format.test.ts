import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/format";

// Intl.NumberFormat costuma inserir um NBSP (U+00A0) entre símbolo e valor
// em vez do espaço comum: normaliza antes de comparar para não depender de
// qual espaço a ICU da plataforma usa.
function normalizeSpaces(value: string) {
  return value.replace(/\s/g, " ");
}

describe("formatCurrency", () => {
  it("formata centavos como BRL por padrão", () => {
    expect(normalizeSpaces(formatCurrency(19990))).toBe("R$ 199,90");
  });

  it("aceita locale e moeda customizados", () => {
    expect(formatCurrency(19990, { locale: "en-US", currency: "USD" })).toBe("$199.90");
  });
});
