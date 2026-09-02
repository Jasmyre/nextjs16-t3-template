import type { ReactNode } from "react";
import { MarketingHeader } from "@/components/marketing-header";

export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <MarketingHeader />
      {children}
    </>
  );
}
