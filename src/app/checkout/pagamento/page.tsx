"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { OrderSummary } from "@/features/checkout/components/order-summary";
import {
  cardPaymentSchema,
  PAYMENT_METHODS,
  type CardPaymentData,
  type PaymentMethod,
} from "@/features/checkout/schemas";
import { useCheckoutStore } from "@/features/checkout/store";
import { useHasCartHydrated } from "@/features/cart/hooks/use-hydrated";
import { useCartStore } from "@/features/cart/store";
import { createOrder } from "@/lib/api/orders";
import { FLAT_SHIPPING_CENTS } from "@/features/checkout/constants";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  boleto: "Boleto",
  cartao: "Cartão de crédito",
};

export default function PaymentPage() {
  const router = useRouter();
  const hasCartHydrated = useHasCartHydrated();
  const items = useCartStore((state) => state.items);

  const identification = useCheckoutStore((state) => state.identification);
  const address = useCheckoutStore((state) => state.address);
  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod);
  const setLastOrder = useCheckoutStore((state) => state.setLastOrder);

  const [method, setMethod] = useState<PaymentMethod>("pix");

  const cardForm = useForm<CardPaymentData>({
    resolver: zodResolver(cardPaymentSchema),
    defaultValues: { cardNumber: "", cardName: "", cardExpiry: "", cardCvv: "" },
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      // O carrinho só é limpo na página de confirmação (depois que o
      // pedido já existe) — se limpássemos aqui, o guard de "carrinho
      // vazio" abaixo entraria em corrida com a navegação e mandaria de
      // volta pro `/carrinho` antes de chegar na confirmação.
      setLastOrder(order);
      router.push("/checkout/confirmacao");
    },
  });

  useEffect(() => {
    if (hasCartHydrated && items.length === 0) {
      router.replace("/carrinho");
      return;
    }
    if (!identification) {
      router.replace("/checkout/identificacao");
      return;
    }
    if (!address) router.replace("/checkout/endereco");
  }, [hasCartHydrated, items.length, identification, address, router]);

  if (!identification || !address) return null;

  function placeOrder() {
    setPaymentMethod(method);
    // Dados de cartão (quando houver) já foram validados pelo cardForm e são
    // descartados aqui — nunca vão para o pedido nem para nenhum estado
    // global. Em produção, seriam trocados por um token do gateway escolhido.
    mutation.mutate({
      items,
      identification: identification!,
      address: address!,
      paymentMethod: method,
    });
  }

  const handlePlaceOrderClick =
    method === "cartao" ? cardForm.handleSubmit(() => placeOrder()) : () => placeOrder();

  return (
    <div>
      <CheckoutSteps current="pagamento" />
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Como você quer pagar?
      </h1>

      <div className="grid gap-8 sm:grid-cols-[1fr_20rem]">
        <div>
          <div className="mb-6 flex gap-2">
            {PAYMENT_METHODS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMethod(option)}
                aria-pressed={method === option}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  method === option
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-black"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {PAYMENT_METHOD_LABELS[option]}
              </button>
            ))}
          </div>

          {method === "pix" && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Você vai receber o código Pix para pagamento assim que confirmar o pedido.
            </p>
          )}
          {method === "boleto" && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              O boleto é gerado após a confirmação, com vencimento em 3 dias úteis.
            </p>
          )}
          {method === "cartao" && (
            <form className="max-w-md space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="cardNumber" className="mb-1 block text-sm font-medium">
                  Número do cartão
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  {...cardForm.register("cardNumber")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                {cardForm.formState.errors.cardNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {cardForm.formState.errors.cardNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="cardName" className="mb-1 block text-sm font-medium">
                  Nome impresso no cartão
                </label>
                <input
                  id="cardName"
                  type="text"
                  autoComplete="cc-name"
                  {...cardForm.register("cardName")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                {cardForm.formState.errors.cardName && (
                  <p className="mt-1 text-xs text-red-600">
                    {cardForm.formState.errors.cardName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cardExpiry" className="mb-1 block text-sm font-medium">
                    Validade (MM/AA)
                  </label>
                  <input
                    id="cardExpiry"
                    type="text"
                    autoComplete="cc-exp"
                    placeholder="12/29"
                    {...cardForm.register("cardExpiry")}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  {cardForm.formState.errors.cardExpiry && (
                    <p className="mt-1 text-xs text-red-600">
                      {cardForm.formState.errors.cardExpiry.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="cardCvv" className="mb-1 block text-sm font-medium">
                    CVV
                  </label>
                  <input
                    id="cardCvv"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    {...cardForm.register("cardCvv")}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  {cardForm.formState.errors.cardCvv && (
                    <p className="mt-1 text-xs text-red-600">
                      {cardForm.formState.errors.cardCvv.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}

          {mutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              Não deu pra processar o pagamento agora. Tente de novo.
            </p>
          )}

          <button
            type="button"
            onClick={handlePlaceOrderClick}
            disabled={mutation.isPending}
            className="mt-6 w-full max-w-md rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            {mutation.isPending ? "Processando..." : "Finalizar pedido"}
          </button>
          <p className="mt-2 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
            Pagamento simulado — nenhum valor é cobrado de verdade. A integração com um gateway real
            ainda não foi definida.
          </p>
        </div>

        <OrderSummary items={items} shippingInCents={FLAT_SHIPPING_CENTS} />
      </div>
    </div>
  );
}
