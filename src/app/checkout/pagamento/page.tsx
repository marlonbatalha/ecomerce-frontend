"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertIcon,
  BarcodeIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  PixIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
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
import { cn } from "@/lib/cn";

const METODOS: Record<PaymentMethod, { label: string; descricao: string; Icone: typeof PixIcon }> =
  {
    pix: {
      label: "Pix",
      descricao: "Aprovação na hora. O código aparece assim que você confirmar o pedido.",
      Icone: PixIcon,
    },
    boleto: {
      label: "Boleto",
      descricao: "Gerado após a confirmação, com vencimento em 3 dias úteis.",
      Icone: BarcodeIcon,
    },
    cartao: {
      label: "Cartão de crédito",
      descricao: "Preencha os dados do cartão abaixo.",
      Icone: CreditCardIcon,
    },
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
  const cardErrors = cardForm.formState.errors;

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

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Como você quer pagar?</h1>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map((option) => {
              const { label, Icone } = METODOS[option];
              const ativo = method === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMethod(option)}
                  aria-pressed={ativo}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-[border-color,background-color,box-shadow]",
                    ativo
                      ? "border-accent bg-accent-soft/60 ring-4 ring-accent/10"
                      : "border-border-strong hover:bg-surface-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      ativo
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface-muted text-muted-foreground",
                    )}
                  >
                    <Icone className="h-5 w-5" />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{METODOS[method].descricao}</p>

          {method === "cartao" && (
            <form className="mt-6 space-y-5" noValidate onSubmit={(e) => e.preventDefault()}>
              <Field
                id="cardNumber"
                label="Número do cartão"
                error={cardErrors.cardNumber?.message}
              >
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    {...cardForm.register("cardNumber")}
                  />
                )}
              </Field>

              <Field
                id="cardName"
                label="Nome impresso no cartão"
                error={cardErrors.cardName?.message}
              >
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    autoComplete="cc-name"
                    {...cardForm.register("cardName")}
                  />
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  id="cardExpiry"
                  label="Validade (MM/AA)"
                  error={cardErrors.cardExpiry?.message}
                >
                  {(props) => (
                    <Input
                      {...props}
                      type="text"
                      autoComplete="cc-exp"
                      placeholder="12/29"
                      {...cardForm.register("cardExpiry")}
                    />
                  )}
                </Field>
                <Field id="cardCvv" label="CVV" error={cardErrors.cardCvv?.message}>
                  {(props) => (
                    <Input
                      {...props}
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      {...cardForm.register("cardCvv")}
                    />
                  )}
                </Field>
              </div>
            </form>
          )}

          {mutation.isError && (
            <p
              role="alert"
              className="mt-6 flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              <AlertIcon className="h-4 w-4 shrink-0" />
              Não deu pra processar o pagamento agora. Tente de novo.
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/checkout/endereco"
              className="inline-flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Voltar
            </Link>
            <Button tamanho="lg" onClick={handlePlaceOrderClick} disabled={mutation.isPending}>
              {mutation.isPending ? "Processando..." : "Finalizar pedido"}
            </Button>
          </div>
        </Card>

        <OrderSummary items={items} shippingInCents={FLAT_SHIPPING_CENTS} />
      </div>
    </div>
  );
}
