import type { Metadata } from "next";
import { Montserrat, Encode_Sans_Condensed, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const encodeSansCondensed = Encode_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-encode",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-source",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CEJOP Tucumán | Formación política para jóvenes",
  description:
    "CEJOP Tucumán es el espacio de formación política e institucional que conecta jóvenes de 18 a 30 años con los espacios donde se toman las decisiones. Plural, federal y formativo.",
  keywords: [
    "CEJOP",
    "Tucumán",
    "formación política",
    "jóvenes",
    "Argentina",
    "escuela de política",
    "instituciones",
  ],
  openGraph: {
    title: "CEJOP Tucumán | Formación política para jóvenes",
    description:
      "Un espacio serio, accesible y plural para jóvenes que quieren entender cómo funciona el Estado, la política y la sociedad.",
    type: "website",
    locale: "es_AR",
    siteName: "CEJOP Tucumán",
  },
  twitter: {
    card: "summary_large_image",
    title: "CEJOP Tucumán | Formación política para jóvenes",
    description:
      "Formación política e institucional para jóvenes de 18 a 30 años en Tucumán, Argentina.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className="scroll-smooth">
      <body
        className={`${montserrat.variable} ${encodeSansCondensed.variable} ${sourceSans3.variable} antialiased bg-white text-cejop-dark`}
      >
        {children}
      </body>
    </html>
  );
}
