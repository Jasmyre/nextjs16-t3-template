/**
 * Offline retry seam (issue #44): reloads the failed navigation so the
 * offline fallback page recovers the original page when the network returns.
 * Kept behind this helper because `window.location` is unforgeable in test
 * environments — the unit suite pins the call through a module mock.
 */
export function reloadPage(): void {
  window.location.reload();
}
