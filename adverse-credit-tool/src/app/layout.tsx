import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider} from "next-themes"
import { Analytics } from "@vercel/analytics/next"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreditMatch – Smart Adverse Credit Assessment",
  description:
    "CreditMatch helps lenders assess adverse credit history with precision rules, limits, and instant decision support.",
  keywords: [
    "adverse credit",
    "credit assessment",
    "loan eligibility",
    "lender rules",
    "financial risk analysis",
  ],
  authors: [{ name: "CreditMatch" }],
  metadataBase: new URL("https://adverse-credit-assessment.vercel.app"),
  openGraph: {
    title: "CreditMatch – Smart Adverse Credit Assessment",
    description:
      "CreditMatch helps lenders assess adverse credit history with precision rules, limits, and instant decision support.",
    url: "https://adverse-credit-assessment.vercel.app",
    siteName: "CreditMatch",
    images: [
      {
        url: "/ss.webp",
        width: 1200,
        height: 630,
        alt: "CreditMatch",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreditMatch – Smart Adverse Credit Assessment",
    description:
      "CreditMatch helps lenders assess adverse credit history with precision rules, limits, and instant decision support.",
    images: ["/ss.webp"],
    creator: "@kirihararyoji", // optional
  },
  themeColor: "#0066cc",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
