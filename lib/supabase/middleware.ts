import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PUBLIC_PATHS = ["/login"];

/**
 * Refreshes the Supabase session cookie on every request and gates protected
 * routes. Keep this lean — authorization itself lives in RLS, this only decides
 * "signed in or not" for navigation.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  if (!user && !isPublic) {
    // Fail open ONLY when a session cookie is present but verification errored
    // (e.g. a transient Supabase Auth rate-limit/timeout under load). Bouncing a
    // valid user to /login here would be a false logout; the page's own
    // getCurrentProfile() + RLS still enforce real access. With no cookie (or a
    // clean "not authenticated" result), redirect as before.
    if (!(hasAuthCookie && error)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/"; // "/" routes by role (therapist → dashboard, parent → child)
    return NextResponse.redirect(url);
  }

  return response;
}
