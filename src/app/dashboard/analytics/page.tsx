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

  // 2. Fetch all analytics for this profile (with pagination to bypass Supabase's 1000 Max Rows limit)
  let analyticsData: any[] = [];
  let analyticsError: any = null;
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  const isFree = !profile.plan || profile.plan === "free";

  while (hasMore) {
    let query = supabase
      .from("analytics")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (isFree) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      query = query.gte("created_at", cutoffDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      analyticsError = error;
      hasMore = false;
    } else if (!data || data.length === 0) {
      hasMore = false;
    } else {
      analyticsData = [...analyticsData, ...data];
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  // 3. Fetch links to map link_id to title
  const { data: links } = await supabase
    .from("links")
    .select("id, title")
    .eq("user_id", user.id);

  // 4. Fetch subscribers
  const { data: subscribers } = await supabase
    .from("email_subscribers")
    .select("*")
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
        rawData={analyticsData || []}
        links={links || []}
        subscribers={subscribers || []}
        plan={profile.plan || "free"}
      />
    </main>
  );
}
