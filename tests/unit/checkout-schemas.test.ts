import { describe, expect, it } from "vitest";
import {
  addressSchema,
  cardPaymentSchema,
  identificationSchema,
} from "@/features/checkout/schemas";

describe("identificationSchema", () => {
  it("aceita dados válidos", () => {
    const result = identificationSchema.safeParse({
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "11912345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = identificationSchema.safeParse({
      name: "Maria Silva",
      email: "nao-e-email",
      phone: "11912345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome muito curto", () => {
    const result = identificationSchema.safeParse({
      name: "Ab",
      email: "maria@example.com",
      phone: "11912345678",
    });
    expect(result.success).toBe(false);
  });
});

describe("addressSchema", () => {
  const valid = {
    zipCode: "01310-100",
    street: "Av. Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "sp",
  };

  it("aceita dados válidos e normaliza a UF para maiúsculas", () => {
    const result = addressSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.state).toBe("SP");
  });

  it("aceita CEP sem hífen", () => {
    const result = addressSchema.safeParse({ ...valid, zipCode: "01310100" });
    expect(result.success).toBe(true);
  });

  it("rejeita CEP inválido", () => {
    const result = addressSchema.safeParse({ ...valid, zipCode: "123" });
    expect(result.success).toBe(false);
  });

  it("rejeita UF com mais de 2 letras", () => {
    const result = addressSchema.safeParse({ ...valid, state: "SAO" });
    expect(result.success).toBe(false);
  });
});

describe("cardPaymentSchema", () => {
  const valid = {
    cardNumber: "4111 1111 1111 1111",
    cardName: "MARIA SILVA",
    cardExpiry: "12/29",
    cardCvv: "123",
  };

  it("aceita dados válidos e remove espaços do número do cartão", () => {
    const result = cardPaymentSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.cardNumber).toBe("4111111111111111");
  });

  it("rejeita validade em formato inválido", () => {
    const result = cardPaymentSchema.safeParse({ ...valid, cardExpiry: "2029-12" });
    expect(result.success).toBe(false);
  });

  it("rejeita CVV com letras", () => {
    const result = cardPaymentSchema.safeParse({ ...valid, cardCvv: "12a" });
    expect(result.success).toBe(false);
  });
});
