import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { type NavItem, NavigationBar } from "@/components/navigation-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const BASE_URL =
  env.BASE_URL ?? "err:Environment_'BASE_URL'_Variable_Is_Not_Defined";

const GOOGLE_SITE_VERIFICATION =
  env.GOOGLE_SITE_VERIFICATION ??
  "err:Environment_'GOOGLE_SITE_VERIFICATION'_Variable_Is_Not_Defined";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  keywords: ["template"],
  title: {
    default: "Template | nextjs 16",
    template: "%s | Template",
  },
  description: "Template for nextjs 16",
  openGraph: {
    title: "Template | nextjs 16",
    url: new URL(BASE_URL),
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: `Thumbnail image for ${BASE_URL}`,
      },
    ],
  },
  other: {
    "google-site-verification": GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={cn(geist.variable, "font-sans", inter.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <body className="bg-background">
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <NavigationBar
              enableBlock
              navItems={navItems}
              pageItems={pageItems}
              title="Template"
            />
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Maintenance",
    href: "/maintenance",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

const pageItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Maintenance",
    href: "/maintenance",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];
