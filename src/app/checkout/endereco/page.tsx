"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { useHasCartHydrated } from "@/features/cart/hooks/use-hydrated";
import { useCartStore } from "@/features/cart/store";
import { addressSchema, type AddressData } from "@/features/checkout/schemas";
import { useCheckoutStore } from "@/features/checkout/store";

export default function AddressPage() {
  const router = useRouter();
  const hasCartHydrated = useHasCartHydrated();
  const cartItemsCount = useCartStore((state) => state.items.length);

  const identification = useCheckoutStore((state) => state.identification);
  const address = useCheckoutStore((state) => state.address);
  const setAddress = useCheckoutStore((state) => state.setAddress);

  useEffect(() => {
    if (hasCartHydrated && cartItemsCount === 0) {
      router.replace("/carrinho");
      return;
    }
    if (!identification) router.replace("/checkout/identificacao");
  }, [hasCartHydrated, cartItemsCount, identification, router]);

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
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Para onde enviamos?
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div>
          <label htmlFor="zipCode" className="mb-1 block text-sm font-medium">
            CEP
          </label>
          <input
            id="zipCode"
            type="text"
            inputMode="numeric"
            placeholder="00000-000"
            autoComplete="postal-code"
            {...register("zipCode")}
            className="w-full max-w-[10rem] rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.zipCode && <p className="mt-1 text-xs text-red-600">{errors.zipCode.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="street" className="mb-1 block text-sm font-medium">
              Rua
            </label>
            <input
              id="street"
              type="text"
              autoComplete="address-line1"
              {...register("street")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street.message}</p>}
          </div>
          <div>
            <label htmlFor="number" className="mb-1 block text-sm font-medium">
              Número
            </label>
            <input
              id="number"
              type="text"
              {...register("number")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.number && <p className="mt-1 text-xs text-red-600">{errors.number.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="complement" className="mb-1 block text-sm font-medium">
            Complemento <span className="text-zinc-400">(opcional)</span>
          </label>
          <input
            id="complement"
            type="text"
            autoComplete="address-line2"
            {...register("complement")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="neighborhood" className="mb-1 block text-sm font-medium">
            Bairro
          </label>
          <input
            id="neighborhood"
            type="text"
            {...register("neighborhood")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.neighborhood && (
            <p className="mt-1 text-xs text-red-600">{errors.neighborhood.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="city" className="mb-1 block text-sm font-medium">
              Cidade
            </label>
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              {...register("city")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
          </div>
          <div>
            <label htmlFor="state" className="mb-1 block text-sm font-medium">
              UF
            </label>
            <input
              id="state"
              type="text"
              maxLength={2}
              autoComplete="address-level1"
              placeholder="SP"
              {...register("state")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          Continuar para o pagamento
        </button>
      </form>
    </div>
  );
}
