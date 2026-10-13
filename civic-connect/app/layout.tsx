import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth/guard";
import "./globals.css";

const heading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "CivicConnect", template: "%s | CivicConnect" },
  description: "Report a problem to your municipality and follow it until it is fixed.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SessionProvider user={user}>
          <Header />
          <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
            {children}
          </main>
        </SessionProvider>
        <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">
          Prototype: the requests shown are sample data.
        </footer>
      </body>
    </html>
  );
}
