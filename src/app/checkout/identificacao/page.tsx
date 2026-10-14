"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { OrderSummary } from "@/features/checkout/components/order-summary";
import { FLAT_SHIPPING_CENTS } from "@/features/checkout/constants";
import { useHasCartHydrated } from "@/features/cart/hooks/use-hydrated";
import { useCartStore } from "@/features/cart/store";
import { identificationSchema, type IdentificationData } from "@/features/checkout/schemas";
import { useCheckoutStore } from "@/features/checkout/store";

export default function IdentificationPage() {
  const router = useRouter();
  const hasCartHydrated = useHasCartHydrated();
  const items = useCartStore((state) => state.items);

  const identification = useCheckoutStore((state) => state.identification);
  const setIdentification = useCheckoutStore((state) => state.setIdentification);

  useEffect(() => {
    if (hasCartHydrated && items.length === 0) router.replace("/carrinho");
  }, [hasCartHydrated, items.length, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdentificationData>({
    resolver: zodResolver(identificationSchema),
    defaultValues: identification ?? { name: "", email: "", phone: "" },
  });

  function onSubmit(data: IdentificationData) {
    setIdentification(data);
    router.push("/checkout/endereco");
  }

  return (
    <div>
      <CheckoutSteps current="identificacao" />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Quem está comprando?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Usamos esses dados para avisar sobre o pedido e a entrega.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
            <Field id="name" label="Nome completo" error={errors.name?.message}>
              {(props) => (
                <Input {...props} type="text" autoComplete="name" {...register("name")} />
              )}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="email" label="E-mail" error={errors.email?.message}>
                {(props) => (
                  <Input {...props} type="email" autoComplete="email" {...register("email")} />
                )}
              </Field>
              <Field id="phone" label="Telefone" error={errors.phone?.message}>
                {(props) => (
                  <Input
                    {...props}
                    type="tel"
                    autoComplete="tel"
                    placeholder="(11) 91234-5678"
                    {...register("phone")}
                  />
                )}
              </Field>
            </div>

            <Button type="submit" tamanho="lg" disabled={isSubmitting} className="w-full sm:w-auto">
              Continuar para o endereço
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        {hasCartHydrated && <OrderSummary items={items} shippingInCents={FLAT_SHIPPING_CENTS} />}
      </div>
    </div>
  );
}
