import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TagIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { getCategories } from "@/lib/api/catalog";
import { ProdutoForm } from "./produto-form";

export default async function AdminNovoProdutoPage() {
  const categorias = await getCategories();

  return (
    <div className="max-w-2xl">
      <Breadcrumbs
        items={[{ label: "Produtos", href: "/admin/produtos" }, { label: "Novo produto" }]}
      />
      <PageHeader title="Novo produto" />
      <Card className="p-6 sm:p-8">
        {categorias.length === 0 ? (
          <EmptyState
            icon={<TagIcon className="h-7 w-7" />}
            title="Nenhuma categoria ainda"
            description="Crie uma categoria antes de cadastrar um produto."
            action={
              <Link href="/admin/categorias" className={buttonClasses()}>
                Criar categoria
              </Link>
            }
          />
        ) : (
          <ProdutoForm categorias={categorias} />
        )}
      </Card>
    </div>
  );
}
