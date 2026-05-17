import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // 2. Fetch daily and dimension summaries based on plan timeframe (7 days for free, all time for pro/business)
  const isFree = !profile.plan || profile.plan === "free";

  let dailyQuery = supabase
    .from("analytics_daily_summary")
    .select("date, views_count, clicks_count")
    .eq("profile_id", profile.id)
    .order("date", { ascending: false });

  let dimensionQuery = supabase
    .from("analytics_dimension_summary")
    .select("date, dimension_type, dimension_value, event_type, count")
    .eq("profile_id", profile.id)
    .range(0, 4999);

  let sharesQuery = supabase
    .from("analytics")
    .select("created_at")
    .eq("profile_id", profile.id)
    .eq("event_type", "share");

  if (isFree) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffStr = cutoffDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const cutoffISO = cutoffDate.toISOString();

    dailyQuery = dailyQuery.gte("date", cutoffStr);
    sharesQuery = sharesQuery.gte("created_at", cutoffISO);
  }

  const { data: dailyData, error: dailyError } = await dailyQuery;
  const { data: dimensionData, error: dimensionError } = await dimensionQuery;
  const { data: sharesData } = await sharesQuery;

  if (dailyError) console.error("DAILY_SUMMARY_ERROR:", dailyError);
  if (dimensionError) console.error("DIMENSION_SUMMARY_ERROR:", dimensionError);

  // TEMPORARY LOCAL DIAGNOSTIC DUMP
  try {
    const fs = require("fs");
    const path = require("path");
    fs.writeFileSync(path.join(process.cwd(), "dimension_debug.json"), JSON.stringify(dimensionData, null, 2));
  } catch (e: any) {
    console.error("Debug write failed:", e.message);
  }

  // 3. Fetch links to map link_id to title (uses user_id column)
  const { data: links } = await supabase
    .from("links")
    .select("id, title")
    .eq("user_id", user.id);

  // 4. Fetch email subscribers (uses email_subscribers table)
  const { data: subscribers } = await supabase
    .from("email_subscribers")
    .select("id, email, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <main className="w-full p-6 md:p-12 max-w-5xl mx-auto">
      <div className="mb-10 mt-16 md:mt-0">
        <h1 className="text-3xl font-serif font-bold text-[#111111] dark:text-white mb-2">
          Analíticas y Audiencia
        </h1>
        <p className="text-[#555555] dark:text-[#a1a1aa]">
          Mide el impacto de tu identidad digital y tu lista de correos.
        </p>
      </div>

      <AnalyticsClient 
        profileId={profile.id}
        dailyData={dailyData || []} 
        dimensionData={dimensionData || []} 
        sharesData={sharesData || []}
        links={links || []} 
        subscribers={subscribers || []}
        plan={profile.plan || "free"}
      />
    </main>
  );
}
