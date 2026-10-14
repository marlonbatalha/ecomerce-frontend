import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

export type Migalha = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Migalha[] }) {
  return (
    <nav aria-label="Você está em" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRightIcon className="h-3.5 w-3.5 opacity-60" />}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
