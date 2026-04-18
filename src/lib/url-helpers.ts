/**
 * Returns the site URL for redirects.
 * Prioritizes NEXT_PUBLIC_SITE_URL, then NEXT_PUBLIC_VERCEL_URL, then localhost.
 */
export const getURL = () => {
  // Use window.location.origin if available (client-side)
  if (typeof window !== "undefined") {
    return window.location.origin.endsWith("/")
      ? window.location.origin
      : `${window.location.origin}/`;
  }

  // Server-side environment variables
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000/";

  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  
  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;
  
  return url;
};
