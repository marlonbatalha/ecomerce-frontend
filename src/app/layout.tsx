import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { getCategories } from "@/lib/api/catalog";
import { SiteFooter } from "@/components/site-footer";
import { InlineScript } from "@/components/inline-script";
import { SiteHeader } from "@/components/site-header";
import { SCRIPT_TEMA } from "@/features/theme/theme";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Loja",
    template: "%s | Loja",
  },
  description: "Loja online — encontre produtos de eletrônicos, casa, moda e esporte.",
};

/** Cor da barra do navegador (mobile) acompanha o tema do sistema. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await getCategories();

  return (
    // data-theme="light" é só o padrão do HTML do servidor — o script abaixo troca pelo tema real
    // antes da pintura; suppressHydrationWarning porque o atributo vai divergir do que o React
    // renderizou (ver features/theme/theme.ts).
    <html
      lang="pt-BR"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={SCRIPT_TEMA} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Pular para o conteúdo
        </a>
        <Providers>
          <SiteHeader categories={categories} />
          <main id="conteudo" className="flex flex-1 flex-col">
            {children}
          </main>
          <SiteFooter categories={categories} />
        </Providers>
      </body>
    </html>
  );
}
