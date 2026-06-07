import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth session on every admin request and forwards the
 * updated auth cookies to both the request (for the Server Components that run
 * after this proxy) and the response (for the browser). Without this, Server
 * Components cannot rotate an expired access token and the admin session
 * silently drops after the token TTL — this is the pattern required by
 * `@supabase/ssr`. (Next.js 16 renamed the `middleware` convention to `proxy`.)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not configured: nothing to refresh, let the request through.
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    // Touch the session so an expired access token gets rotated and the new
    // cookies are written to `response` via `setAll` above.
    await supabase.auth.getUser();
  } catch {
    // Supabase unreachable / transient error: don't block the request.
  }

  return response;
}

export const config = {
  // Only the admin area needs an authenticated, refreshed session.
  matcher: ["/admin/:path*"],
};
