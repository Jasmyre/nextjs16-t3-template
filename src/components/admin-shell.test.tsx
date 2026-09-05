import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/components/admin-shell";
import { AdminShellAsync } from "@/components/admin-shell-async";
import type { NavMainItem } from "@/components/nav-main";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  connectionMock: vi.fn(),
  pathnameMock: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.authMock }));
vi.mock("next/server", () => ({ connection: mocks.connectionMock }));
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
vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) =>
    createElement("img", {
      alt: props.alt,
      height: props.height,
      src: props.src,
      width: props.width,
    }),
}));
vi.mock("@/actions/sign-out", () => ({ signout: vi.fn() }));
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));

const adminNavItems: NavMainItem[] = [
  { title: "Back to Dashboard", url: "/" },
  { title: "Users", url: "/admin" },
];

describe("AdminShell", () => {
  beforeEach(() => {
    mocks.pathnameMock.mockReset();
    mocks.pathnameMock.mockReturnValue("/admin");
  });

  it("renders children inside the content inset", () => {
    render(
      <AdminShell navItems={adminNavItems}>
        <div data-testid="page-content">Hello</div>
      </AdminShell>
    );

    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders the Admin section label in the header", () => {
    render(
      <AdminShell navItems={adminNavItems}>
        <div>Content</div>
      </AdminShell>
    );

    expect(
      screen
        .getAllByText("Admin")
        .some((node) => node.classList.contains("font-medium"))
    ).toBe(true);
    expect(
      screen
        .getAllByRole("button", { name: "Toggle Sidebar" })
        .some((button) => button.getAttribute("data-sidebar") === "trigger")
    ).toBe(true);
  });

  it("renders the sidebar with the admin nav items", () => {
    render(
      <AdminShell navItems={adminNavItems}>
        <div>Content</div>
      </AdminShell>
    );

    expect(
      screen.getByRole("link", { name: "Back to Dashboard" })
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/admin"
    );
  });
});

describe("AdminShellAsync", () => {
  beforeEach(() => {
    mocks.authMock.mockReset();
    mocks.connectionMock.mockReset();
    mocks.authMock.mockResolvedValue(null);
    mocks.connectionMock.mockResolvedValue(undefined);
    mocks.pathnameMock.mockReset();
    mocks.pathnameMock.mockReturnValue("/admin");
  });

  it("passes the nav items with user to the shell", async () => {
    const element = await AdminShellAsync({
      navItems: adminNavItems,
      children: <div data-testid="page-content">Hello</div>,
    });

    render(element);

    expect(
      screen.getByRole("link", { name: "Back to Dashboard" })
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/admin"
    );
  });

  it("maps session user data to NavUserData for the footer", async () => {
    mocks.authMock.mockResolvedValue({
      user: {
        name: "Jane Doe",
        email: "jane@example.com",
        image: null,
        roles: ["ADMIN"],
      },
    });

    const element = await AdminShellAsync({
      navItems: adminNavItems,
      children: <div>Content</div>,
    });

    render(element);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows the footer skeleton when session is null", async () => {
    mocks.authMock.mockResolvedValue(null);

    const element = await AdminShellAsync({
      navItems: adminNavItems,
      children: <div>Content</div>,
    });

    render(element);

    expect(
      screen.queryByRole("button", { name: "User menu" })
    ).not.toBeInTheDocument();
  });
});
