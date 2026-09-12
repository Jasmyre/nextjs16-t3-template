import { describe, expect, it } from "vitest";
import { isServiceWorkerEnabled } from "./sw-dev";

describe("isServiceWorkerEnabled", () => {
  it("stays off in development by default (worker-free Turbopack loop)", () => {
    expect(
      isServiceWorkerEnabled({ nodeEnv: "development", optIn: undefined })
    ).toBe(false);
  });

  it("opts in from development only with the explicit flag", () => {
    expect(isServiceWorkerEnabled({ nodeEnv: "development", optIn: "1" })).toBe(
      true
    );
    expect(
      isServiceWorkerEnabled({ nodeEnv: "development", optIn: "true" })
    ).toBe(false);
  });

  it("stays on outside development regardless of the flag", () => {
    expect(
      isServiceWorkerEnabled({ nodeEnv: "production", optIn: undefined })
    ).toBe(true);
    expect(isServiceWorkerEnabled({ nodeEnv: "test", optIn: "1" })).toBe(true);
  });
});
