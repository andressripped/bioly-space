import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
    const country = request.headers.get("x-vercel-ip-country") || null;
    const city = request.headers.get("x-vercel-ip-city") || null;

    const supabase = await createClient();

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
      // If analytics table doesn't exist yet, fail silently (don't break the page)
      console.warn("Analytics insert failed (table may not exist yet):", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Track API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
