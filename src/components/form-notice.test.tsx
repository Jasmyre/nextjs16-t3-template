import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormNotice } from "./form-notice";

describe("FormNotice", () => {
  it("renders nothing when error and success are undefined", () => {
    const { container } = render(<FormNotice />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when both error and success are empty strings", () => {
    const { container } = render(<FormNotice error="" success="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the error message", () => {
    render(<FormNotice error="Invalid credentials!" />);
    expect(screen.getByText("Invalid credentials!")).toBeInTheDocument();
  });

  it("renders the success message", () => {
    render(<FormNotice success="Email sent!" />);
    expect(screen.getByText("Email sent!")).toBeInTheDocument();
  });

  it("renders error before success when both are present", () => {
    const { container } = render(
      <FormNotice error="Error!" success="Success!" />
    );
    expect(screen.getByText("Error!")).toBeInTheDocument();
    expect(screen.getByText("Success!")).toBeInTheDocument();
    const paragraphs = [...container.querySelectorAll("p")].map(
      (element) => element.textContent
    );
    expect(paragraphs).toEqual(["Error!", "Success!"]);
  });
});
