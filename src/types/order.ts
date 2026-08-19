import type { CartItem } from "@/types/cart";
import type { AddressData, IdentificationData, PaymentMethod } from "@/features/checkout/schemas";

export type OrderSummary = {
  id: string;
  createdAt: string;
  items: CartItem[];
  identification: IdentificationData;
  address: AddressData;
  paymentMethod: PaymentMethod;
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;
};

export type CreateOrderInput = {
  items: CartItem[];
  identification: IdentificationData;
  address: AddressData;
  paymentMethod: PaymentMethod;
};
