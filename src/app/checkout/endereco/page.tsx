"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRightIcon, ChevronLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { OrderSummary } from "@/features/checkout/components/order-summary";
import { FLAT_SHIPPING_CENTS } from "@/features/checkout/constants";
import { useHasCartHydrated } from "@/features/cart/hooks/use-hydrated";
import { useCartStore } from "@/features/cart/store";
import { addressSchema, type AddressData } from "@/features/checkout/schemas";
import { useCheckoutStore } from "@/features/checkout/store";

export default function AddressPage() {
  const router = useRouter();
  const hasCartHydrated = useHasCartHydrated();
  const items = useCartStore((state) => state.items);

  const identification = useCheckoutStore((state) => state.identification);
  const address = useCheckoutStore((state) => state.address);
  const setAddress = useCheckoutStore((state) => state.setAddress);

  useEffect(() => {
    if (hasCartHydrated && items.length === 0) {
      router.replace("/carrinho");
      return;
    }
    if (!identification) router.replace("/checkout/identificacao");
  }, [hasCartHydrated, items.length, identification, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address ?? {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  function onSubmit(data: AddressData) {
    setAddress(data);
    router.push("/checkout/pagamento");
  }

  if (!identification) return null;

  return (
    <div>
      <CheckoutSteps current="endereco" />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Para onde enviamos?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entregando para{" "}
            <span className="font-medium text-foreground">{identification.name}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
            <Field
              id="zipCode"
              label="CEP"
              error={errors.zipCode?.message}
              className="max-w-[12rem]"
            >
              {(props) => (
                <Input
                  {...props}
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  autoComplete="postal-code"
                  {...register("zipCode")}
                />
              )}
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field id="street" label="Rua" error={errors.street?.message} className="col-span-2">
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    autoComplete="address-line1"
                    {...register("street")}
                  />
                )}
              </Field>
              <Field id="number" label="Número" error={errors.number?.message}>
                {(props) => <Input {...props} type="text" {...register("number")} />}
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="complement"
                label={
                  <>
                    Complemento{" "}
                    <span className="font-normal text-muted-foreground">(opcional)</span>
                  </>
                }
              >
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    autoComplete="address-line2"
                    {...register("complement")}
                  />
                )}
              </Field>
              <Field id="neighborhood" label="Bairro" error={errors.neighborhood?.message}>
                {(props) => <Input {...props} type="text" {...register("neighborhood")} />}
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field id="city" label="Cidade" error={errors.city?.message} className="col-span-2">
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    autoComplete="address-level2"
                    {...register("city")}
                  />
                )}
              </Field>
              <Field id="state" label="UF" error={errors.state?.message}>
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    maxLength={2}
                    autoComplete="address-level1"
                    placeholder="SP"
                    className="uppercase"
                    {...register("state")}
                  />
                )}
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/checkout/identificacao"
                className="inline-flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Voltar
              </Link>
              <Button type="submit" tamanho="lg" disabled={isSubmitting}>
                Continuar para o pagamento
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>

        {hasCartHydrated && <OrderSummary items={items} shippingInCents={FLAT_SHIPPING_CENTS} />}
      </div>
    </div>
  );
}
