import { z } from "zod";

export const identificationSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo"),
  email: z.email("E-mail inválido"),
  phone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone inválido"),
});
export type IdentificationData = z.infer<typeof identificationSchema>;

export const addressSchema = z.object({
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato 00000-000)"),
  street: z.string().trim().min(3, "Informe a rua"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().min(2, "Informe o bairro"),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z
    .string()
    .trim()
    .length(2, "Use a sigla do estado (ex.: SP)")
    .transform((value) => value.toUpperCase()),
});
export type AddressData = z.infer<typeof addressSchema>;

export const PAYMENT_METHODS = ["pix", "boleto", "cartao"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const cardPaymentSchema = z.object({
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, "Número de cartão inválido")),
  cardName: z.string().trim().min(3, "Informe o nome impresso no cartão"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Validade inválida (MM/AA)"),
  cardCvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
});
export type CardPaymentData = z.infer<typeof cardPaymentSchema>;
