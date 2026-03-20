"use client";
import React, { useState } from "react";

const gold   = "#D4AF37";
const purple = "#9333EA";
const bg     = "#0A0015";

const tiers = [
  {
    name:      "FAM",
    price:     "R0",
    badge:     null,
    highlight: false,
    color:     "#6B7280",
    border:    "rgba(107,114,128,0.3)",
    bg:        "rgba(107,114,128,0.06)",
    isp:       "10% ISP",
    tpb:       null,
    sessions:  "Sessions 1–9 Free",
    cta:       "Start Free",
    href:      "/workshop",
    training: [
      "Basic access to feed",
      "Create personal channel",
      "Earn referral commissions",
      "Access public content",
      "Sessions 1–9 Workshop",
      "Mirror Moment & Identity Selector",
      "Coach Manlaw AI — 3 chats/session",
    ],
    sales: [
      "10% Individual Sales Profit (ISP)",
      "Promote Z2B products & memberships",
      "GroundBreaker referral dashboard",
      "Optional CEO Competitions",
    ],
    notIncluded: [
      "No Team Performance Bonus (TPB)",
      "No Quick Pathfinder Bonus (QPB)",
      "No Marketplace access",
    ],
  },
  {
    name:      "Bronze",
    price:     "R480",
    badge:     "MOST POPULAR",
    highlight: true,
    color:     "#CD7F32",
    border:    "rgba(205,127,50,0.5)",
    bg:        "rgba(205,127,50,0.08)",
    isp:       "18% ISP",
    tpb:       "TPB Gen 3",
    sessions:  "All 90 Sessions",
    cta:       "Upgrade to Bronze",
    href:      "/register?tier=bronze",
    training: [
      "All FAM benefits",
      "All 90 Workshop Sessions — lifetime",
      "Full Vision Board — save & download",
      "Coach Manlaw AI — unlimited",
      "GroundBreaker referral dashboard",
      "TableBuilder team dashboard",
      "Priority support",
      "Bronze badge",
      "Z2B Builder certificate",
    ],
    sales: [
      "18% Individual Sales Profit (ISP)",
      "Quick Pathfinder Bonus (QPB) eligible",
      "Team Performance Bonus (TPB) — Gen 3",
      "Participate in CEO Competitions",
    ],
    notIncluded: [],
  },
  {
    name:      "Copper",
    price:     "R1,200",
    badge:     null,
    highlight: false,
    color:     "#B87333",
    border:    "rgba(184,115,51,0.4)",
    bg:        "rgba(184,115,51,0.07)",
    isp:       "22% ISP",
    tpb:       "TPB Gen 4",
    sessions:  "All 90 Sessions",
    cta:       "Upgrade to Copper",
    href:      "/register?tier=copper",
    training: [
      "All Bronze benefits",
      "Advanced training modules",
      "Monthly group coaching",
      "TableBuilder team dashboard",
      "Weekly digest reports",
      "Copper badge",
    ],
    sales: [
      "22% Individual Sales Profit (ISP)",
      "Quick Pathfinder Bonus (QPB) eligible",
      "Team Performance Bonus (TPB) — Gen 4",
      "Participate in CEO Competitions",
    ],
    notIncluded: [],
  },
  {
    name:      "Silver",
    price:     "R2,500",
    badge:     null,
    highlight: false,
    color:     "#C0C0C0",
    border:    "rgba(192,192,192,0.4)",
    bg:        "rgba(192,192,192,0.06)",
    isp:       "25% ISP",
    tpb:       "TPB Gen 6",
    sessions:  "All 90 Sessions",
    cta:       "Upgrade to Silver",
    href:      "/register?tier=silver",
    training: [
      "All Copper benefits",
      "Weekly mastermind access",
      "AI business tools",
      "App brainstorming & building (x1)",
      "Priority Coach Manlaw responses",
      "Silver badge",
    ],
    sales: [
      "25% Individual Sales Profit (ISP)",
      "Quick Pathfinder Bonus (QPB) eligible",
      "Team Performance Bonus (TPB) — Gen 6",
      "Eligibility for CEO Awards",
      "Participate in CEO Competitions",
    ],
    notIncluded: [],
  },
  {
    name:      "Gold",
    price:     "R5,000",
    badge:     "BEST VALUE",
    highlight: false,
    color:     gold,
    border:    "rgba(212,175,55,0.45)",
    bg:        "rgba(212,175,55,0.07)",
    isp:       "28% ISP",
    tpb:       "TPB Gen 8",
    sessions:  "All 90 Sessions",
    cta:       "Upgrade to Gold",
    href:      "/register?tier=gold",
    training: [
      "All Silver benefits",
      "Marketplace seller access",
      "1-on-1 coaching sessions",
      "App brainstorming & building (x2)",
      "VIP community access",
      "Gold badge",
    ],
    sales: [
      "28% Individual Sales Profit (ISP)",
      "Quick Pathfinder Bonus (QPB) eligible",
      "Team Performance Bonus (TPB) — Gen 8",
      "Marketplace Seller Access",
      "Eligibility for CEO Awards",
      "Participate in CEO Competitions",
    ],
    notIncluded: [],
  },
  {
    name:      "Platinum",
    price:     "R12,000",
    badge:     null,
    highlight: false,
    color:     "#E5E4E2",
    border:    "rgba(229,228,226,0.35)",
    bg:        "rgba(229,228,226,0.05)",
    isp:       "30% ISP",
    tpb:       "TPB Gen 10",
    sessions:  "All 90 Sessions",
    cta:       "Upgrade to Platinum",
    href:      "/register?tier=platinum",
    training: [
      "All Gold benefits",
      "White-label opportunities",
      "VIP event access",
      "App brainstorming & building (x4)",
      "Exclusive CEO Mastermind",
      "Direct line to Founder",
      "First 100 Founders profit share",
      "Platinum badge",
    ],
    sales: [
      "30% Individual Sales Profit (ISP)",
      "Quick Pathfinder Bonus (QPB) eligible",
      "Team Performance Bonus (TPB) — Gen 10",
      "Marketplace Seller Access",
      "Eligibility for CEO Awards",
      "Participate in CEO Competitions",
    ],
    notIncluded: [],
  },
];

const faqs = [
  { q: "Is this really lifetime access?", a: "Yes! Pay once, access forever. No monthly fees, ever. Your membership never expires." },
  { q: "Can I pay via bank transfer?", a: "Yes! We accept both card payments via Yoco (instant) and bank transfers (activated within 24 hours). Choose your preferred method during checkout." },
  { q: "Is this a pyramid scheme?", a: "No. Z2B is a legal direct sales and education platform regulated under the Consumer Protection Act. Real products, real education, real value. You earn by sharing — not just by recruiting." },
  { q: "Do I need to quit my job?", a: "Never. Z2B was built specifically for employed people. You build alongside your job using 30-minute daily windows. The system works through duplication — your network grows even when you rest." },
  { q: "What is GroundBreaker?", a: "GroundBreaker is your prospect cultivation dashboard. Share your referral link. When someone goes through the 9 free sessions, you receive alerts at Sessions 3, 6, and 9 — and a Harvest Ready notification when they are prepared to join." },
  { q: "What are the Builder Rules?", a: "Our Builder Rules outline the full commission structure, activity requirements, and operational policies. All income claims require active participation." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [view, setView]         = useState<"cards" | "compare">("cards");

  return (
    <div style={{ minHeight: "100vh", background: bg, color: "#fff", fontFamily: "system-ui, sans-serif" }}>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid rgba(212,175,55,0.15)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: "16px", fontWeight: "bold", color: gold, textDecoration: "none" }}>Z2B TABLE BANQUET</a>
        <div style={{ display: "flex", gap: "16px" }}>
          <a href="/"        style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Home</a>
          <a href="/workshop" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Workshop</a>
          <a href="/login"   style={{ fontSize: "13px", color: gold, textDecoration: "none" }}>Sign In</a>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 16px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "12px", color: gold, letterSpacing: "3px", fontWeight: "bold", marginBottom: "12px" }}>
            LIFETIME MEMBERSHIP TIERS
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: "bold", color: "#fff", marginBottom: "14px", lineHeight: 1.2 }}>
            Choose Your Legacy Path
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", maxWidth: "500px", margin: "0 auto 8px", lineHeight: 1.7 }}>
            One-time payment. Lifetime access. Build your empire forever.
          </p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "24px" }}>
            Pay via Card or Bank Transfer 🏦 &nbsp;·&nbsp; No monthly fees ever! 🚀
          </p>
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "4px", gap: "4px" }}>
            {(["cards", "compare"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "bold",
                background: view === v ? gold : "transparent",
                color:      view === v ? "#000" : "rgba(255,255,255,0.5)",
              }}>
                {v === "cards" ? "Tier Cards" : "Compare Tiers"}
              </button>
            ))}
          </div>
        </div>

        {/* ── CARDS VIEW ──────────────────────────────────────── */}
        {view === "cards" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "60px" }}>
            {tiers.map(t => (
              <div key={t.name} style={{
                background: t.highlight
                  ? "linear-gradient(135deg, rgba(205,127,50,0.15), rgba(147,51,234,0.08))"
                  : t.bg,
                border: `2px solid ${t.highlight ? t.color : t.border}`,
                borderRadius: "18px", padding: "24px",
                position: "relative" as const,
              }}>
                {t.badge && (
                  <div style={{
                    position: "absolute" as const, top: "-12px", left: "50%", transform: "translateX(-50%)",
                    background: t.highlight ? t.color : gold,
                    color: "#000", fontSize: "10px", fontWeight: "bold",
                    letterSpacing: "1.5px", padding: "4px 16px", borderRadius: "20px",
                    whiteSpace: "nowrap" as const,
                  }}>
                    {t.badge}
                  </div>
                )}

                {/* Tier header */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: t.color, fontWeight: "bold", letterSpacing: "2px", marginBottom: "6px" }}>{t.name}</div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#fff", marginBottom: "2px" }}>{t.price}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>
                    {t.price === "R0" ? "Free forever" : "once-off · lifetime access"}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: "11px", color: t.color, background: `${t.color}20`, padding: "3px 10px", borderRadius: "10px", fontWeight: "bold" }}>{t.isp}</span>
                    {t.tpb && <span style={{ fontSize: "11px", color: purple, background: "rgba(147,51,234,0.15)", padding: "3px 10px", borderRadius: "10px", fontWeight: "bold" }}>{t.tpb}</span>}
                    <span style={{ fontSize: "11px", color: "#22C55E", background: "rgba(34,197,94,0.12)", padding: "3px 10px", borderRadius: "10px" }}>{t.sessions}</span>
                  </div>
                </div>

                {/* Training */}
                <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "14px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: "8px" }}>TRAINING & ACCESS</div>
                  {t.training.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                      <span style={{ color: t.color, fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Sales */}
                <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "14px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: "8px" }}>SALES & MARKETING</div>
                  {t.sales.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                      <span style={{ color: "#22C55E", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                  {t.notIncluded.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                      <span style={{ color: "#EF4444", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✗</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "12px", fontStyle: "italic" }}>
                  Terms & Conditions Apply ·{" "}
                  <a href="/builder-rules" style={{ color: t.color, textDecoration: "none" }}>View Builder Rules</a>
                </div>

                <a href={t.href} style={{
                  display: "block", textAlign: "center",
                  background: t.highlight ? `linear-gradient(135deg, #A0522D, ${t.color})` : `rgba(255,255,255,0.07)`,
                  color: t.highlight ? "#fff" : "#fff",
                  border: `1px solid ${t.highlight ? "transparent" : t.border}`,
                  borderRadius: "10px", padding: "12px",
                  fontWeight: "bold", fontSize: "14px", textDecoration: "none",
                }}>
                  {t.cta}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── COMPARE VIEW ────────────────────────────────────── */}
        {view === "compare" && (
          <div style={{ overflowX: "auto", marginBottom: "60px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: "normal", width: "200px" }}>Feature</th>
                  {tiers.map(t => (
                    <th key={t.name} style={{ padding: "12px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", fontWeight: "bold", color: t.color }}>{t.name}</div>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginTop: "2px" }}>{t.price}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "ISP Rate",          vals: ["10%", "18%", "22%", "25%", "28%", "30%"] },
                  { label: "TPB Generations",   vals: ["None", "Gen 3", "Gen 4", "Gen 6", "Gen 8", "Gen 10"] },
                  { label: "QPB Eligible",      vals: ["✗", "✓", "✓", "✓", "✓", "✓"] },
                  { label: "CEO Awards",        vals: ["✗", "✗", "✗", "✓", "✓", "✓"] },
                  { label: "Sessions",          vals: ["1–9", "1–90", "1–90", "1–90", "1–90", "1–90"] },
                  { label: "Vision Board",      vals: ["View", "Full", "Full", "Full", "Full", "Full"] },
                  { label: "Coach Manlaw AI",   vals: ["3/sess", "∞", "∞", "∞", "∞", "∞"] },
                  { label: "GroundBreaker",     vals: ["✓", "✓", "✓", "✓", "✓", "✓"] },
                  { label: "TableBuilder",      vals: ["✗", "✓", "✓", "✓", "✓", "✓"] },
                  { label: "Marketplace",       vals: ["✗", "✗", "✗", "✗", "✓", "✓"] },
                  { label: "White-label",       vals: ["✗", "✗", "✗", "✗", "✗", "✓"] },
                  { label: "1-on-1 Coaching",   vals: ["✗", "✗", "✗", "✗", "✓", "✓"] },
                  { label: "App Building",      vals: ["✗", "✗", "✗", "x1", "x2", "x4"] },
                  { label: "CEO Mastermind",    vals: ["✗", "✗", "✗", "✗", "✗", "✓"] },
                ].map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {row.label}
                    </td>
                    {row.vals.map((v, vi) => (
                      <td key={vi} style={{ padding: "10px 8px", textAlign: "center", fontSize: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: v === "✓" ? "#22C55E" : v === "✗" ? "rgba(255,255,255,0.2)" : tiers[vi].color, fontWeight: v === "✓" || v === "✗" ? "bold" : "normal" }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Income streams */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: gold, letterSpacing: "3px", marginBottom: "8px" }}>COMPENSATION PLAN</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fff" }}>6 Income Streams</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>Activated progressively as you upgrade your tier</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {[
              { code: "ISP", name: "Individual Sales Profit",    desc: "Direct referral commissions — 10% (FAM) up to 30% (Platinum) on every membership you refer",                        color: "#22C55E",  tier: "All tiers" },
              { code: "QPB", name: "Quick Pathfinder Bonus",     desc: "Qualify by referring 3 diverse members in a quarter — bonus unlocks from Bronze and above",                           color: "#0EA5E9",  tier: "Bronze+" },
              { code: "TPB", name: "Team Performance Bonus",     desc: "Earn across your team's sales — Bronze earns Gen 3, up to Gen 10 at Platinum",                                        color: gold,       tier: "Bronze+" },
              { code: "TSC", name: "Team Sales Commission",      desc: "Commission from your downline's sales flowing through multiple generations",                                           color: purple,     tier: "Bronze+" },
              { code: "TLI", name: "Ten Level Legacy Income",    desc: "Passive income flowing 10 levels deep — up to R5M in legacy earnings at Platinum",                                   color: "#E879F9",  tier: "Platinum" },
              { code: "CEO", name: "CEO Awards",                 desc: "Elite recognition and bonus pool for top-performing Silver, Gold and Platinum builders",                               color: "#F97316",  tier: "Silver+" },
            ].map(s => (
              <div key={s.code} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", borderLeft: `3px solid ${s.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: s.color }}>{s.code}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "10px" }}>{s.tier}</div>
                </div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>{s.name}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kingdom Business */}
        <div style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(147,51,234,0.08))", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "16px", padding: "32px", marginBottom: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>👑</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: gold, marginBottom: "12px" }}>This Is a Kingdom Business</div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.9, maxWidth: "560px", margin: "0 auto 16px" }}>
            Z2B was not built to make employees richer consumers. It was built to raise up stewards — people who understand that wealth is a tool for service, legacy, and community transformation. Every membership activates a builder. Every builder cultivates a table. Every table changes a family.
          </div>
          <div style={{ fontSize: "13px", color: "rgba(212,175,55,0.6)", fontStyle: "italic" }}>
            "You prepare a table before me in the presence of my enemies." — Psalm 23:5
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: gold, letterSpacing: "3px", marginBottom: "8px" }}>FAQ</div>
            <div style={{ fontSize: "22px", fontWeight: "bold" }}>Frequently Asked Questions</div>
          </div>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${openFaq === i ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", marginBottom: "10px", overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" as const }}>
                <span style={{ fontSize: "14px", color: "#fff", fontWeight: "bold", flex: 1, paddingRight: "12px" }}>{f.q}</span>
                <span style={{ color: gold, fontSize: "18px", flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 18px 16px", fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>{f.a}</div>
              )}
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a href="/builder-rules" style={{ color: gold, fontSize: "13px", textDecoration: "none" }}>View full Builder Rules →</a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(212,175,55,0.2)" }}>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>Ready to Transform Your Life?</div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "24px" }}>
            Join thousands building their legacy at the Z2B Table Banquet
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" as const }}>
            <a href="/workshop" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", padding: "13px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", border: "1px solid rgba(255,255,255,0.15)" }}>
              Start Free — Sessions 1–9
            </a>
            <a href="/signup" style={{ background: `linear-gradient(135deg, #A0522D, #CD7F32)`, color: "#fff", padding: "13px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
              Start Your Journey →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
