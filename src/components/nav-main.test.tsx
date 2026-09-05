import { render, screen } from "@testing-library/react";
import { HomeIcon } from "lucide-react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavMain, type NavMainItem } from "@/components/nav-main";
import { SidebarProvider } from "@/components/ui/sidebar";

const mocks = vi.hoisted(() => ({
  pathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.pathnameMock,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));

const navItems: NavMainItem[] = [
  { title: "Home", url: "/", icon: createElement(HomeIcon) },
  { title: "Posts", url: "/posts", icon: createElement(HomeIcon) },
];

function renderNavMain() {
  return render(
    <SidebarProvider>
      <NavMain items={navItems} />
    </SidebarProvider>
  );
}

describe("NavMain", () => {
  beforeEach(() => {
    mocks.pathnameMock.mockReset();
    mocks.pathnameMock.mockReturnValue("/");
  });

  it("highlights only the exactly matching item on the root path", () => {
    mocks.pathnameMock.mockReturnValue("/");

    renderNavMain();

    expect(
      screen.getByRole("link", { name: "Home" }).getAttribute("data-active")
    ).toBe("true");
    expect(
      screen.getByRole("link", { name: "Posts" }).getAttribute("data-active")
    ).toBe("false");
  });

  it("highlights the matching section on its exact path", () => {
    mocks.pathnameMock.mockReturnValue("/posts");

    renderNavMain();

    expect(
      screen.getByRole("link", { name: "Posts" }).getAttribute("data-active")
    ).toBe("true");
    expect(
      screen.getByRole("link", { name: "Home" }).getAttribute("data-active")
    ).toBe("false");
  });

  it("keeps the section highlighted on a nested route", () => {
    mocks.pathnameMock.mockReturnValue("/posts/new");

    renderNavMain();

    expect(
      screen.getByRole("link", { name: "Posts" }).getAttribute("data-active")
    ).toBe("true");
    expect(
      screen.getByRole("link", { name: "Home" }).getAttribute("data-active")
    ).toBe("false");
  });
});
