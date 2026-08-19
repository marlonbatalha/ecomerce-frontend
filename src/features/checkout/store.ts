import { create } from "zustand";
import type { AddressData, IdentificationData, PaymentMethod } from "@/features/checkout/schemas";
import type { OrderSummary } from "@/types/order";

type CheckoutState = {
  identification: IdentificationData | null;
  address: AddressData | null;
  paymentMethod: PaymentMethod | null;
  lastOrder: OrderSummary | null;
  setIdentification: (data: IdentificationData) => void;
  setAddress: (data: AddressData) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setLastOrder: (order: OrderSummary) => void;
  reset: () => void;
};

/**
 * Estado do fluxo de checkout — só em memória (sem persist): ao contrário
 * do carrinho, não faz sentido sobreviver a um reload no meio do fluxo sem
 * uma sessão de verdade no backend (isso muda na Fase 3, com conta de
 * usuário). Dados de cartão nunca passam por aqui — ficam só no formulário
 * do passo de pagamento e são descartados após o envio.
 */
export const useCheckoutStore = create<CheckoutState>()((set) => ({
  identification: null,
  address: null,
  paymentMethod: null,
  lastOrder: null,

  setIdentification: (data) => set({ identification: data }),
  setAddress: (data) => set({ address: data }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setLastOrder: (order) => set({ lastOrder: order }),

  reset: () => set({ identification: null, address: null, paymentMethod: null, lastOrder: null }),
}));
