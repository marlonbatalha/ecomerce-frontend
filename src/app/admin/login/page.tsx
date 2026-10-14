"use client";

import { useActionState } from "react";
import { AlertIcon, BagIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { loginAdmin, type LoginState } from "@/lib/api/admin-auth";

const ESTADO_INICIAL: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, ESTADO_INICIAL);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BagIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Entre com sua conta de administrador.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>

          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger"
            >
              <AlertIcon className="h-4 w-4 shrink-0" />
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
