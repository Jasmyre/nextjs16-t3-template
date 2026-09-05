import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarFooterContent } from "@/components/nav-user";
import { SidebarProvider } from "@/components/ui/sidebar";

const { signoutMock } = vi.hoisted(() => ({ signoutMock: vi.fn() }));

vi.mock("@/actions/sign-out", () => ({ signout: signoutMock }));

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));

const userData = {
  userName: "Jane Doe",
  email: "jane@example.com",
};

function renderFooter(user?: typeof userData) {
  return render(
    <SidebarProvider>
      <SidebarFooterContent user={user} />
    </SidebarProvider>
  );
}

describe("SidebarFooterContent", () => {
  beforeEach(() => {
    signoutMock.mockReset();
    signoutMock.mockResolvedValue(undefined);
  });

  it("shows a skeleton when no user is provided", () => {
    renderFooter();

    expect(screen.queryByText(userData.userName)).not.toBeInTheDocument();
    expect(screen.queryByText(userData.email)).not.toBeInTheDocument();
  });

  it("shows the user identity when a user is provided", () => {
    renderFooter(userData);

    expect(screen.getByText(userData.userName)).toBeInTheDocument();
    expect(screen.getByText(userData.email)).toBeInTheDocument();
  });

  it("signs the user out through the server action", async () => {
    const user = userEvent.setup();
    renderFooter(userData);

    await user.click(screen.getByRole("button", { name: "User menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(signoutMock).toHaveBeenCalledTimes(1);
  });
});
