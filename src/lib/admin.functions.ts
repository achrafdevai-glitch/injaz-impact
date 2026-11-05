import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type Role = Database["public"]["Enums"]["app_role"];
const ALL: Role[] = ["super_admin", "admin", "event_manager", "moderator"];
const MANAGE: Role[] = ["super_admin", "admin"];

type Ctx = { supabase: any; userId: string };

async function requireRole(ctx: Ctx, roles: Role[]) {
  for (const r of roles) {
    const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: r });
    if (data) return;
  }
  throw new Error("Forbidden");
}

async function audit(adminId: string, action: string, entity: string, entityId: string, meta: object = {}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_log").insert({ admin_id: adminId, action, entity, entity_id: entityId, meta });
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    return (data ?? []).map((r: any) => r.role as Role);
  });

/** One-time bootstrap: grants super_admin to the caller only when no admin exists yet. */
export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) throw new Error("Forbidden");
    await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "super_admin" });
    return { ok: true };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context, ALL);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const count = async (table: string, filter?: (q: any) => any) => {
      let q = supabaseAdmin.from(table).select("id", { count: "exact", head: true });
      if (filter) q = filter(q);
      return (await q).count ?? 0;
    };
    const [users, active, pendingVer, evPub, evUpcoming, evDone, evCancelled, parts, pendingSubs] = await Promise.all([
      count("profiles"),
      count("profiles", (q) => q.eq("status", "active")),
      count("profiles", (q) => q.eq("verified", false)),
      count("events", (q) => q.eq("status", "published")),
      count("events", (q) => q.eq("status", "published").gt("start_at", new Date().toISOString())),
      count("events", (q) => q.eq("status", "completed")),
      count("events", (q) => q.eq("status", "cancelled")),
      count("participations"),
      count("submissions", (q) => q.eq("status", "pending")),
    ]);
    const { data: ledger } = await supabaseAdmin.from("points_ledger").select("points, hours");
    const hours = (ledger ?? []).reduce((a: number, r: any) => a + Number(r.hours), 0);
    const points = (ledger ?? []).reduce((a: number, r: any) => a + r.points, 0);
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const [{ data: regs }, { data: partsDay }, { data: evCats }, { data: byWilaya }] = await Promise.all([
      supabaseAdmin.from("profiles").select("created_at").gte("created_at", since),
      supabaseAdmin.from("participations").select("created_at").gte("created_at", since),
      supabaseAdmin.from("events").select("category"),
      supabaseAdmin.from("profiles").select("wilaya"),
    ]);
    const byDay = (rows: any[] | null) => {
      const m = new Map<string, number>();
      (rows ?? []).forEach((r) => {
        const d = r.created_at.slice(0, 10);
        m.set(d, (m.get(d) ?? 0) + 1);
      });
      return [...m.entries()].sort().map(([day, n]) => ({ day, n }));
    };
    const group = (rows: any[] | null, key: string) => {
      const m = new Map<string, number>();
      (rows ?? []).forEach((r) => {
        const k = String(r[key] ?? "—");
        m.set(k, (m.get(k) ?? 0) + 1);
      });
      return [...m.entries()].map(([k, n]) => ({ key: k, n })).sort((a, b) => b.n - a.n);
    };
    return {
      users, active, pendingVer, evPub, evUpcoming, evDone, evCancelled, parts, pendingSubs, hours, points,
      regsByDay: byDay(regs), partsByDay: byDay(partsDay),
      eventsByCategory: group(evCats, "category"), usersByWilaya: group(byWilaya, "wilaya"),
    };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { q?: string; wilaya?: number; status?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: regs }, { data: profs }] = await Promise.all([
      supabaseAdmin.from("volunteer_registrations").select("*"),
      supabaseAdmin.from("profiles").select("*"),
    ]);
    const pmap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    let users = (regs ?? []).map((r: any) => {
      const p = pmap.get(r.user_id) ?? {};
      return {
        id: r.user_id, firstName: r.first_name, lastName: r.last_name, phone: r.phone,
        gender: r.gender, education: r.education, workType: r.work_type, freeDays: r.free_days,
        wilaya: r.wilaya, commune: r.commune, registeredAt: r.created_at,
        xp: p.xp ?? 0, points: p.points ?? 0, hours: Number(p.hours ?? 0),
        status: p.status ?? "active", verified: p.verified ?? false,
      };
    });
    const q = (data.q ?? "").trim();
    if (q) users = users.filter((u) => `${u.firstName} ${u.lastName} ${u.phone}`.includes(q));
    if (data.wilaya) users = users.filter((u) => u.wilaya === data.wilaya);
    if (data.status) users = users.filter((u) => u.status === data.status);
    return users;
  });

export const getUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: reg }, { data: prof }, { data: parts }, { data: subs }] = await Promise.all([
      supabaseAdmin.from("volunteer_registrations").select("*").eq("user_id", data.userId).maybeSingle(),
      supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.from("participations").select("*, events(title_ar, wilaya)").eq("user_id", data.userId),
      supabaseAdmin.from("submissions").select("*, events(title_ar)").eq("user_id", data.userId),
    ]);
    return { reg, prof, parts: parts ?? [], subs: subs ?? [] };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; status?: string; verified?: boolean }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: any = {};
    if (data.status) patch.status = data.status;
    if (data.verified !== undefined) patch.verified = data.verified;
    await supabaseAdmin.from("profiles").upsert({ id: data.userId, ...patch });
    await audit(context.userId, "user_update", "profiles", data.userId, patch);
    return { ok: true };
  });

export const listEventsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context, ALL);
    const { data } = await context.supabase.from("events").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, ["super_admin", "admin", "event_manager"]);
    const row = { ...data, id: data.id || undefined, created_by: context.userId };
    const { data: saved, error } = await context.supabase.from("events").upsert(row).select("id").single();
    if (error) throw new Error(error.message);
    await audit(context.userId, data.id ? "event_update" : "event_create", "events", saved.id, { title: data.title_ar });
    return { ok: true, id: saved.id };
  });

export const setEventStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, ["super_admin", "admin", "event_manager"]);
    const { error } = await context.supabase.from("events").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, "event_status", "events", data.id, { status: data.status });
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { error } = await context.supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, "event_delete", "events", data.id);
    return { ok: true };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  return (await sb.from("categories").select("*").order("key")).data ?? [];
});

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; emoji: string; name_ar: string; name_fr?: string; name_en?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { error } = await context.supabase.from("categories").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { error } = await context.supabase.from("categories").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listParticipants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { eventId: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, ALL);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: parts } = await supabaseAdmin.from("participations").select("*").eq("event_id", data.eventId);
    const ids = (parts ?? []).map((p: any) => p.user_id);
    const { data: regs } = ids.length
      ? await supabaseAdmin.from("volunteer_registrations").select("user_id, first_name, last_name, phone, wilaya").in("user_id", ids)
      : { data: [] as any[] };
    const rmap = new Map((regs ?? []).map((r: any) => [r.user_id, r]));
    return (parts ?? []).map((p: any) => ({ ...p, reg: rmap.get(p.user_id) ?? null }));
  });

export const setParticipationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string; userId?: string; eventTitle?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, ["super_admin", "admin", "event_manager"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("participations").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.userId && ["approved", "rejected"].includes(data.status)) {
      await supabaseAdmin.from("notifications").insert({
        user_id: data.userId,
        title: data.status === "approved" ? "تم قبول مشاركتك" : "تم رفض مشاركتك",
        body: data.eventTitle ?? "", kind: "participation_" + data.status,
      });
    }
    await audit(context.userId, "participation_status", "participations", data.id, { status: data.status });
    return { ok: true };
  });

export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, ALL);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("submissions").select("*, events(title_ar, xp, points, hours)").order("created_at", { ascending: false });
    if (data.status) q = q.eq("status", data.status);
    const { data: subs } = await q;
    const ids = [...new Set((subs ?? []).map((s: any) => s.user_id))];
    const { data: regs } = ids.length
      ? await supabaseAdmin.from("volunteer_registrations").select("user_id, first_name, last_name").in("user_id", ids)
      : { data: [] as any[] };
    const rmap = new Map((regs ?? []).map((r: any) => [r.user_id, r]));
    const withMedia = await Promise.all((subs ?? []).map(async (s: any) => ({
      ...s, reg: rmap.get(s.user_id) ?? null,
      mediaUrls: await Promise.all((s.media ?? []).map(async (p: string) => {
        const { data: signed } = await supabaseAdmin.storage.from("submissions").createSignedUrl(p, 3600);
        return signed?.signedUrl ?? null;
      })),
    })));
    return withMedia;
  });

export const reviewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; approve: boolean; reason?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, ["super_admin", "admin", "moderator"]);
    if (!data.approve && !data.reason?.trim()) throw new Error("سبب الرفض إلزامي");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin.from("submissions").select("*, events(xp, points, hours, title_ar)").eq("id", data.id).single();
    if (!sub) throw new Error("Not found");
    if (sub.status !== "pending") throw new Error("تمت مراجعة هذا الإثبات مسبقاً");
    await supabaseAdmin.from("submissions").update({
      status: data.approve ? "approved" : "rejected",
      review_reason: data.reason ?? null, reviewed_by: context.userId, reviewed_at: new Date().toISOString(),
    }).eq("id", data.id);
    if (data.approve) {
      const ev = sub.events ?? { xp: 0, points: 0, hours: 0 };
      const { error: ledErr } = await supabaseAdmin.from("points_ledger").insert({
        user_id: sub.user_id, submission_id: sub.id, points: ev.points, xp: ev.xp, hours: ev.hours,
      });
      if (!ledErr) {
        const { data: prof } = await supabaseAdmin.from("profiles").select("xp, points, hours").eq("id", sub.user_id).maybeSingle();
        await supabaseAdmin.from("profiles").upsert({
          id: sub.user_id,
          xp: (prof?.xp ?? 0) + ev.xp, points: (prof?.points ?? 0) + ev.points, hours: Number(prof?.hours ?? 0) + Number(ev.hours),
        });
      }
    }
    await supabaseAdmin.from("notifications").insert({
      user_id: sub.user_id,
      title: data.approve ? "تمت الموافقة على إثباتك ✅" : "تم رفض إثباتك",
      body: data.approve ? `+${sub.events?.points ?? 0} نقطة · ${sub.events?.title_ar ?? ""}` : (data.reason ?? ""),
      kind: "submission_" + (data.approve ? "approved" : "rejected"),
    });
    await audit(context.userId, data.approve ? "submission_approve" : "submission_reject", "submissions", data.id, { reason: data.reason });
    return { ok: true };
  });

export const sendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; body: string; target: "all" | "wilaya" | "event"; wilaya?: number; eventId?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let ids: string[] = [];
    if (data.target === "all") {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id");
      ids = (profs ?? []).map((p: any) => p.id);
    } else if (data.target === "wilaya" && data.wilaya) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id").eq("wilaya", data.wilaya);
      ids = (profs ?? []).map((p: any) => p.id);
    } else if (data.target === "event" && data.eventId) {
      const { data: parts } = await supabaseAdmin.from("participations").select("user_id").eq("event_id", data.eventId);
      ids = (parts ?? []).map((p: any) => p.user_id);
    }
    if (ids.length) await supabaseAdmin.from("notifications").insert(ids.map((id) => ({ user_id: id, title: data.title, body: data.body, kind: "announcement" })));
    await audit(context.userId, "notification_send", "notifications", data.target, { count: ids.length });
    return { ok: true, count: ids.length };
  });

export const listRewardsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context, MANAGE);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: rewards }, { data: redemptions }] = await Promise.all([
      supabaseAdmin.from("rewards").select("*").order("cost"),
      supabaseAdmin.from("redemptions").select("*, rewards(title)").order("created_at", { ascending: false }),
    ]);
    return { rewards: rewards ?? [], redemptions: redemptions ?? [] };
  });

export const upsertReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const row = { ...data, id: data.id || undefined };
    const { error } = await context.supabase.from("rewards").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setRedemptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, MANAGE);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("redemptions").update({ status: data.status }).eq("id", data.id);
    await audit(context.userId, "redemption_status", "redemptions", data.id, { status: data.status });
    return { ok: true };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context, ["super_admin"]);
    const { data } = await context.supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100);
    return data ?? [];
  });

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context, ["super_admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
    const ids = (roles ?? []).map((r: any) => r.user_id);
    const { data: regs } = ids.length
      ? await supabaseAdmin.from("volunteer_registrations").select("user_id, first_name, last_name").in("user_id", ids)
      : { data: [] as any[] };
    const rmap = new Map((regs ?? []).map((r: any) => [r.user_id, r]));
    return (roles ?? []).map((r: any) => ({ ...r, reg: rmap.get(r.user_id) ?? null }));
  });

export const setAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: Role; grant: boolean }) => d)
  .handler(async ({ data, context }) => {
    await requireRole(context, ["super_admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) await supabaseAdmin.from("user_roles").upsert({ user_id: data.userId, role: data.role });
    else await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    await audit(context.userId, data.grant ? "role_grant" : "role_revoke", "user_roles", data.userId, { role: data.role });
    return { ok: true };
  });
