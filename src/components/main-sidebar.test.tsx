import { render, screen } from "@testing-library/react";
import { HomeIcon } from "lucide-react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { MainSidebar } from "@/components/main-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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

const navItems = [
  {
    title: "Home",
    url: "/",
    icon: <HomeIcon />,
  },
];

function renderSidebar(user?: { userName: string; email: string }) {
  return render(
    <SidebarProvider>
      <MainSidebar navItems={navItems} user={user} />
    </SidebarProvider>
  );
}

describe("MainSidebar", () => {
  it("renders the branding wordmark", () => {
    renderSidebar();

    expect(screen.getByText("Template")).toBeInTheDocument();
  });

  it("renders the nav items passed via config", () => {
    renderSidebar();

    const homeItem = screen.getByRole("link", { name: "Home" });
    expect(homeItem).toHaveAttribute("href", "/");
  });

  it("shows the user footer skeleton when no user is provided", () => {
    renderSidebar();

    expect(
      screen.queryByRole("button", { name: "User menu" })
    ).not.toBeInTheDocument();
  });

  it("shows the resolved user in the footer when provided", () => {
    renderSidebar({ userName: "Jane Doe", email: "jane@example.com" });

    expect(
      screen.getByRole("button", { name: "User menu" })
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });
});
