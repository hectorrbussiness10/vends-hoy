import type { Metadata } from "next";
import { Cormorant_Garamond, Figtree } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ideia Builders | Webs de negocio listas para vender",
  description:
    "Pegue el enlace de su local, unas fotos o un brief. En minutos tiene una web con catálogo, reseñas y reservas, y un panel para dirigirla. La prueba de un día exige iniciar sesión. Luego, 150 € al mes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
