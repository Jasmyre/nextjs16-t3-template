import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorPage } from "@/components/error-page";

describe("ErrorPage", () => {
  it("renders the title and children", () => {
    render(
      <ErrorPage title="Page not found">
        <a href="/">Go Home</a>
      </ErrorPage>
    );

    expect(
      screen.getByRole("heading", { name: "Page not found" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
