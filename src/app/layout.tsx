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

const BASE_URL = env.BASE_URL ?? "http://localhost:3000";

const GOOGLE_SITE_VERIFICATION =
  env.GOOGLE_SITE_VERIFICATION ??
  "err:Environment_'GOOGLE_SITE_VERIFICATION'_Variable_Is_Not_Defined";

const SITE_NAME = "Template";
const DEFAULT_TITLE = `${SITE_NAME} | Next.js 16`;
const DEFAULT_DESCRIPTION = "A modern Next.js 16 starter template.";
const DEFAULT_OG_IMAGE = "/thumbnail.png";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: SITE_NAME,
  keywords: ["nextjs", "template", "typescript", "t3", "starter"],
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: new URL(BASE_URL),
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} preview image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
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
