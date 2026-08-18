// Fire-and-forget: tells the server to regenerate the cached public profile
// page right away, instead of waiting for its normal revalidate window.
// Never awaited by callers — a failure here just means the visitor sees the
// old version for up to an hour (the ISR revalidate window), not a broken save.
export function revalidateProfile(username: string) {
  if (!username) return;
  fetch("/api/revalidate-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  }).catch(() => {});
}
