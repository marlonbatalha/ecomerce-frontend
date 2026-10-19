import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import {
  centavosParaCampo,
  OPCOES_DE_ORDENACAO,
  type CatalogSearchParams,
} from "@/features/catalog/search-params";

type CatalogToolbarProps = {
  /** Página que recebe o formulário (`/produtos` ou `/categorias/[slug]`). */
  action: string;
  filtros: CatalogSearchParams;
  /** Parâmetros que o formulário não edita mas precisa manter (busca, categoria). */
  manter?: Record<string, string | undefined>;
  /** Link "Limpar" — mesma página, sem ordenação nem preço. */
  limparHref: string;
};

/**
 * Ordenação + faixa de preço como formulário GET: funciona sem JavaScript e o resultado tem URL
 * própria (dá pra compartilhar/voltar). Enviar sempre volta pra página 1, já que `pagina` não vai
 * no formulário.
 */
export function CatalogToolbar({ action, filtros, manter = {}, limparHref }: CatalogToolbarProps) {
  const temFiltro =
    filtros.sort !== "recentes" ||
    filtros.minPriceInCents !== undefined ||
    filtros.maxPriceInCents !== undefined;

  return (
    <form
      action={action}
      method="get"
      className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      {Object.entries(manter).map(([nome, valor]) =>
        valor ? <input key={nome} type="hidden" name={nome} value={valor} /> : null,
      )}

      <div className="min-w-40 flex-1 sm:flex-none">
        <Label htmlFor="ordem">Ordenar por</Label>
        <Select id="ordem" name="ordem" defaultValue={filtros.sort}>
          {OPCOES_DE_ORDENACAO.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-28">
        <Label htmlFor="precoMin">Preço mín. (R$)</Label>
        <Input
          id="precoMin"
          name="precoMin"
          inputMode="decimal"
          placeholder="0,00"
          defaultValue={centavosParaCampo(filtros.minPriceInCents)}
        />
      </div>

      <div className="w-28">
        <Label htmlFor="precoMax">Preço máx. (R$)</Label>
        <Input
          id="precoMax"
          name="precoMax"
          inputMode="decimal"
          placeholder="999,00"
          defaultValue={centavosParaCampo(filtros.maxPriceInCents)}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variante="outline">
          Aplicar
        </Button>
        {temFiltro && (
          <Link
            href={limparHref}
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            Limpar filtros
          </Link>
        )}
      </div>
    </form>
  );
}
