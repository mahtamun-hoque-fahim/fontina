import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fontina — Font to WOFF2 Converter",
  description: "Convert TTF, OTF, EOT and other font formats to WOFF2 instantly. Optimized for the web.",
  keywords: ["font converter", "woff2", "ttf to woff2", "otf to woff2", "web fonts"],
  openGraph: {
    title: "Fontina — Font to WOFF2 Converter",
    description: "Convert any font to WOFF2. Fast, free, web-ready.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
