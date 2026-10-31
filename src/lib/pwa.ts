// Single guarded service-worker registration wrapper. Never registers in dev or Lovable previews.
const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const h = window.location.hostname.toLowerCase();
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  const previewLabel = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
  const first = h.split(".")[0] ?? "";
  for (const d of [".lovable.app", ".gpt-eng.com", ".gptengineer.run"]) {
    if (h.endsWith(d) && (previewLabel.test(first) || /^project--.+-dev$/.test(first))) return true;
  }
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  return false;
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => r.active?.scriptURL.endsWith(SW_URL) || r.installing?.scriptURL.endsWith(SW_URL))
        .map((r) => r.unregister()),
    );
    return;
  }
  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch (e) {
    console.warn("SW registration failed", e);
  }
}
