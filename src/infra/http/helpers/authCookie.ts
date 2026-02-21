import { CookieOptions, Request } from "express";

function isHttpsRequest(req: Request): boolean {
  const forwardedProto = req.headers["x-forwarded-proto"];

  if (Array.isArray(forwardedProto)) {
    return forwardedProto.includes("https");
  }

  return req.secure || forwardedProto === "https";
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isCrossSiteRequest(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.hostname !== req.hostname;
  } catch {
    return false;
  }
}

export function getAuthCookieOptions(req: Request): CookieOptions {
  const secure = isHttpsRequest(req) || isLocalhost(req.hostname);
  const sameSite = isCrossSiteRequest(req) && secure ? "none" : "lax";

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export function getAuthCookieClearOptions(req: Request): CookieOptions {
  const secure = isHttpsRequest(req) || isLocalhost(req.hostname);
  const sameSite = isCrossSiteRequest(req) && secure ? "none" : "lax";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };
}
