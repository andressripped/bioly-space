import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProfileView from "./ProfileView";

type Props = {
  params: Promise<{ username: string }>;
};

// ─── Dynamic Open Graph Metadata ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url, username")
    .eq("username", username)
    .single();

  if (!profile) {
    return {
      title: "Perfil no encontrado | Bioly",
    };
  }

  const displayName = profile.display_name || profile.username;
  const bio = profile.bio || "Mira todos mis links en Bioly";
  const ogImageUrl = `/api/og/${username}`;

  return {
    title: `${displayName} | Bioly`,
    description: bio,
    openGraph: {
      title: `${displayName} | Bioly`,
      description: bio,
      url: `https://bioly.space/${username}`,
      siteName: "Bioly",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} en Bioly`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | Bioly`,
      description: bio,
      images: [ogImageUrl],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return notFound();
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position", { ascending: true });

  return (
    <ProfileView
      profile={profile}
      links={links || []}
    />
  );
}
