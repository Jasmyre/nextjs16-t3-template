import type { ReactNode } from "react";

export function ErrorPage({
  title,
  children,
}: Readonly<{ title: string; children?: ReactNode }>) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <h1 className="text-balance font-semibold font-serif text-4xl tracking-tight">
        {title}
      </h1>
      {children}
    </main>
  );
}
