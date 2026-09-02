export const LANDING_PATH = "/landing";

export const publicRoutes = [LANDING_PATH, "/maintenance"];

export const authRoutes = [
  "/auth",
  "/auth/error",
  "/api/auth/callback/google",
  "/api/auth/callback/github",
];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/";

export const adminRoutes = ["/admin"];

export function homePathFor(isLoggedIn: boolean): string {
  return isLoggedIn ? DEFAULT_LOGIN_REDIRECT : LANDING_PATH;
}
