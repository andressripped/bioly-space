import { supabase } from "@/lib/supabase";
import ProfileClient from "./ProfileClient";
import { notFound } from "next/navigation";

export const revalidate = 60; // revalidate every minute

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  // 1. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    // Si no existe en la base de datos, mostramos un 404
    notFound();
  }

  // 2. Fetch Socials
  const { data: socials } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profile.id)
    .order("order_index", { ascending: true });

  // 3. Fetch Links
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", profile.id)
    .order("order_index", { ascending: true });

  return (
    <ProfileClient 
      profile={profile} 
      socials={socials || []} 
      links={links || []} 
    />
  );
}
