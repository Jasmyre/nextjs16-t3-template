import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

process.env.SKIP_ENV_VALIDATION = "true";

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
  };
});

vi.mock("next-themes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-themes")>();
  return {
    ...actual,
    useTheme: () => ({
      theme: "light",
      setTheme: vi.fn(),
      themes: ["light", "dark"],
      systemTheme: "light",
      resolvedTheme: "light",
    }),
  };
});
