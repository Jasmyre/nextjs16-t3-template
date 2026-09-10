import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => true }));

const pathnameState = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.current,
}));

// jsdom never reproduces Radix body scroll-lock, so the no-shift contract is
// asserted at the seam instead: the mobile drawer must render non-modal,
// which is what keeps `react-remove-scroll` from touching body layout.
const rootProps = vi.hoisted(() => ({
  seen: [] as { open?: unknown; modal?: unknown }[],
}));

vi.mock("radix-ui", async (importOriginal) => {
  const mod = await importOriginal<typeof import("radix-ui")>();
  const OriginalRoot = mod.Dialog.Root;
  function RootSpy(props: { open?: unknown; modal?: unknown }) {
    rootProps.seen.push(props);
    return <OriginalRoot {...(props as object)} />;
  }
  return { ...mod, Dialog: { ...mod.Dialog, Root: RootSpy } };
});

function mobileSidebarTree() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <div>Mobile nav</div>
      </Sidebar>
      <SidebarInset>
        <div>Page content</div>
      </SidebarInset>
      <SidebarTrigger />
    </SidebarProvider>
  );
}

function renderMobileSidebar() {
  return render(mobileSidebarTree());
}

describe("mobile Sidebar", () => {
  beforeEach(() => {
    rootProps.seen.length = 0;
    pathnameState.current = "/";
    document.body.style.overflow = "";
  });

  it("renders the drawer non-modal so opening it cannot shift body layout", async () => {
    const user = userEvent.setup();
    renderMobileSidebar();

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    await screen.findByRole("dialog");

    const openProps = rootProps.seen.filter((props) => props.open === true);
    expect(openProps.length).toBeGreaterThan(0);
    for (const props of openProps) {
      expect(props.modal).toBe(false);
    }
  });

  it("dims the page behind the open drawer", async () => {
    const user = userEvent.setup();
    renderMobileSidebar();

    expect(
      document.querySelector('[data-slot="sidebar-backdrop"]')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(
      '[data-slot="sidebar-backdrop"]'
    ) as HTMLElement | null;
    expect(backdrop).toBeInTheDocument();
    expect(backdrop?.className).toContain("bg-black/10");
  });

  it("locks background scroll while open and restores it on close", async () => {
    const user = userEvent.setup();
    renderMobileSidebar();

    expect(document.body.style.overflow).not.toBe("hidden");

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");

    const backdrop = document.querySelector(
      '[data-slot="sidebar-backdrop"]'
    ) as HTMLElement | null;
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      await user.click(backdrop);
    }
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("blocks background touch gestures on the backdrop", async () => {
    const user = userEvent.setup();
    renderMobileSidebar();

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(
      '[data-slot="sidebar-backdrop"]'
    ) as HTMLElement | null;
    expect(backdrop?.className).toContain("touch-none");
    expect(backdrop?.className).toContain("overscroll-contain");
  });

  it("closes the drawer when the backdrop is tapped", async () => {
    const user = userEvent.setup();
    renderMobileSidebar();

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(
      '[data-slot="sidebar-backdrop"]'
    ) as HTMLElement | null;
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      await user.click(backdrop);
    }

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="sidebar-backdrop"]')
    ).not.toBeInTheDocument();
  });

  it("closes the mobile sidebar on navigate", async () => {
    const user = userEvent.setup();
    const view = renderMobileSidebar();

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    await screen.findByRole("dialog");

    pathnameState.current = "/posts";
    view.rerender(mobileSidebarTree());

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="sidebar-backdrop"]')
    ).not.toBeInTheDocument();
  });
  it("constrains the content inset width so the drawer cannot shift it", () => {
    renderMobileSidebar();

    const inset = document.querySelector('[data-slot="sidebar-inset"]');
    expect(inset?.className).toContain("min-w-0");
    expect(inset?.className).toContain("overflow-x-clip");
  });

  it("constrains the shell wrapper width so long content cannot shift it", () => {
    renderMobileSidebar();

    const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
    expect(wrapper?.className).toContain("min-w-0");
    expect(wrapper?.className).toContain("overflow-x-clip");
  });
});
