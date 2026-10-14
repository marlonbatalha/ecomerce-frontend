"use client";

/**
 * `<script>` inline que só executa no HTML do servidor (parsing inicial). No cliente o React
 * reclama ao renderizar `<script>` (ex.: ao re-renderizar o layout na página 404) — `text/plain`
 * no cliente evita o aviso e a execução duplicada; `suppressHydrationWarning` aceita a diferença
 * de `type`. Padrão do guia "Preventing flash before hydration" do Next.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
