import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { routing } from "@/i18n/routing"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  const pathname = requestUrl.pathname
  const segments = pathname.split("/").filter(Boolean)
  const locale =
    segments[0] && routing.locales.includes(segments[0] as "en" | "mn")
      ? segments[0]
      : routing.defaultLocale

  let redirectPath = next ?? "/student"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .maybeSingle()

      if (!profile) {
        await (supabase as any)
          .from("user_profiles")
          .upsert(
            {
              id: data.user.id,
              role: "student",
              full_name:
                data.user.user_metadata?.full_name ??
                data.user.user_metadata?.name ??
                null,
            },
            { onConflict: "id" }
          )
        redirectPath = next ?? "/student"
      } else if (profile.role === "studio_owner") {
        redirectPath = next ?? "/studio"
      } else {
        redirectPath = next ?? "/student"
      }
    }
  }

  const finalPath = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`
  return NextResponse.redirect(new URL(`/${locale}${finalPath}`, requestUrl.origin))
}
