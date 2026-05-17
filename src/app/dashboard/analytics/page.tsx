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

  // 2. Fetch all analytics for this profile
  let analyticsQuery = supabase
    .from("analytics")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (!profile.plan || profile.plan === "free") {
    // Free: Solo últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    analyticsQuery = analyticsQuery.gte("created_at", sevenDaysAgo.toISOString());
  } else {
    // Pro/Business: Histórico completo (limitamos a 5000 por rendimiento)
    analyticsQuery = analyticsQuery.limit(5000);
  }

  const { data: analyticsData } = await analyticsQuery;

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
