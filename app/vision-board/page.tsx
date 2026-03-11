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
const AI_PROMPTS: Record<string, string> = {
  short_personal:  "A short-term personal goal (0-6 months) someone might have after learning that clarity is their most valuable asset — e.g. reduce financial stress, start a side income stream. Keep it to one sentence, specific and inspiring.",
  short_family:    "A short-term family goal (0-6 months) — e.g. covering school fees, eliminating a household debt, or creating breathing room at month-end. One sentence, specific.",
  short_business:  "A short-term business goal (0-6 months) for someone starting as an Entrepreneurial Consumer in network marketing — e.g. recruit 4 members, earn first commission. One sentence.",
  medium_personal: "A medium-term personal goal (6-24 months) for someone transitioning from employee to entrepreneur — e.g. financial flexibility, time ownership, new skills. One sentence.",
  medium_family:   "A medium-term family goal (6-24 months) — e.g. reliable transport, education funding, family holiday, better housing. One sentence, inspiring.",
  medium_business: "A medium-term business goal (6-24 months) in network marketing — e.g. reach Builder rank, earn R15,000/month passively, build a team of 20. One sentence.",
  long_personal:   "A long-term personal legacy goal (2-5+ years) — e.g. financial freedom, owning assets, no longer trading time for money. One sentence, visionary.",
  long_family:     "A long-term family legacy goal (2-5+ years) — e.g. generational wealth, paid-off home, children's education secured. One sentence.",
  long_business:   "A long-term business legacy goal (2-5+ years) in the Z2B ecosystem — e.g. Diamond Legacy status, team of 500, R5M/year income. One sentence, bold.",
};

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
          systemPrompt: "You are Coach Manlaw, a wise business and life coach. Generate a single, specific, inspiring goal suggestion. Return ONLY the goal text — no preamble, no explanation, no quotes, no asterisks. Maximum 20 words.",
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
          win.document.write(`
            <html><head><title>Z2B Vision Board</title>
            <meta name="viewport" content="width=device-width,initial-scale=1"/>
            <style>body{margin:0;background:#0A0015;display:flex;flex-direction:column;align-items:center;padding:16px;}
            img{max-width:100%;border-radius:12px;}
            p{color:#D4AF37;font-family:Arial;font-size:14px;text-align:center;margin-top:12px;}
            </style></head>
            <body>
              <p>📥 Long-press the image below and tap <strong>"Save Image"</strong> to download</p>
              <img src="${imageUrl}" alt="Z2B Vision Board"/>
            </body></html>
          `);
        }
        showToast("📸 Long-press the image to save it!");
      } catch (e) {
        showToast("Could not capture — try the desktop download.");
      }
    } else {
      // ── DESKTOP: generate HTML file → print to PDF ──
      const rows = HORIZONS.map(h =>
        `<tr>
          <td style="padding:12px;background:#1A0035;color:#D4AF37;font-weight:bold;font-size:12px;text-align:center;border:1px solid #333;">
            ${h.icon}<br/>${h.label}<br/><span style="font-size:10px;color:#888;">${h.range}</span>
          </td>
          ${DIMENSIONS.map(d => {
            const c = board[cellKey(h.key, d.key)];
            return `<td style="padding:14px;border:1px solid #333;background:#0D0020;vertical-align:top;">
              <div style="font-size:13px;color:#fff;font-weight:bold;margin-bottom:6px;">${c.dream || "—"}</div>
              ${c.target ? `<div style="font-size:11px;color:#C4B5FD;">🎯 ${c.target}</div>` : ""}
              ${c.amount ? `<div style="font-size:11px;color:#D4AF37;">💰 ${c.amount}</div>` : ""}
            </td>`;
          }).join("")}
        </tr>`
      ).join("");

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Z2B Vision Board — ${memberName || "My"} Legacy Blueprint</title>
<style>
  body { margin:0; padding:20px; background:#0A0015; color:#fff; font-family:Arial,sans-serif; }
  h1 { color:#D4AF37; text-align:center; font-size:24px; margin-bottom:4px; }
  h2 { color:#C4B5FD; text-align:center; font-size:14px; margin-bottom:24px; font-weight:normal; }
  table { width:100%; border-collapse:collapse; }
  th { padding:14px; background:#6B21A8; color:#fff; font-size:13px; border:1px solid #333; letter-spacing:2px; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head><body>
<h1>🏆 Z2B VISION BOARD</h1>
<h2>${memberName ? memberName + "'s" : "My"} Legacy Blueprint · Zero2Billionaires</h2>
<table>
  <thead><tr>
    <th style="width:100px;">TIME</th>
    ${DIMENSIONS.map(d => `<th>${d.icon} ${d.label}</th>`).join("")}
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p style="text-align:center;color:#888;font-size:11px;margin-top:20px;">Generated at app.z2blegacybuilders.co.za · ${new Date().toLocaleDateString()}</p>
<script>window.onload=()=>window.print();</script>
</body></html>`;

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

      {/* Intro */}
      <div style={S.intro}>
        <div style={S.introTitle}>
          {memberName ? `${memberName}, this is your legacy on paper.` : "Your legacy starts with vision."}
        </div>
        <div style={S.introSub}>
          Before tools. Before companies. Before income streams — Z2B begins with structured vision.
          Fill in your 9-cell blueprint. Click <strong style={{ color: "#C4B5FD" }}>✨ AI Suggest</strong> to let Coach Manlaw inspire each cell.
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
                    {isLoading ? "✨ Thinking..." : "✨ AI Suggest"}
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