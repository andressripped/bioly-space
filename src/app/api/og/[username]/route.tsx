import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  // Fetch profile data
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url, username, theme_color")
    .eq("username", username)
    .single();

  const displayName = profile?.display_name || profile?.username || username;
  const bio = profile?.bio || "Mira todos mis links en Bioly";
  const themeColor = profile?.theme_color || "#111111";
  const avatarUrl = profile?.avatar_url || null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top color banner */}
        <div
          style={{
            width: "100%",
            height: "200px",
            backgroundColor: themeColor,
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            padding: "0 80px 60px",
            marginTop: "-70px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "70px",
              border: "6px solid #ffffff",
              overflow: "hidden",
              backgroundColor: "#eeeeee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  fontSize: "60px",
                  fontWeight: "bold",
                  color: "#999999",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: "800",
              color: "#111111",
              marginBottom: "12px",
              textAlign: "center",
              letterSpacing: "-1px",
            }}
          >
            {displayName}
          </div>

          {/* Bio */}
          <div
            style={{
              fontSize: "24px",
              color: "#666666",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: "1.4",
              marginBottom: "40px",
            }}
          >
            {bio}
          </div>

          {/* bioly badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#f9fafb",
              border: "2px solid #eeeeee",
              borderRadius: "40px",
              padding: "10px 24px",
            }}
          >
            <span style={{ fontSize: "16px", color: "#999999", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
              bioly.space/
            </span>
            <span style={{ fontSize: "18px", color: "#111111", fontWeight: "800" }}>
              {username}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
