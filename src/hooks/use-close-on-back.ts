// hooks/use-close-on-back.ts
import { type RefObject, useEffect, useRef } from "react";

let globalStackId = 0;

type HistoryState = {
  uiStackId?: number;
  [key: string]: unknown;
} | null;

interface UseCloseOnBackOptions {
  /**
   * Optional ref to the element that opened the UI.
   * When the UI closes (via back gesture or programmatic close) focus will be restored there.
   */
  restoreFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Optional ref which, when true during cleanup, prevents the hook from calling history.back()
   * (useful when you intentionally close the UI before navigating).
   */
  skipHistoryOnCloseRef?: RefObject<boolean | null>;
}

export function getHistoryStackId(state: HistoryState): number | undefined {
  if (state && typeof state === "object") {
    return state.uiStackId;
  }
  return;
}

export function buildPushedState(
  current: unknown,
  stackId: number
): Record<string, unknown> {
  if (typeof current === "object" && current !== null) {
    return { ...(current as Record<string, unknown>), uiStackId: stackId };
  }
  return { uiStackId: stackId };
}

export function shouldRemovePushedEntry(
  currentId: number | undefined,
  ownId: number,
  skipRequested: boolean,
  hrefUnchanged: boolean
): boolean {
  return currentId === ownId && !skipRequested && hrefUnchanged;
}

function pushHistoryEntry(stackId: number): void {
  try {
    const currentState = window.history.state as HistoryState;
    window.history.pushState(buildPushedState(currentState, stackId), "");
  } catch {
    // ignore pushState errors in strict/capped environments
  }
}

function consumeIgnoreFlag(flag: RefObject<boolean>): boolean {
  if (flag.current) {
    flag.current = false;
    return true;
  }
  return false;
}

function cleanupPushedEntry(
  ownId: number,
  openedHref: string | null,
  closedByPopRef: RefObject<boolean>,
  ignoreNextPop: RefObject<boolean>,
  skipHistoryOnCloseRef: RefObject<boolean | null> | undefined
): void {
  if (closedByPopRef.current) {
    closedByPopRef.current = false;
    return;
  }

  try {
    const currentId = getHistoryStackId(window.history.state as HistoryState);
    const skipRequested = Boolean(skipHistoryOnCloseRef?.current);
    const hrefUnchanged = openedHref === window.location.href;

    if (
      shouldRemovePushedEntry(currentId, ownId, skipRequested, hrefUnchanged)
    ) {
      ignoreNextPop.current = true;
      window.history.back();
    }
  } catch {
    // ignore errors from history manipulation
  }
}

function restoreFocusElement(
  ref: RefObject<HTMLElement | null> | undefined
): void {
  if (ref?.current) {
    try {
      ref.current.focus();
    } catch {
      // ignore focus errors
    }
  }
}

/**
 * Hook: close on browser back/popstate instead of navigating away.
 *
 * @param isOpen - whether the UI (drawer/dialog/sheet) is currently open
 * @param onClose - callback to close the UI
 * @param options - optional settings (e.g. restoreFocusRef)
 */
export function useCloseOnBack(
  isOpen: boolean,
  onClose: () => void,
  options?: UseCloseOnBackOptions
): void {
  const ignoreNextPop = useRef(false);
  const closedByPopRef = useRef(false);
  const openedHrefRef = useRef<string | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!isOpen) {
      return;
    }

    globalStackId += 1;
    const myId = globalStackId;
    openedHrefRef.current = window.location.href;
    pushHistoryEntry(myId);

    const onPop = (event: PopStateEvent): void => {
      if (consumeIgnoreFlag(ignoreNextPop)) {
        return;
      }

      const poppedId = getHistoryStackId((event.state as HistoryState) ?? null);
      if (poppedId === myId || poppedId === undefined) {
        closedByPopRef.current = true;
        onCloseRef.current();
      }
    };

    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      cleanupPushedEntry(
        myId,
        openedHrefRef.current,
        closedByPopRef,
        ignoreNextPop,
        optionsRef.current?.skipHistoryOnCloseRef
      );
      restoreFocusElement(optionsRef.current?.restoreFocusRef);
    };
  }, [isOpen]);
}
