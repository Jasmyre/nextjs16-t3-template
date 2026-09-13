import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeIcon } from "lucide-react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavMain, type NavMainItem } from "@/components/nav-main";
import { SidebarProvider } from "@/components/ui/sidebar";

const mocks = vi.hoisted(() => ({
  pathnameMock: vi.fn(),
  pushMock: vi.fn(),
  backMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.pathnameMock,
  useRouter: () => ({
    push: mocks.pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: mocks.backMock,
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

const postsOptionName = /Posts\s*Go/;

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
    mocks.pushMock.mockReset();
    mocks.backMock.mockReset();
    window.history.replaceState(null, "");
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

  it("navigates via the command palette without history.back() cancelling it", async () => {
    const user = userEvent.setup();
    const backSpy = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);

    renderNavMain();

    await user.click(
      screen.getByRole("textbox", { name: "Open command search" })
    );

    const option = await screen.findByRole("option", { name: postsOptionName });
    await user.click(option);

    expect(mocks.pushMock).toHaveBeenCalledWith("/posts");
    // The palette closes programmatically after router.push; the
    // useCloseOnBack cleanup must skip history.back() so the async
    // Next.js navigation is not cancelled.
    expect(backSpy).not.toHaveBeenCalled();

    backSpy.mockRestore();
  });
});
