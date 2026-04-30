import NextAuth from "next-auth";
import authConfig from "@/auth.config";

import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "./routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  const isInMaintenance = process.env.NEXT_PUBLIC_IS_IN_MAINTENANCE === "true";

  if (isInMaintenance && !nextUrl.pathname.startsWith("/maintenance")) {
    return Response.redirect(new URL("/maintenance", nextUrl));
  }

  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  // Allow access to public routes without authentication
  if (nextUrl.pathname.startsWith("/api/public")) {
    return;
  }

  if (!(isLoggedIn || isPublicRoute)) {
    return Response.redirect(new URL("/auth", nextUrl), 302);
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
