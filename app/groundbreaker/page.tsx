"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Types ────────────────────────────────────────────────────
interface Prospect {
  prospect_id:            string;
  prospect_name:          string;
  prospect_whatsapp:      string | null;
  session_1_started_at:   string | null;
  session_3_completed_at: string | null;
  session_6_completed_at: string | null;
  session_9_completed_at: string | null;
  vision_board_done:      boolean;
  harvest_ready:          boolean;
  converted_to_paid:      boolean;
  pipeline_stage:         string;
}

interface Alert {
  id:            string;
  prospect_name: string;
  alert_type:    "seed" | "vision" | "harvest";
  session_num:   number;
  message:       string;
  read:          boolean;
  created_at:    string;
}

interface Builder {
  full_name:     string;
  referral_code: string;
}

// ── Helpers ──────────────────────────────────────────────────
const stageConfig: Record<string, { color: string; bg: string; icon: string }> = {
  "🔥 Harvest Ready":  { color: "#EF4444", bg: "rgba(239,68,68,0.12)",    icon: "🔥" },
  "🌱 Vision Built":   { color: "#D4AF37", bg: "rgba(212,175,55,0.10)",   icon: "🌱" },
  "🌱 Seed Planted":   { color: "#22C55E", bg: "rgba(34,197,94,0.10)",    icon: "🌱" },
  "👀 Just Started":   { color: "#0EA5E9", bg: "rgba(14,165,233,0.10)",   icon: "👀" },
  "⏳ Not Started":    { color: "#6B7280", bg: "rgba(107,114,128,0.08)",  icon: "⏳" },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function sessionsDone(p: Prospect): number {
  if (p.session_9_completed_at) return 9;
  if (p.session_6_completed_at) return 6;
  if (p.session_3_completed_at) return 3;
  if (p.session_1_started_at)   return 1;
  return 0;
}

// ── Main Component ───────────────────────────────────────────
export default function GroundBreakerPage() {
  const [builder,    setBuilder]    = useState<Builder | null>(null);
  const [prospects,  setProspects]  = useState<Prospect[]>([]);
  const [alerts,     setAlerts]     = useState<Alert[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<"pipeline" | "alerts" | "share">("pipeline");
  const [filter,     setFilter]     = useState<string>("all");
  const [selected,   setSelected]   = useState<Prospect | null>(null);
  const [authError,  setAuthError]  = useState(false);

  const gold    = "#D4AF37";
  const purple  = "#9333EA";
  const bg      = "#0A0015";
  const card    = "rgba(255,255,255,0.04)";

  // ── Load data ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAuthError(true); setLoading(false); return; }

    // Builder profile
    let { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, referral_code, user_role, email")
      .eq("id", user.id)
      .single();

    // Auto-create profile if missing
    if (!profile) {
      const refCode = `${(user.email || 'ZZZ').slice(0,3).toUpperCase()}${Math.random().toString(36).slice(2,6).toUpperCase()}`
      await supabase.from("profiles").upsert({
        id: user.id, email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Builder',
        user_role: 'fam', referral_code: refCode,
        is_paid_member: false, joined_at: new Date().toISOString(),
      })
      profile = { id: user.id, full_name: user.email?.split('@')[0] || 'Builder', referral_code: refCode, user_role: 'fam', email: user.email }
    }

    // Auto-generate referral code if missing
    if (!profile.referral_code) {
      const refCode = `${(user.email || 'ZZZ').slice(0,3).toUpperCase()}${Math.random().toString(36).slice(2,6).toUpperCase()}`
      await supabase.from("profiles").update({ referral_code: refCode }).eq("id", user.id)
      profile.referral_code = refCode
    }

    setBuilder(profile);

    // Prospects via pipeline view
    const { data: pipe } = await supabase
      .from("builder_prospect_pipeline")
      .select("*")
      .order("session_9_completed_at", { ascending: false });
    setProspects(pipe || []);

    // Alerts
    const { data: alertData } = await supabase
      .from("builder_alerts")
      .select("*")
      .eq("builder_code", profile.referral_code)
      .order("created_at", { ascending: false })
      .limit(50);
    setAlerts(alertData || []);

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Mark alerts read
  const markAllRead = async () => {
    if (!builder) return;
    await supabase
      .from("builder_alerts")
      .update({ read: true })
      .eq("builder_code", builder.referral_code)
      .eq("read", false);
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  // ── Derived ────────────────────────────────────────────────
  const unread      = alerts.filter(a => !a.read).length;
  const harvested   = prospects.filter(p => p.harvest_ready && !p.converted_to_paid).length;
  const converted   = prospects.filter(p => p.converted_to_paid).length;
  const active      = prospects.filter(p => p.session_1_started_at && !p.harvest_ready).length;

  const filtered = filter === "all" ? prospects
    : prospects.filter(p => p.pipeline_stage === filter);

  const referralUrl = builder
    ? `https://app.z2blegacybuilders.co.za/workshop?ref=${builder.referral_code}`
    : "";

  const shareCaption = `🔥 Are you tired of your salary not being enough?\n\nI found something that's changing how ordinary employees build extra income — without quitting their job.\n\nStart your FREE 9-session journey here 👇\n${referralUrl}\n\n#Z2BTable #EntrepreneurialConsumer #Legacy`;

  // ── Styles ─────────────────────────────────────────────────
  const S = {
    page:    { minHeight: "100vh", background: bg, color: "#fff", fontFamily: "system-ui, sans-serif", paddingBottom: "40px" } as React.CSSProperties,
    header:  { background: "linear-gradient(135deg, #1A0035, #0D0020)", borderBottom: "1px solid rgba(212,175,55,0.2)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" } as React.CSSProperties,
    logo:    { fontSize: "16px", fontWeight: "bold", color: gold } as React.CSSProperties,
    body:    { maxWidth: "760px", margin: "0 auto", padding: "20px 16px" } as React.CSSProperties,
    stat:    { background: card, border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "center" as const },
    statNum: { fontSize: "28px", fontWeight: "bold", color: gold, display: "block" },
    statLbl: { fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase" as const },
    tab:     (active: boolean) => ({
      flex: 1, padding: "10px 4px", textAlign: "center" as const,
      background: active ? "rgba(212,175,55,0.15)" : "transparent",
      border: `1px solid ${active ? gold : "rgba(255,255,255,0.08)"}`,
      borderRadius: "8px", cursor: "pointer",
      color: active ? gold : "rgba(255,255,255,0.5)",
      fontSize: "12px", fontWeight: active ? "bold" : "normal",
    }),
  };

  // ── Auth guard ─────────────────────────────────────────────
  if (authError) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
        <div style={{ fontSize: "18px", color: gold, marginBottom: "8px" }}>Builder Login Required</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>You need a Z2B Builder account to access GroundBreaker.</div>
        <a href="/workshop" style={{ background: `linear-gradient(135deg, #6B21A8, ${purple})`, color: "#fff", padding: "12px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold" }}>
          Go to Workshop
        </a>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🌱</div>
        <div style={{ color: gold, fontSize: "16px" }}>Loading your pipeline...</div>
      </div>
    </div>
  );

  // ── Prospect detail modal ──────────────────────────────────
  const ProspectModal = ({ p }: { p: Prospect }) => {
    const done = sessionsDone(p);
    const cfg  = stageConfig[p.pipeline_stage] || stageConfig["⏳ Not Started"];
    const waMsg = encodeURIComponent(
      `Hi ${p.prospect_name.split(" ")[0]} 👋 I see you've been going through the Z2B Workshop — how are you finding it so far? I'd love to chat about your journey and what's possible for you from here.`
    );
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 1000, padding: "0 16px",
      }}
        onClick={() => setSelected(null)}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#1A0035", border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "20px 20px 0 0", padding: "24px",
            width: "100%", maxWidth: "560px", maxHeight: "80vh", overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>{p.prospect_name}</div>
              {p.prospect_whatsapp && (
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{p.prospect_whatsapp}</div>
              )}
            </div>
            <div style={{ background: cfg.bg, color: cfg.color, fontSize: "12px", fontWeight: "bold", padding: "6px 12px", borderRadius: "20px" }}>
              {p.pipeline_stage}
            </div>
          </div>

          {/* Session progress bar */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>
              <span>Session Progress</span><span>{done}/9 free sessions</span>
            </div>
            <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "4px",
                width: `${(done / 9) * 100}%`,
                background: p.harvest_ready
                  ? "linear-gradient(90deg, #EF4444, #F97316)"
                  : "linear-gradient(90deg, #22C55E, #D4AF37)",
                transition: "width 0.4s",
              }} />
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: "20px" }}>
            {[
              { label: "Started Session 1", time: p.session_1_started_at, icon: "👀", color: "#0EA5E9" },
              { label: "Completed Session 3 — Seed Planted", time: p.session_3_completed_at, icon: "🌱", color: "#22C55E" },
              { label: "Completed Session 6 — Vision Built", time: p.session_6_completed_at, icon: "🏆", color: gold },
              { label: "Completed Session 9 — Harvest Ready", time: p.session_9_completed_at, icon: "🔥", color: "#EF4444" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "10px", opacity: step.time ? 1 : 0.35 }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: step.time ? `${step.color}25` : "rgba(255,255,255,0.05)",
                  border: `2px solid ${step.time ? step.color : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
                }}>
                  {step.time ? step.icon : "○"}
                </div>
                <div style={{ flex: 1, paddingTop: "4px" }}>
                  <div style={{ fontSize: "13px", color: step.time ? "#fff" : "rgba(255,255,255,0.4)" }}>{step.label}</div>
                  {step.time && <div style={{ fontSize: "11px", color: step.color, marginTop: "1px" }}>{timeAgo(step.time)}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {p.harvest_ready && !p.converted_to_paid && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", color: "#FCA5A5", fontWeight: "bold", marginBottom: "4px" }}>🔥 This prospect is HARVEST READY</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>They have completed all 9 free sessions. This is your window — reach out now.</div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {p.prospect_whatsapp && (
              <a
                href={`https://wa.me/${p.prospect_whatsapp.replace(/\D/g, "")}?text=${waMsg}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "block", background: "#25D366", color: "#fff", borderRadius: "10px", padding: "12px", textAlign: "center", fontWeight: "bold", fontSize: "14px", textDecoration: "none" }}
              >
                💬 Message on WhatsApp
              </a>
            )}
            <button
              onClick={() => setSelected(null)}
              style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>🌱 GroundBreaker</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          {builder?.full_name?.split(" ")[0]}&apos;s Pipeline
        </div>
        <a href="/workshop" style={{ fontSize: "12px", color: gold, textDecoration: "none" }}>← Workshop</a>
      </div>

      <div style={S.body}>

        {/* Unread alert banner */}
        {unread > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: "13px", color: "#FCA5A5", fontWeight: "bold" }}>
              🔥 {unread} new alert{unread !== 1 ? "s" : ""} — prospect activity detected
            </div>
            <button onClick={() => { setActiveTab("alerts"); markAllRead(); }}
              style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}>
              View
            </button>
          </div>
        )}

        {/* Harvest ready banner */}
        {harvested > 0 && (
          <div style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(212,175,55,0.1))",
            border: "2px solid #EF4444", borderRadius: "12px", padding: "16px",
            marginBottom: "16px",
          }}>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#EF4444", marginBottom: "4px" }}>
              🔥 {harvested} prospect{harvested !== 1 ? "s" : ""} HARVEST READY
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
              {harvested === 1 ? "This person has" : "These people have"} completed all 9 free sessions.
              Your window is open — reach out now before the moment passes.
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { num: prospects.length, label: "Total",     color: gold },
            { num: active,           label: "Active",    color: "#0EA5E9" },
            { num: harvested,        label: "Harvest",   color: "#EF4444" },
            { num: converted,        label: "Converted", color: "#22C55E" },
          ].map((s, i) => (
            <div key={i} style={S.stat}>
              <span style={{ ...S.statNum, color: s.color }}>{s.num}</span>
              <span style={S.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {([
            { key: "pipeline", label: "🌱 Pipeline" },
            { key: "alerts",   label: `🔔 Alerts${unread > 0 ? ` (${unread})` : ""}` },
            { key: "share",    label: "📤 Share" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); if (t.key === "alerts") markAllRead(); }}
              style={S.tab(activeTab === t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PIPELINE TAB ──────────────────────────────────── */}
        {activeTab === "pipeline" && (
          <div>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" as const }}>
              {["all", "🔥 Harvest Ready", "🌱 Vision Built", "🌱 Seed Planted", "👀 Just Started"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${filter === f ? gold : "rgba(255,255,255,0.1)"}`,
                    color: filter === f ? gold : "rgba(255,255,255,0.5)",
                    borderRadius: "20px", padding: "6px 14px", fontSize: "12px",
                    cursor: "pointer", fontWeight: filter === f ? "bold" : "normal",
                  }}>
                  {f === "all" ? `All (${prospects.length})` : f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌱</div>
                <div style={{ fontSize: "16px", color: gold, marginBottom: "8px" }}>No prospects yet</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                  Share your referral link to start cultivating your pipeline.
                </div>
                <button onClick={() => setActiveTab("share")}
                  style={{ marginTop: "16px", background: `linear-gradient(135deg, #B8860B, ${gold})`, color: "#000", border: "none", borderRadius: "10px", padding: "12px 24px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
                  Share My Link →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map(p => {
                  const cfg  = stageConfig[p.pipeline_stage] || stageConfig["⏳ Not Started"];
                  const done = sessionsDone(p);
                  return (
                    <div key={p.prospect_id}
                      onClick={() => setSelected(p)}
                      style={{
                        background: p.harvest_ready ? "rgba(239,68,68,0.06)" : card,
                        border: `1.5px solid ${p.harvest_ready ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "14px", padding: "14px 16px", cursor: "pointer",
                        transition: "all 0.2s",
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                          background: cfg.bg, border: `2px solid ${cfg.color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "18px",
                        }}>
                          {cfg.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}>{p.prospect_name}</div>
                            <div style={{ fontSize: "11px", color: cfg.color, fontWeight: "bold" }}>{p.pipeline_stage.replace(/[🔥🌱👀⏳]/g, "").trim()}</div>
                          </div>
                          {/* Mini progress bar */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: "2px",
                                width: `${(done / 9) * 100}%`,
                                background: p.harvest_ready ? "#EF4444" : `linear-gradient(90deg, #22C55E, ${gold})`,
                              }} />
                            </div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", minWidth: "32px" }}>
                              {done}/9
                            </div>
                          </div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
                            Last activity: {timeAgo(p.session_9_completed_at || p.session_6_completed_at || p.session_3_completed_at || p.session_1_started_at)}
                          </div>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "16px" }}>›</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ALERTS TAB ────────────────────────────────────── */}
        {activeTab === "alerts" && (
          <div>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔔</div>
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)" }}>No alerts yet. Alerts appear when your prospects hit key milestones.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {alerts.map(a => {
                  const alertCfg = {
                    seed:    { color: "#22C55E", bg: "rgba(34,197,94,0.08)",   icon: "🌱", label: "Seed Planted" },
                    vision:  { color: gold,       bg: "rgba(212,175,55,0.08)", icon: "🏆", label: "Vision Built" },
                    harvest: { color: "#EF4444",  bg: "rgba(239,68,68,0.10)",  icon: "🔥", label: "Harvest Ready" },
                  }[a.alert_type];
                  return (
                    <div key={a.id} style={{
                      background: a.read ? card : alertCfg.bg,
                      border: `1.5px solid ${a.read ? "rgba(255,255,255,0.08)" : alertCfg.color}`,
                      borderRadius: "12px", padding: "14px 16px",
                    }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ fontSize: "24px", flexShrink: 0 }}>{alertCfg.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <div style={{ fontSize: "12px", fontWeight: "bold", color: alertCfg.color, letterSpacing: "0.5px" }}>
                              {alertCfg.label} — Session {a.session_num}
                            </div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                              {timeAgo(a.created_at)}
                            </div>
                          </div>
                          <div style={{ fontSize: "13px", color: a.read ? "rgba(255,255,255,0.6)" : "#fff", lineHeight: 1.6 }}>
                            {a.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SHARE TAB ─────────────────────────────────────── */}
        {activeTab === "share" && (
          <div>
            <div style={{ background: card, border: "1px solid rgba(212,175,55,0.25)", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", letterSpacing: "1px" }}>YOUR GROUNDBREAKER LINK</div>
              <div style={{ fontSize: "13px", color: gold, wordBreak: "break-all" as const, marginBottom: "12px", fontFamily: "monospace" }}>
                {referralUrl}
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(referralUrl)}
                style={{ background: `linear-gradient(135deg, #B8860B, ${gold})`, color: "#000", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>
                📋 Copy Link
              </button>
            </div>

            <div style={{ background: card, border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", letterSpacing: "1px" }}>READY-TO-SHARE CAPTION</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "12px", fontStyle: "italic" }}>
                {shareCaption.split("\n").map((line, i) => <div key={i}>{line || <br />}</div>)}
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(shareCaption)}
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 20px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>
                📋 Copy Caption
              </button>
            </div>

            <div style={{ background: card, border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ fontSize: "13px", color: gold, fontWeight: "bold", marginBottom: "12px" }}>🌱 The GroundBreaker Farming Process</div>
              {[
                { step: "1", label: "Share your link", desc: "Prospect lands on the workshop with your ref code attached" },
                { step: "2", label: "Session 3 complete", desc: "You get a Seed Planted alert — they are engaged" },
                { step: "3", label: "Session 6 complete", desc: "You get a Vision Built alert — they are emotionally invested" },
                { step: "4", label: "Session 9 complete", desc: "🔥 HARVEST READY — reach out now, they are prepared" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `rgba(212,175,55,0.2)`, border: `2px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: gold, flexShrink: 0 }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", marginBottom: "2px" }}>{s.label}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prospect modal */}
      {selected && <ProspectModal p={selected} />}
    </div>
  );
}