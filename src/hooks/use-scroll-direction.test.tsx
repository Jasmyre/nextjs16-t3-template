import { act, fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

const setScrollY = (y: number): void => {
  Object.defineProperty(window, "scrollY", {
    value: y,
    writable: true,
    configurable: true,
  });
  fireEvent.scroll(window);
};

describe("useScrollDirection", () => {
  it("is visible by default", () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe(true);
  });

  it("stays visible when scrolled near the top (y < 100)", () => {
    const { result } = renderHook(() => useScrollDirection());
    act(() => setScrollY(50));
    expect(result.current).toBe(true);
  });

  it("hides when scrolling down past the top threshold", () => {
    const { result } = renderHook(() => useScrollDirection());
    act(() => setScrollY(200));
    act(() => setScrollY(250));
    expect(result.current).toBe(false);
  });

  it("becomes visible again when scrolling up", () => {
    const { result } = renderHook(() => useScrollDirection());
    act(() => setScrollY(300));
    act(() => setScrollY(350));
    act(() => setScrollY(200));
    expect(result.current).toBe(true);
  });

  it("does not toggle for small scroll changes within the threshold", () => {
    const { result } = renderHook(() => useScrollDirection());
    act(() => setScrollY(150));
    expect(result.current).toBe(false);
    act(() => setScrollY(145));
    expect(result.current).toBe(false);
  });
});
