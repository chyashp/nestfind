import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "@/store/provider";
import "./globals.css";

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
    default: "NestFind — Find Your Perfect Property",
    template: "%s | NestFind",
  },
  description:
    "Discover homes, apartments, and commercial properties for sale or rent. Interactive map search, detailed listings, and direct contact with property owners.",
  keywords: [
    "real estate",
    "property listings",
    "homes for sale",
    "apartments for rent",
    "map search",
    "real estate platform",
  ],
  openGraph: {
    title: "NestFind — Find Your Perfect Property",
    description:
      "Discover homes, apartments, and commercial properties for sale or rent.",
    type: "website",
    siteName: "NestFind",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nestfind-theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
