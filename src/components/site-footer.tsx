export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
      <p>© {new Date().getFullYear()} Loja. Todos os direitos reservados.</p>
    </footer>
  );
}
