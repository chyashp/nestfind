import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Role-based dashboard access
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "buyer";

    if (pathname.startsWith("/dashboard/owner") && role !== "owner" && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
    if (pathname.startsWith("/dashboard/buyer") && role !== "buyer" && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    // Redirect /dashboard to role-specific dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    const authRole = profile?.role || user.user_metadata?.role || "buyer";
    return NextResponse.redirect(
      new URL(`/dashboard/${authRole}`, request.url)
    );
  }

  return supabaseResponse;
}
