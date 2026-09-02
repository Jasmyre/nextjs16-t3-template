import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-muted border-b bg-background">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          className="flex cursor-pointer items-center gap-2 font-bold text-xl opacity-90 transition-opacity hover:opacity-100"
          href="/landing"
        >
          <Image
            alt="Website logo"
            className="h-8 w-8 rounded-full"
            height={100}
            src={"/logo.svg"}
            width={100}
          />
          Template
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
