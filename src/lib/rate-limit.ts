import { NextResponse } from "next/server";

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

// In-memory store for Node.js environments
const rateLimitMap = new Map<string, RateLimitInfo>();

// Prune map every 15 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimitMap.entries()) {
    if (now > info.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 15 * 60 * 1000);

/**
 * Basic in-memory rate limiter for API Routes.
 * Max 15 requests per minute per IP.
 */
export function checkRateLimit(
  req: Request,
  maxPoints: number = 15,
  windowMs: number = 60000
): NextResponse | null {
  // Try to get IP from standard headers
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown_ip";

  const now = Date.now();
  let info = rateLimitMap.get(ip);

  if (!info || now > info.resetAt) {
    info = { count: 1, resetAt: now + windowMs };
  } else {
    info.count++;
  }

  rateLimitMap.set(ip, info);

  if (info.count > maxPoints) {
    return NextResponse.json(
      {
        success: false,
        error: "Gerçek üstü hızlara ulaştınız! Lütfen bir dakika bekleyip tekrar deneyin. (Too Many Requests)",
      },
      { status: 429 }
    );
  }

  return null;
}
