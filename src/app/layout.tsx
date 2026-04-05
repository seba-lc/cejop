import type { Metadata } from "next";
import { Montserrat, Encode_Sans_Condensed, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
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

const SITE_URL = "https://cejoptucuman.com";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    "liderazgo joven",
    "participación ciudadana",
  ],
  authors: [{ name: "CEJOP Argentina" }],
  creator: "CEJOP Argentina",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "CEJOP Tucumán | Formación política para jóvenes",
    description:
      "Un espacio serio, accesible y plural para jóvenes que quieren entender cómo funciona el Estado, la política y la sociedad.",
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "CEJOP Tucumán",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CEJOP Tucumán — Formación política para jóvenes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CEJOP Tucumán | Formación política para jóvenes",
    description:
      "Formación política e institucional para jóvenes de 18 a 30 años en Tucumán, Argentina.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "CEJOP Tucumán",
  description:
    "Centro de Estudios para Jóvenes Organizadores Políticos — Formación política e institucional para jóvenes de 18 a 30 años en Tucumán, Argentina.",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  areaServed: {
    "@type": "State",
    name: "Tucumán",
    containedInPlace: { "@type": "Country", name: "Argentina" },
  },
  sameAs: ["https://www.instagram.com/cejoptucuman"],
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#1A1A2E" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${montserrat.variable} ${encodeSansCondensed.variable} ${sourceSans3.variable} antialiased bg-white text-cejop-dark`}
      >
        {children}

        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
