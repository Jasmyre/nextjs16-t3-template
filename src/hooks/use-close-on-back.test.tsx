import { renderHook } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPushedState,
  getHistoryStackId,
  shouldRemovePushedEntry,
  useCloseOnBack,
} from "@/hooks/use-close-on-back";

function pushStateSpy() {
  return vi.spyOn(window.history, "pushState");
}

function backSpy() {
  return vi.spyOn(window.history, "back").mockImplementation(() => undefined);
}

beforeEach(() => {
  window.history.replaceState(null, "");
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "");
});

describe("history helpers", () => {
  it("reads the stack id from history state", () => {
    expect(getHistoryStackId({ uiStackId: 7 })).toBe(7);
    expect(getHistoryStackId(null)).toBeUndefined();
    expect(getHistoryStackId({})).toBeUndefined();
  });

  it("builds pushed state by preserving existing keys", () => {
    expect(buildPushedState({ foo: "bar" }, 3)).toEqual({
      foo: "bar",
      uiStackId: 3,
    });
    expect(buildPushedState(null, 3)).toEqual({ uiStackId: 3 });
  });

  it("only removes the entry when it is still on top", () => {
    expect(shouldRemovePushedEntry(2, 2, false, true)).toBe(true);
    expect(shouldRemovePushedEntry(1, 2, false, true)).toBe(false);
    expect(shouldRemovePushedEntry(2, 2, true, true)).toBe(false);
    expect(shouldRemovePushedEntry(2, 2, false, false)).toBe(false);
  });
});

describe("useCloseOnBack", () => {
  it("pushes a history entry when opened", () => {
    const push = pushStateSpy();
    const onClose = vi.fn();

    const { unmount } = renderHook(() => useCloseOnBack(true, onClose));
    expect(push).toHaveBeenCalledTimes(1);
    expect(getHistoryStackId(window.history.state)).toBeDefined();

    unmount();
  });

  it("does nothing while closed", () => {
    const push = pushStateSpy();
    const onClose = vi.fn();

    const { unmount } = renderHook(() => useCloseOnBack(false, onClose));
    expect(push).not.toHaveBeenCalled();

    unmount();
  });

  it("closes on popstate for its own entry", () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useCloseOnBack(true, onClose));
    const myId = getHistoryStackId(window.history.state);

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { uiStackId: myId } })
      );
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("ignores popstate for other entries", () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useCloseOnBack(true, onClose));

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { uiStackId: 999_999 } })
      );
    });

    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });

  it("calls history.back() on programmatic close", () => {
    const back = backSpy();
    const onClose = vi.fn();

    const { unmount } = renderHook(() => useCloseOnBack(true, onClose));
    unmount();

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("skips history.back() when skipHistoryOnCloseRef is set", () => {
    const back = backSpy();
    const onClose = vi.fn();
    const skipHistoryOnCloseRef = { current: true as boolean | null };

    const { unmount } = renderHook(() =>
      useCloseOnBack(true, onClose, { skipHistoryOnCloseRef })
    );
    unmount();

    expect(back).not.toHaveBeenCalled();
  });

  it("does not re-push when onClose identity changes", () => {
    const push = pushStateSpy();

    const { rerender, unmount } = renderHook(
      ({ onClose }: { onClose: () => void }) => useCloseOnBack(true, onClose),
      { initialProps: { onClose: () => undefined } }
    );
    expect(push).toHaveBeenCalledTimes(1);

    rerender({ onClose: () => undefined });
    expect(push).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("restores focus to the opener on unmount", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    const focusSpy = vi.spyOn(button, "focus");
    const restoreFocusRef = { current: button as HTMLElement | null };

    const { unmount } = renderHook(() =>
      useCloseOnBack(true, vi.fn(), { restoreFocusRef })
    );
    unmount();

    expect(focusSpy).toHaveBeenCalledTimes(1);
    button.remove();
  });

  it("nested: back closes only the top dialog (LIFO)", () => {
    const onCloseBottom = vi.fn();
    const onCloseTop = vi.fn();

    const bottom = renderHook(() => useCloseOnBack(true, onCloseBottom));
    const top = renderHook(() => useCloseOnBack(true, onCloseTop));
    const topId = getHistoryStackId(window.history.state);
    expect(topId).toBeDefined();

    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { uiStackId: topId } })
      );
    });

    expect(onCloseTop).toHaveBeenCalledTimes(1);
    expect(onCloseBottom).not.toHaveBeenCalled();

    bottom.unmount();
    top.unmount();
  });
});
