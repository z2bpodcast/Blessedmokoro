"use client";
// FILE LOCATION: app/vision-board/page.tsx

import React, { useState, useEffect, useRef, useCallback, CSSProperties } from "react";
import html2canvas from "html2canvas";
import { supabase } from "@/lib/supabase";

// ── TYPES ──────────────────────────────────────────────────────
type Horizon  = "short" | "medium" | "long";
type Dimension = "personal" | "family" | "business";

interface VisionCell {
  horizon:   Horizon;
  dimension: Dimension;
  dream:     string;
  target:    string;
  amount:    string;
}

type BoardState = Record<string, VisionCell>;

const HORIZONS: { key: Horizon; label: string; range: string; icon: string }[] = [
  { key: "short",  label: "Short Term",  range: "0 – 6 months",  icon: "⚡" },
  { key: "medium", label: "Medium Term", range: "6 – 24 months", icon: "🌱" },
  { key: "long",   label: "Long Term",   range: "2 – 5 years+",  icon: "🏆" },
];

const DIMENSIONS: { key: Dimension; label: string; icon: string; color: string; gold: string }[] = [
  { key: "personal",  label: "PERSONAL",  icon: "👤", color: "#7C3AED", gold: "#A78BFA" },
  { key: "family",    label: "FAMILY",    icon: "👨‍👩‍👧", color: "#B8860B", gold: "#D4AF37" },
  { key: "business",  label: "BUSINESS",  icon: "🚀", color: "#0F766E", gold: "#2DD4BF" },
];

const cellKey = (h: Horizon, d: Dimension) => `${h}_${d}`;

const EMPTY_CELL = (h: Horizon, d: Dimension): VisionCell => ({
  horizon: h, dimension: d, dream: "", target: "", amount: "",
});

const initBoard = (): BoardState => {
  const board: BoardState = {};
  HORIZONS.forEach(h => DIMENSIONS.forEach(d => {
    board[cellKey(h.key, d.key)] = EMPTY_CELL(h.key, d.key);
  }));
  return board;
};

// ── AI SUGGESTION PROMPTS per cell ────────────────────────────
// ── GUIDING QUESTIONS — stimulate thinking, do not spoon-feed ──
const AI_PROMPTS: Record<string, string> = {
  short_personal:  "Ask ONE powerful reflective question that helps someone identify their most urgent personal need right now — in the next 0 to 6 months. The question must relate to financial stress, daily dignity, or personal stability for a South African employee. Use ZAR where relevant. Do NOT give the answer. Return only the question.",
  short_family:    "Ask ONE reflective question that helps someone think about their most pressing family financial need in the next 0 to 6 months — e.g. school fees, groceries, transport, household debt. South African context. Use ZAR. Return only the question.",
  short_business:  "Ask ONE question that helps a new Entrepreneurial Consumer in Z2B network marketing think about what their first business action should be in the next 0 to 6 months — e.g. first team member, first product sale, first commission in ZAR. Return only the question.",
  medium_personal: "Ask ONE reflective question that challenges someone to think about what personal freedom looks like for them in 6 to 24 months — e.g. time, skill, independence, income. South African context. Return only the question.",
  medium_family:   "Ask ONE question that helps someone picture a specific family milestone they want to reach in 6 to 24 months — e.g. a car, school fees, a holiday, moving to a better home. Use ZAR context. Return only the question.",
  medium_business: "Ask ONE question that helps a Z2B Builder think about what their network marketing business should look like in 6 to 24 months — team size, monthly income in ZAR, rank. Return only the question.",
  long_personal:   "Ask ONE powerful question that helps someone define what a legacy life looks like for them personally in 2 to 5 years — assets, freedom, no longer trading time for money. South African context. Return only the question.",
  long_family:     "Ask ONE question that helps someone think about the generational impact they want to leave for their family in 2 to 5 years — property, education, financial security in ZAR. Return only the question.",
  long_business:   "Ask ONE bold question that helps a Z2B Builder imagine what their business legacy looks like in 2 to 5 years — team, income in ZAR, rank, impact. Return only the question.",
};

// ── LESSON CARDS ──────────────────────────────────────────────
const LESSON_CARDS: { icon: string; title: string; body: string }[] = [
  {
    icon: "1.",
    title: "What is a Vision Board?",
    body: "A Vision Board is not a wish list. It is a structured declaration of where you are going, broken down by time and area of life. It converts vague hopes into specific targets you can work toward daily. Z2B uses a 3x3 model: three time horizons across three life dimensions.",
  },
  {
    icon: "2.",
    title: "Why does Z2B begin with Vision?",
    body: "Most people approach income reactively, asking what business they can start quickly or what opportunity pays fast. This urgency is why many fail repeatedly. Execution without clarity leads to burnout and confusion. Before tools, companies, or income streams, Z2B begins with structured vision. Vision is not a luxury. It is your launchpad.",
  },
  {
    icon: "3.",
    title: "The Three Time Horizons",
    body: "Short Term (0-6 months) addresses pressure: stabilisation, dignity, breathing room. Medium Term (6-24 months) addresses freedom: flexibility, family goals, intentional income. Long Term (2-5 years+) addresses legacy: assets, generational impact, structures that outlive your effort. Each horizon builds on the one before it.",
  },
  {
    icon: "4.",
    title: "The Three Life Dimensions",
    body: "PERSONAL covers your own growth, health, skills, and independence. FAMILY covers your household, the people who carry your legacy. BUSINESS covers your Entrepreneurial Consumer journey, your team, income, and Z2B rank. A complete vision touches all three, across all three time frames.",
  },
  {
    icon: "5.",
    title: "How to use the Guide Me button",
    body: "Each cell has a Guide Me button powered by Coach Manlaw. He will not fill in your vision for you, that would rob you of ownership. Instead, he asks you a powerful question to stimulate YOUR thinking. Your answer is your vision. He just helps you find it.",
  },
  {
    icon: "6.",
    title: "A word from Sessions 6 and 7",
    body: "The Three Levels of Vision: Immediate Term stabilises. Medium Term liberates. Long Term transforms. The Five Foundational Questions: Why. What. When. How. Where, asked correctly across all three time horizons, change everything. This board is where those questions meet your real life.",
  },
];

// ── STYLES ────────────────────────────────────────────────────
const S: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#0A0015", color: "#fff", fontFamily: "'Segoe UI', sans-serif" },
  header: { background: "linear-gradient(135deg, #1A0035 0%, #0D0020 100%)", borderBottom: "1px solid rgba(212,175,55,0.3)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  logo: { width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #6B21A8, #9333EA)", border: "2px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" },
  headerTitle: { fontSize: "22px", fontWeight: "bold", color: "#D4AF37", letterSpacing: "1px" },
  headerSub: { fontSize: "12px", color: "rgba(196,181,253,0.7)", marginTop: "2px" },
  headerBtns: { display: "flex", gap: "10px", flexWrap: "wrap" },
  btnBack: { background: "transparent", border: "1px solid rgba(196,181,253,0.4)", borderRadius: "10px", padding: "8px 16px", color: "#C4B5FD", fontSize: "13px", cursor: "pointer" },
  btnSave: { background: "linear-gradient(135deg, #6B21A8, #9333EA)", border: "none", borderRadius: "10px", padding: "8px 20px", color: "#fff", fontSize: "13px", fontWeight: "bold", cursor: "pointer" },
  btnDownload: { background: "linear-gradient(135deg, #B8860B, #D4AF37)", border: "none", borderRadius: "10px", padding: "8px 20px", color: "#000", fontSize: "13px", fontWeight: "bold", cursor: "pointer" },
  intro: { textAlign: "center" as const, padding: "40px 24px 20px", maxWidth: "700px", margin: "0 auto" },
  introTitle: { fontSize: "28px", fontWeight: "bold", color: "#D4AF37", marginBottom: "10px" },
  introSub: { fontSize: "15px", color: "rgba(196,181,253,0.8)", lineHeight: 1.7 },
  grid: { padding: "0 16px 60px", maxWidth: "1100px", margin: "0 auto" },
  dimensionHeaders: { display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr", gap: "12px", marginBottom: "8px", padding: "0 0 0 0" },
  dimHeader: { textAlign: "center" as const, padding: "12px 8px", borderRadius: "12px 12px 0 0", fontSize: "13px", fontWeight: "bold", letterSpacing: "2px" },
  horizonRow: { display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" },
  horizonLabel: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px 8px", gap: "6px" },
  horizonIcon: { fontSize: "22px" },
  horizonName: { fontSize: "12px", fontWeight: "bold", color: "#D4AF37", letterSpacing: "1px", textAlign: "center" as const },
  horizonRange: { fontSize: "10px", color: "rgba(196,181,253,0.6)", textAlign: "center" as const },
  cell: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px", display: "flex", flexDirection: "column" as const, gap: "8px", transition: "border 0.2s" },
  cellActive: { border: "1px solid rgba(147,51,234,0.6)", background: "rgba(107,33,168,0.08)" },
  cellFilled: { border: "1px solid rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.04)" },
  cellTextarea: { background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "13px", lineHeight: 1.6, resize: "none" as const, width: "100%", fontFamily: "inherit", minHeight: "60px" },
  cellDivider: { height: "1px", background: "rgba(255,255,255,0.08)", margin: "2px 0" },
  cellMeta: { display: "flex", gap: "8px" },
  cellInput: { background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", outline: "none", color: "rgba(196,181,253,0.9)", fontSize: "11px", padding: "2px 0", flex: 1, fontFamily: "inherit" },
  cellAIBtn: { background: "rgba(147,51,234,0.2)", border: "1px solid rgba(147,51,234,0.4)", borderRadius: "8px", padding: "4px 10px", color: "#C4B5FD", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" as const, alignSelf: "flex-start" as const },
  cellAIBtnLoading: { opacity: 0.5, cursor: "not-allowed" as const },
  toast: { position: "fixed" as const, bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#6B21A8", color: "#fff", padding: "12px 28px", borderRadius: "30px", fontSize: "14px", fontWeight: "bold", zIndex: 9999, boxShadow: "0 8px 32px rgba(107,33,168,0.4)" },
  completionBanner: { maxWidth: "1100px", margin: "0 auto 24px", padding: "0 16px" },
  completion: { background: "linear-gradient(135deg, #1A0035, #0D0020)", border: "2px solid #D4AF37", borderRadius: "16px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
  completionText: { fontSize: "15px", color: "#D4AF37", fontWeight: "bold" },
  completionSub: { fontSize: "13px", color: "rgba(196,181,253,0.7)", marginTop: "4px" },
  progressBar: { height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden", marginTop: "8px", width: "200px" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #6B21A8, #D4AF37)", borderRadius: "3px", transition: "width 0.4s ease" },
};

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function VisionBoardPage() {
  const [board, setBoard]           = useState<BoardState>(initBoard());
  const [userId, setUserId]         = useState<string | null>(null);
  const [isPaid, setIsPaid]         = useState(false);
  const [memberName, setMemberName] = useState("");
  const [saving, setSaving]         = useState(false);
  const [showLesson, setShowLesson] = useState(true);
  const [toast, setToast]           = useState("");
  const [aiLoading, setAiLoading]   = useState<Record<string, boolean>>({});
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // ── Load user + board ──
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("full_name, is_paid_member").eq("id", user.id).single();
      if (profile) {
        setMemberName(profile.full_name?.split(" ")[0] || "");
        setIsPaid(profile.is_paid_member || false);
      }
      // Load saved board
      const { data: saved } = await supabase.from("vision_boards").select("board_data").eq("user_id", user.id).single();
      if (saved?.board_data) {
        setBoard(saved.board_data);
      }
    };
    load();
  }, []);

  const filledCount = Object.values(board).filter(c => c.dream.trim().length > 0).length;
  const pct = Math.round((filledCount / 9) * 100);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Update a cell field ──
  const updateCell = (key: string, field: keyof VisionCell, value: string) => {
    setBoard(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  // ── AI Suggest ──
  const aiSuggest = async (h: Horizon, d: Dimension) => {
    const key = cellKey(h, d);
    setAiLoading(prev => ({ ...prev, [key]: true }));
    try {
      const prompt = AI_PROMPTS[key] || "Suggest a powerful life goal for this area.";
      const res = await fetch("/api/coach-manlaw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: "You are Coach Manlaw — a wise, direct, faith-aware business mentor in the Z2B Entrepreneurial Consumer ecosystem, created by Rev Mokoro Manana. Your role here is to GUIDE, not to spoon-feed. You ask powerful reflective questions that stimulate the builder's own thinking and creativity. You never answer for them. All financial context uses ZAR (South African Rand). Return ONLY the question — no preamble, no asterisks, no explanation. One sentence. End with a question mark.",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.reply) {
        updateCell(key, "dream", data.reply.trim());
      }
    } catch (e) {
      showToast("Coach Manlaw is thinking... try again.");
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ── Save to Supabase ──
  const saveBoard = async () => {
    if (!userId) { showToast("Please log in to save your Vision Board."); return; }
    if (!isPaid) { showToast("Upgrade to a paid membership to save your Vision Board."); return; }
    setSaving(true);
    try {
      await supabase.from("vision_boards").upsert(
        { user_id: userId, board_data: board, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      showToast("✅ Vision Board saved!");
    } catch (e) {
      showToast("Save failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Download — smart: image on mobile, HTML on desktop ──
  const downloadBoard = async () => {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (isMobile) {
      // ── MOBILE: capture as image using html2canvas ──
      if (!boardRef.current) return;
      showToast("📸 Capturing your Vision Board...");
      try {
        const canvas = await html2canvas(boardRef.current, {
          background: "#0A0015",
          useCORS: true,
          logging: false,
        });
        const imageUrl = canvas.toDataURL("image/png");
        // On mobile — open image in new tab so user can long-press → Save
        const win = window.open();
        if (win) {
          const mobileHtml = "<html><head><title>Z2B Vision Board</title>"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
            + "<style>body{margin:0;background:#0A0015;display:flex;flex-direction:column;align-items:center;padding:16px;}"
            + "img{max-width:100%;border-radius:12px;}"
            + "p{color:#D4AF37;font-family:Arial;font-size:14px;text-align:center;margin-top:12px;}"
            + "</style></head><body>"
            + "<p>Long-press the image below and tap Save Image to download</p>"
            + "<img src=\"" + imageUrl + "\" alt=\"Z2B Vision Board\"/>"
            + "</body></html>";
          win.document.write(mobileHtml);
        }
        showToast("📸 Long-press the image to save it!");
      } catch (e) {
        showToast("Could not capture — try the desktop download.");
      }
    } else {
      // ── DESKTOP: generate HTML file → print to PDF ──
      const rows = HORIZONS.map(h => {
        const cells = DIMENSIONS.map(d => {
          const c = board[cellKey(h.key, d.key)];
          return "<td style=\"padding:14px;border:1px solid #333;background:#0D0020;vertical-align:top;\">"
            + "<div style=\"font-size:13px;color:#fff;font-weight:bold;margin-bottom:6px;\">" + (c.dream || "-") + "</div>"
            + (c.target ? "<div style=\"font-size:11px;color:#C4B5FD;\">Target: " + c.target + "</div>" : "")
            + (c.amount ? "<div style=\"font-size:11px;color:#D4AF37;\">Amount: " + c.amount + "</div>" : "")
            + "</td>";
        }).join("");
        return "<tr>"
          + "<td style=\"padding:12px;background:#1A0035;color:#D4AF37;font-weight:bold;font-size:12px;text-align:center;border:1px solid #333;\">"
          + h.label + "<br/><span style=\"font-size:10px;color:#888;\">" + h.range + "</span></td>"
          + cells + "</tr>";
      }).join("");
      const dimHeaders = DIMENSIONS.map(d => "<th>" + d.label + "</th>").join("");
      const nameLabel = memberName ? memberName + "'s" : "My";
      const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/>"
        + "<title>Z2B Vision Board</title>"
        + "<style>body{margin:0;padding:20px;background:#0A0015;color:#fff;font-family:Arial,sans-serif;}"
        + "h1{color:#D4AF37;text-align:center;font-size:24px;margin-bottom:4px;}"
        + "h2{color:#C4B5FD;text-align:center;font-size:14px;margin-bottom:24px;font-weight:normal;}"
        + "table{width:100%;border-collapse:collapse;}"
        + "th{padding:14px;background:#6B21A8;color:#fff;font-size:13px;border:1px solid #333;}"
        + "@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}"
        + "</style></head><body>"
        + "<h1>Z2B VISION BOARD</h1>"
        + "<h2>" + nameLabel + " Legacy Blueprint - Zero2Billionaires</h2>"
        + "<table><thead><tr><th style=\"width:100px;\">TIME</th>" + dimHeaders + "</tr></thead>"
        + "<tbody>" + rows + "</tbody></table>"
        + "<p style=\"text-align:center;color:#888;font-size:11px;margin-top:20px;\">Generated at app.z2blegacybuilders.co.za - " + new Date().toLocaleDateString() + "</p>"
        + "<script>window.onload=function(){window.print();}<\/script>"
        + "</body></html>";

      const blob = new Blob([html], { type: "text/html" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Z2B-VisionBoard-${memberName || "Legacy"}.html`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📥 Downloaded! Open the file — it will auto-print to PDF.");
    }
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logo}>🏆</div>
          <div>
            <div style={S.headerTitle}>Z2B VISION BOARD</div>
            <div style={S.headerSub}>
              {memberName ? `${memberName}'s Legacy Blueprint` : "Your 3×3 Life Architecture"} · Zero2Billionaires
            </div>
          </div>
        </div>
        <div style={S.headerBtns}>
          <button style={S.btnBack} onClick={() => window.location.href = "/workshop"}>
            ← Workshop
          </button>
          {isPaid && (
            <button style={{ ...S.btnSave, opacity: saving ? 0.6 : 1 }} onClick={saveBoard} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Board"}
            </button>
          )}
          <button style={S.btnDownload} onClick={downloadBoard}>
            📥 Download
          </button>
        </div>
      </div>

      {/* ── VISION BOARD LESSON — shown first ── */}
      {showLesson && (
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
            <h2 style={{ fontSize: "26px", fontWeight: "bold", color: "#D4AF37", margin: "0 0 8px", letterSpacing: "1px" }}>
              {memberName ? `${memberName}, before you fill this in —` : "Before you fill this in —"}
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(196,181,253,0.8)", lineHeight: 1.7, margin: 0 }}>
              let us make sure you understand what a Vision Board actually is, and why Z2B starts here.
            </p>
          </div>

          {/* Lesson cards */}
          {LESSON_CARDS.map((card, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "16px", padding: "20px 22px", marginBottom: "14px",
              borderLeft: "4px solid #D4AF37",
            }}>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>{card.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>{card.title}</div>
              <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.85)", lineHeight: 1.8 }}>{card.body}</div>
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <button
              onClick={() => setShowLesson(false)}
              style={{
                background: "linear-gradient(135deg, #B8860B, #D4AF37)",
                color: "#000", border: "none", padding: "16px 48px",
                borderRadius: "12px", fontWeight: "bold", fontSize: "16px",
                cursor: "pointer", letterSpacing: "0.5px",
              }}
            >
              🏆 I Understand — Build My Vision Board
            </button>
            <p style={{ fontSize: "12px", color: "rgba(196,181,253,0.5)", marginTop: "10px" }}>
              Sessions 6 & 7 · Vision Before Execution · From SWOT to Opportunity
            </p>
          </div>
        </div>
      )}

      {/* ── BOARD — shown after lesson ── */}
      {!showLesson && (
      <div>
      <div style={S.intro}>
        <div style={S.introTitle}>
          {memberName ? `${memberName}, this is your legacy on paper.` : "Your legacy starts with vision."}
        </div>
        <div style={S.introSub}>
          Fill in your 9-cell blueprint. Click <strong style={{ color: "#C4B5FD" }}>💡 Guide Me</strong> and Coach Manlaw will ask you a powerful question to unlock YOUR answer.
        </div>
      </div>

      {/* Progress banner */}
      <div style={S.completionBanner}>
        <div style={S.completion}>
          <div>
            <div style={S.completionText}>
              {filledCount === 9 ? "🏆 Vision Complete — Your Legacy Blueprint is ready!" :
               filledCount >= 6 ? "🔥 Almost there — keep going!" :
               filledCount >= 3 ? "🌱 Good start — keep building your vision!" :
               "📋 Start filling your Vision Board below"}
            </div>
            <div style={S.completionSub}>{filledCount}/9 cells filled</div>
            <div style={S.progressBar}>
              <div style={{ ...S.progressFill, width: `${pct}%` }} />
            </div>
          </div>
          {filledCount === 9 && (
            <button style={S.btnDownload} onClick={downloadBoard}>
              📥 Download My Blueprint
            </button>
          )}
        </div>
      </div>

      {/* 3×3 Grid */}
      <div style={S.grid} ref={boardRef}>
        {/* Dimension headers */}
        <div style={S.dimensionHeaders}>
          <div /> {/* spacer */}
          {DIMENSIONS.map(d => (
            <div key={d.key} style={{
              ...S.dimHeader,
              background: `rgba(${d.key === "personal" ? "124,58,237" : d.key === "family" ? "184,134,11" : "15,118,110"},0.2)`,
              border: `1px solid ${d.gold}40`,
              color: d.gold,
            }}>
              {d.icon} {d.label}
            </div>
          ))}
        </div>

        {/* Horizon rows */}
        {HORIZONS.map(h => (
          <div key={h.key} style={S.horizonRow}>
            {/* Horizon label */}
            <div style={S.horizonLabel}>
              <span style={S.horizonIcon}>{h.icon}</span>
              <span style={S.horizonName}>{h.label.toUpperCase()}</span>
              <span style={S.horizonRange}>{h.range}</span>
            </div>

            {/* Cells */}
            {DIMENSIONS.map(d => {
              const key  = cellKey(h.key, d.key);
              const cell = board[key];
              const isActive = activeCell === key;
              const isFilled = cell.dream.trim().length > 0;
              const isLoading = aiLoading[key];

              return (
                <div
                  key={key}
                  style={{
                    ...S.cell,
                    ...(isActive ? S.cellActive : {}),
                    ...(isFilled && !isActive ? S.cellFilled : {}),
                    borderColor: isActive ? d.gold : isFilled ? `${d.gold}60` : "rgba(255,255,255,0.1)",
                  }}
                  onClick={() => setActiveCell(key)}
                >
                  {/* AI Suggest button */}
                  <button
                    style={{ ...S.cellAIBtn, ...(isLoading ? S.cellAIBtnLoading : {}), borderColor: `${d.gold}50`, color: d.gold }}
                    onClick={e => { e.stopPropagation(); aiSuggest(h.key, d.key); }}
                    disabled={isLoading}
                  >
                    {isLoading ? "🧠 Thinking..." : "💡 Guide Me"}
                  </button>

                  {/* Dream / goal textarea */}
                  <textarea
                    style={{ ...S.cellTextarea, color: isFilled ? "#fff" : "rgba(255,255,255,0.35)" }}
                    placeholder={`Your ${h.label.toLowerCase()} ${d.key} goal...`}
                    value={cell.dream}
                    onChange={e => updateCell(key, "dream", e.target.value)}
                    onFocus={() => setActiveCell(key)}
                    rows={3}
                  />

                  <div style={S.cellDivider} />

                  {/* Target + Amount */}
                  <div style={S.cellMeta}>
                    <input
                      style={S.cellInput}
                      placeholder="🎯 Target date"
                      value={cell.target}
                      onChange={e => updateCell(key, "target", e.target.value)}
                      onFocus={() => setActiveCell(key)}
                    />
                    <input
                      style={S.cellInput}
                      placeholder="💰 Amount (R)"
                      value={cell.amount}
                      onChange={e => updateCell(key, "amount", e.target.value)}
                      onFocus={() => setActiveCell(key)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      </div>
      )} {/* end !showLesson */}

      {/* Session 6 & 7 connection note */}
      <div style={{ maxWidth: "1100px", margin: "0 auto 40px", padding: "0 16px" }}>
        <div style={{ background: "rgba(107,33,168,0.1)", border: "1px solid rgba(107,33,168,0.3)", borderRadius: "16px", padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "28px", flexShrink: 0 }}>🧠</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "6px" }}>
              Connected to Sessions 6 & 7 — Vision Before Execution & From SWOT to Opportunity
            </div>
            <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", lineHeight: 1.7 }}>
              "Most people approach income reactively. Z2B begins differently — before tools, before companies, before income streams, we begin with <strong style={{ color: "#D4AF37" }}>structured vision.</strong> This board is your foundation. Every session you complete builds toward what you have written here."
            </div>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
              — Sessions 6 & 7: Vision Before Execution · From SWOT to Opportunity
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}