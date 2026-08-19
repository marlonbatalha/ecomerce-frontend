"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { useHasCartHydrated } from "@/features/cart/hooks/use-hydrated";
import { useCartStore } from "@/features/cart/store";
import { identificationSchema, type IdentificationData } from "@/features/checkout/schemas";
import { useCheckoutStore } from "@/features/checkout/store";

export default function IdentificationPage() {
  const router = useRouter();
  const hasCartHydrated = useHasCartHydrated();
  const cartItemsCount = useCartStore((state) => state.items.length);

  const identification = useCheckoutStore((state) => state.identification);
  const setIdentification = useCheckoutStore((state) => state.setIdentification);

  useEffect(() => {
    if (hasCartHydrated && cartItemsCount === 0) router.replace("/carrinho");
  }, [hasCartHydrated, cartItemsCount, router]);

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
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Quem está comprando?
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 91234-5678"
            {...register("phone")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          Continuar para o endereço
        </button>
      </form>
    </div>
  );
}
