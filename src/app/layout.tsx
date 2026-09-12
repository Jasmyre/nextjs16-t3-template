import "@/styles/globals.css";

import { SerwistProvider } from "@serwist/next/react";
import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import {
  PWA_APPLE_TOUCH_ICON,
  PWA_APPLE_WEB_APP,
  PWA_DESCRIPTION,
  PWA_MANIFEST_URL,
  PWA_METADATA_ICONS,
  PWA_NAME,
  PWA_SHORT_NAME,
  PWA_VIEWPORT,
} from "@/pwa";
import { SW_SCOPE, SW_URL } from "@/sw-policy";
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

const SITE_NAME = PWA_SHORT_NAME;
const DEFAULT_TITLE = PWA_NAME;
const DEFAULT_DESCRIPTION = PWA_DESCRIPTION;
const DEFAULT_OG_IMAGE = "/thumbnail.png";

export const viewport: Viewport = PWA_VIEWPORT;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: SITE_NAME,
  manifest: PWA_MANIFEST_URL,
  appleWebApp: PWA_APPLE_WEB_APP,
  icons: {
    apple: [PWA_APPLE_TOUCH_ICON],
    icon: PWA_METADATA_ICONS.map((icon) => ({
      sizes: icon.sizes,
      type: icon.type,
      url: icon.src,
    })),
  },
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
            {/*
             * Offline shell registration (issue #43): disabled in dev so the
             * Turbopack dev loop stays worker-free; in production the worker
             * registers at SW_URL without navigation-triggered caching and
             * never force-reloads an active session on update or reconnect.
             */}
            <SerwistProvider
              cacheOnNavigation={false}
              disable={process.env.NODE_ENV === "development"}
              options={{ scope: SW_SCOPE }}
              reloadOnOnline={false}
              swUrl={SW_URL}
            >
              {children}
            </SerwistProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
