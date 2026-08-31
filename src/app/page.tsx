import { ArrowRight, BookOpen, Database, KeyRound, Shield } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-linear-to-b from-primary/10 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <Link
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/docs"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
          Next.js 16 · React 19 · tRPC · Prisma
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        <h1 className="mt-6 text-balance font-semibold font-serif text-4xl tracking-tight sm:text-6xl">
          A production-ready foundation for your next app
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground leading-7 sm:text-xl">
          Next.js 16 T3 Template ships with server-first patterns, end-to-end
          typed APIs, authentication, and PostgreSQL persistence — so you can
          focus on building features, not boilerplate.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/auth">
              Get started
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs">
              <BookOpen />
              Read the docs
            </Link>
          </Button>
        </div>
      </div>

      <section
        aria-label="Core features"
        className="mx-auto mt-20 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Feature
          description="NextAuth v5 with Credentials, GitHub, and Google providers."
          icon={<KeyRound />}
          title="Auth"
        />
        <Feature
          description="Prisma ORM on PostgreSQL with a full migration workflow."
          icon={<Database />}
          title="Database"
        />
        <Feature
          description="tRPC server and client for end-to-end type safety."
          icon={<BookOpen />}
          title="Typed APIs"
        />
        <Feature
          description="Route guards, Zod validation, and maintenance mode."
          icon={<Shield />}
          title="Secure by default"
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
