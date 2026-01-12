import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/providers/posthog";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nexo - Reto de 30 días para generar ingresos con IA",
  description: "Aprende a generar ingresos con IA en 30 días. Cursos prácticos, ejecución primero, sin promesas vacías.",
  keywords: "cursos IA, ganar dinero con IA, inteligencia artificial, ingresos con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
