import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppNavigation } from "@/components/app-navigation";
import type { NavItem } from "@/components/navigation-bar";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  connectionMock: vi.fn(),
  navBarProps: [] as Array<{ navItems: NavItem[] }>,
}));

vi.mock("@/auth", () => ({ auth: mocks.authMock }));
vi.mock("next/server", () => ({ connection: mocks.connectionMock }));
vi.mock("@/components/navigation-bar", () => ({
  NavigationBar: (props: { navItems: NavItem[] }) => {
    mocks.navBarProps.push(props);
    return <div data-testid="navigation-bar" />;
  },
}));

describe("AppNavigation", () => {
  beforeEach(() => {
    mocks.navBarProps.length = 0;
    mocks.authMock.mockReset();
    mocks.connectionMock.mockReset();
    mocks.authMock.mockResolvedValue(null);
    mocks.connectionMock.mockResolvedValue(undefined);
  });

  it("renders the base app nav for a signed-out visitor", async () => {
    const element = await AppNavigation({ navItems: baseNavItems });

    render(element);

    expect(mocks.navBarProps[0]?.navItems).toEqual([
      { name: "Dashboard", href: "/" },
      { name: "Posts", href: "/posts" },
    ]);
  });

  it("adds the Admin item when the user holds the ADMIN role", async () => {
    mocks.authMock.mockResolvedValue({ user: { roles: ["ADMIN"] } });

    const element = await AppNavigation({ navItems: baseNavItems });

    render(element);

    expect(mocks.navBarProps[0]?.navItems).toEqual([
      { name: "Dashboard", href: "/" },
      { name: "Posts", href: "/posts" },
      { name: "Admin", href: "/admin" },
    ]);
  });

  it("omits the Admin item for non-admin roles", async () => {
    mocks.authMock.mockResolvedValue({ user: { roles: ["USER"] } });

    const element = await AppNavigation({ navItems: baseNavItems });

    render(element);

    const adminItem = mocks.navBarProps[0]?.navItems.find(
      (item) => item.href === "/admin"
    );
    expect(adminItem).toBeUndefined();
  });
});

const baseNavItems: NavItem[] = [
  { name: "Dashboard", href: "/" },
  { name: "Posts", href: "/posts" },
];
