import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { NextResponse, after } from "next/server";

// Module-level singleton: reused across invocations on the same warm
// instance instead of re-instantiated (and re-authenticated) on every
// request, which was a meaningful chunk of this route's latency.
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile_id, link_id, event_type } = body;

    if (!profile_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Parse device info from User-Agent
    const userAgent = request.headers.get("user-agent") || "";
    let device = "desktop";
    if (/mobile|android|iphone|ipad/i.test(userAgent)) device = "mobile";
    else if (/tablet|ipad/i.test(userAgent)) device = "tablet";

    // Parse browser
    let browser = "other";
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = "chrome";
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "safari";
    else if (/firefox/i.test(userAgent)) browser = "firefox";
    else if (/edge/i.test(userAgent)) browser = "edge";

    // Get referrer from body (passed from client)
    const referrer = body.referrer || null;

    // Get country from Vercel's geo headers (works in production)
    let country = request.headers.get("x-vercel-ip-country") || null;
    let city = request.headers.get("x-vercel-ip-city") || null;

    if (city) {
      try {
        city = decodeURIComponent(city);
      } catch (e) {
        // Fallback to original
      }
    }
    if (country) {
      try {
        country = decodeURIComponent(country);
      } catch (e) {
        // Fallback to original
      }
    }

    // Si tenemos la Service Role Key (en Vercel/Producción), la usamos para saltarnos RLS completamente y registrar de forma segura
    const supabase = supabaseAdmin || (await createClient());

    // Respond immediately; do the actual insert after the response is sent.
    // `profile_id` is still validated — not with an extra SELECT round-trip
    // beforehand, but by the `analytics_profile_id_fkey` foreign key
    // constraint, which Postgres enforces on the insert itself regardless
    // of RLS. An invalid id fails the insert (logged, not thrown) instead
    // of ever reaching the table.
    after(async () => {
      const { error } = await supabase.from("analytics").insert({
        profile_id,
        link_id: link_id || null,
        event_type,
        referrer,
        country,
        city,
        device,
        browser,
      });

      if (error) {
        // Code 23503 = foreign key violation (invalid profile_id) — expected
        // occasionally from stale/forged requests, not worth logging loudly.
        if (error.code !== "23503") {
          console.warn("Analytics insert failed:", error.message);
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Track API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
