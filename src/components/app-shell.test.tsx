import { render, screen } from "@testing-library/react";
import { HomeIcon } from "lucide-react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";
import { AppShellAsync } from "@/components/app-shell-async";
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

const baseNavItems: NavMainItem[] = [
  { title: "Home", url: "/", icon: createElement(HomeIcon) },
  { title: "Posts", url: "/posts", icon: createElement(HomeIcon) },
];

describe("AppShell", () => {
  beforeEach(() => {
    mocks.pathnameMock.mockReset();
    mocks.pathnameMock.mockReturnValue("/");
  });

  it("renders children inside the content inset", () => {
    render(
      <AppShell navItems={baseNavItems}>
        <div data-testid="page-content">Hello</div>
      </AppShell>
    );

    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders the current section title in the header", () => {
    render(
      <AppShell navItems={baseNavItems}>
        <div>Content</div>
      </AppShell>
    );

    const title = screen.getByText("Home", { selector: ".font-medium" });
    expect(title).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("button", { name: "Toggle Sidebar" })
        .some((button) => button.getAttribute("data-sidebar") === "trigger")
    ).toBe(true);
  });

  it("maps the pathname to the current section title", () => {
    mocks.pathnameMock.mockReturnValue("/posts/new");

    render(
      <AppShell navItems={baseNavItems}>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByText("New Post")).toBeInTheDocument();
  });

  it("humanises an unmapped pathname into the section title", () => {
    mocks.pathnameMock.mockReturnValue("/posts/1/edit");

    render(
      <AppShell navItems={baseNavItems}>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders the sidebar with the nav items", () => {
    render(
      <AppShell navItems={baseNavItems}>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute(
      "href",
      "/posts"
    );
  });
});

describe("AppShellAsync", () => {
  beforeEach(() => {
    mocks.authMock.mockReset();
    mocks.connectionMock.mockReset();
    mocks.authMock.mockResolvedValue(null);
    mocks.connectionMock.mockResolvedValue(undefined);
    mocks.pathnameMock.mockReset();
    mocks.pathnameMock.mockReturnValue("/");
  });

  it("passes the nav items with user to the shell", async () => {
    const element = await AppShellAsync({
      navItems: baseNavItems,
      children: <div data-testid="page-content">Hello</div>,
    });

    render(element);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute(
      "href",
      "/posts"
    );
  });

  it("adds the Admin item when the user holds the ADMIN role", async () => {
    mocks.authMock.mockResolvedValue({ user: { roles: ["ADMIN"] } });

    const element = await AppShellAsync({
      navItems: baseNavItems,
      children: <div>Content</div>,
    });

    render(element);

    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin"
    );
  });

  it("omits the Admin item for non-admin roles", async () => {
    mocks.authMock.mockResolvedValue({ user: { roles: ["USER"] } });

    const element = await AppShellAsync({
      navItems: baseNavItems,
      children: <div>Content</div>,
    });

    render(element);

    expect(screen.queryByRole("link", { name: "Admin" })).toBeNull();
  });

  it("maps session user data to NavUserData for the footer", async () => {
    mocks.authMock.mockResolvedValue({
      user: {
        name: "Jane Doe",
        email: "jane@example.com",
        image: null,
        roles: ["USER"],
      },
    });

    const element = await AppShellAsync({
      navItems: baseNavItems,
      children: <div>Content</div>,
    });

    render(element);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows the footer skeleton when session is null", async () => {
    mocks.authMock.mockResolvedValue(null);

    const element = await AppShellAsync({
      navItems: baseNavItems,
      children: <div>Content</div>,
    });

    render(element);

    expect(
      screen.queryByRole("button", { name: "User menu" })
    ).not.toBeInTheDocument();
  });
});
