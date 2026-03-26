// v2026-03-26 23:26 — X button
"use client";
// FILE LOCATION: components/ECPosterStudio.tsx
// USAGE: <ECPosterStudio builderRef={builderRef} builderName={manlawMemberName} />

import { useState, useRef, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";

interface ECPosterStudioProps {
  builderRef: string | null;
  builderName?: string | null;
}

const TEMPLATES = [
  { id: "royal", name: "Royal Purple",  preview: "linear-gradient(135deg,#0D0A1E,#4C1D95,#0A0818)", accent: "#D4AF37" },
  { id: "gold",  name: "Gold Luxury",   preview: "linear-gradient(135deg,#451A00,#78350F,#3B1900)", accent: "#FDE68A" },
  { id: "fire",  name: "Midnight Fire", preview: "linear-gradient(135deg,#050505,#1a0000,#3B0000)", accent: "#EF4444" },
  { id: "green", name: "Kingdom Green", preview: "linear-gradient(135deg,#022C22,#064E3B,#011B15)", accent: "#6EE7B7" },
  { id: "ivory", name: "Clean Ivory",   preview: "linear-gradient(135deg,#FFFCF0,#FEF8E8,#FFFAF0)", accent: "#1E1B4B" },
  { id: "ocean", name: "Deep Ocean",    preview: "linear-gradient(135deg,#060B2E,#0C1A5C,#040820)", accent: "#60A5FA" },
  { id: "rose",  name: "Rose Faith",    preview: "linear-gradient(135deg,#1A0010,#3B0020,#0F000A)", accent: "#FB7185" },
  { id: "slate", name: "Corp Slate",    preview: "linear-gradient(135deg,#080E1A,#0F1A2E,#060C16)", accent: "#F59E0B" },
];

// ── Style helper functions — outside CSS object to avoid TS errors ──
function swatchStyle(id: string, selected: string): CSSProperties {
  const t = TEMPLATES.find(t => t.id === id)!;
  return {
    height: "38px",
    borderRadius: "8px",
    cursor: "pointer",
    border: selected === id ? "3px solid #D4AF37" : "2px solid rgba(255,255,255,0.07)",
    transform: selected === id ? "scale(1.07)" : "scale(1)",
    transition: "all 0.15s",
    background: t.preview,
  };
}

function btnStyle(color: string, textColor = "#F5D060"): CSSProperties {
  return {
    width: "100%",
    padding: "14px",
    background: color,
    border: "none",
    borderRadius: "12px",
    color: textColor,
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Georgia,serif",
    marginBottom: "10px",
  };
}

function shareBtnStyle(bg: string, border?: string): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "13px 18px",
    background: bg,
    border: border ? `1px solid ${border}` : "none",
    borderRadius: "12px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "Georgia,serif",
    marginBottom: "10px",
  };
}

// Caption — exactly 2 hashtags
function buildCaption(ref: string | null): string {
  const link = ref
    ? `https://app.z2blegacybuilders.co.za/signup?ref=${ref}`
    : `https://app.z2blegacybuilders.co.za/workshop`;
  return `Just worked on my Entrepreneurial Consumer Workshop, I found this remarkable — You too Can\n\n${link}\n\n#Reka_Obesa_Okatuka #Entrepreneurial_Consumer`;
}

// Auto-scale quote to fill available poster space
function drawAutoScaleQuote(
  ctx: CanvasRenderingContext2D,
  text: string,
  W: number,
  H: number,
  quoteColor: string,
  markColor: string
) {
  const TOP = 240, BOT = H - 265;
  const availH = BOT - TOP, availW = W - 150;
  let bestSize = 28, bestLines: string[] = [];

  for (let fs = 72; fs >= 28; fs -= 2) {
    ctx.font = `italic ${fs}px Georgia,serif`;
    const lh = fs * 1.42;
    const lines: string[] = [];
    let cur: string[] = [];
    for (const w of text.split(" ")) {
      const test = [...cur, w].join(" ");
      if (ctx.measureText(test).width > availW && cur.length) {
        lines.push(cur.join(" ")); cur = [w];
      } else cur.push(w);
    }
    if (cur.length) lines.push(cur.join(" "));
    if (lines.length * lh <= availH) { bestSize = fs; bestLines = lines; break; }
  }

  const lh = bestSize * 1.42;
  const totalH = bestLines.length * lh;
  const startY = TOP + (availH - totalH) / 2 + bestSize;

  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = markColor;
  ctx.font = `bold ${Math.min(bestSize * 4.5, 280)}px Georgia,serif`;
  ctx.textAlign = "left";
  ctx.fillText("\u201C", 55, startY + bestSize * 0.5);
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.font = `italic ${bestSize}px Georgia,serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = quoteColor;
  bestLines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lh));
}

function makeGoldBar(ctx: CanvasRenderingContext2D, W: number) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "transparent"); g.addColorStop(0.4, "#D4AF37");
  g.addColorStop(0.6, "#F5D060");  g.addColorStop(1, "transparent");
  return g;
}

// Brand — Z2B TABLE BANQUET 44px, subtitle 24px
function drawBrand(ctx: CanvasRenderingContext2D, W: number, c1: string, c2: string) {
  ctx.textAlign = "center";
  ctx.fillStyle = c1;
  ctx.font = "bold 44px Georgia,serif";
  ctx.fillText("Z2B TABLE BANQUET", W / 2, 88);
  ctx.fillStyle = "rgba(212,175,55,0.35)";
  ctx.fillRect(W / 2 - 230, 100, 460, 1.5);
  ctx.fillStyle = c2;
  ctx.font = "24px Georgia,serif";
  ctx.fillText("Entrepreneurial Consumer Workshop", W / 2, 136);
  ctx.fillStyle = "rgba(212,175,55,0.2)";
  ctx.fillRect(W / 2 - 260, 148, 520, 1);
}

// Footer — only 2 hashtags
function drawFooter(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  c1: string, c2: string, c3: string,
  refCode: string,
  dark = false
) {
  ctx.textAlign = "center";
  ctx.fillStyle = c1;
  ctx.font = "bold 36px Georgia,serif";
  ctx.fillText("I found this remarkable.", W / 2, H - 192);
  ctx.fillStyle = c2;
  ctx.font = "28px Georgia,serif";
  ctx.fillText("You too Can — start your FREE workshop today", W / 2, H - 152);
  ctx.fillStyle = c3;
  ctx.font = "bold 26px Georgia,serif";
  ctx.fillText("#Reka_Obesa_Okatuka  #Entrepreneurial_Consumer", W / 2, H - 106);
  ctx.fillStyle = dark ? "#9CA3AF" : "rgba(255,255,255,0.28)";
  ctx.font = "19px monospace";
  ctx.fillText(`app.z2blegacybuilders.co.za/signup?ref=${refCode}`, W / 2, H - 60);
}

function renderPoster(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  templateId: string,
  quote: string,
  refCode: string
) {
  ctx.clearRect(0, 0, W, H);

  if (templateId === "royal") {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0D0A1E"); bg.addColorStop(0.5, "#1E1B4B"); bg.addColorStop(1, "#0A0818");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.08; ctx.fillStyle = "#8B5CF6";
    ctx.beginPath(); ctx.arc(W * 0.85, H * 0.15, 300, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.15, H * 0.85, 220, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    const g = makeGoldBar(ctx, W); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 6);
    drawBrand(ctx, W, "#D4AF37", "#A78BFA");
    drawAutoScaleQuote(ctx, quote, W, H, "#F5F3FF", "#D4AF37");
    drawFooter(ctx, W, H, "#FDE68A", "#DDD6FE", "rgba(167,139,250,0.7)", refCode);
    ctx.fillStyle = g; ctx.fillRect(0, H - 6, W, 6);
  } else if (templateId === "gold") {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#451A00"); bg.addColorStop(0.5, "#78350F"); bg.addColorStop(1, "#3B1900");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 4; ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.strokeStyle = "rgba(212,175,55,0.3)"; ctx.lineWidth = 1; ctx.strokeRect(44, 44, W - 88, H - 88);
    drawBrand(ctx, W, "#FDE68A", "#FEF3C7");
    drawAutoScaleQuote(ctx, quote, W, H, "#FEF9E7", "#FDE68A");
    drawFooter(ctx, W, H, "#D4AF37", "#FEF3C7", "rgba(253,230,138,0.7)", refCode);
  } else if (templateId === "fire") {
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, W, H);
    const fire = ctx.createRadialGradient(W / 2, H, 100, W / 2, H, 650);
    fire.addColorStop(0, "rgba(239,68,68,0.22)"); fire.addColorStop(1, "transparent");
    ctx.fillStyle = fire; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#EF4444"; ctx.fillRect(0, 0, W, 5);
    drawBrand(ctx, W, "#EF4444", "#fff");
    drawAutoScaleQuote(ctx, quote, W, H, "#FFFFFF", "#EF4444");
    drawFooter(ctx, W, H, "#EF4444", "rgba(255,255,255,0.8)", "rgba(239,68,68,0.7)", refCode);
    ctx.fillStyle = "#EF4444"; ctx.fillRect(0, H - 5, W, 5);
  } else if (templateId === "green") {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#022C22"); bg.addColorStop(0.5, "#064E3B"); bg.addColorStop(1, "#011B15");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const g = makeGoldBar(ctx, W); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 5);
    drawBrand(ctx, W, "#D4AF37", "#6EE7B7");
    drawAutoScaleQuote(ctx, quote, W, H, "#ECFDF5", "#D4AF37");
    drawFooter(ctx, W, H, "#D4AF37", "#A7F3D0", "rgba(212,175,55,0.7)", refCode);
    ctx.fillStyle = g; ctx.fillRect(0, H - 5, W, 5);
  } else if (templateId === "ivory") {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#FFFCF0"); bg.addColorStop(0.5, "#FEF8E8"); bg.addColorStop(1, "#FFFAF0");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1E1B4B"; ctx.fillRect(0, 0, W, 8);
    ctx.fillStyle = "#D4AF37"; ctx.fillRect(0, 8, W, 3);
    drawBrand(ctx, W, "#1E1B4B", "#4C1D95");
    drawAutoScaleQuote(ctx, quote, W, H, "#1A1A2E", "#1E1B4B");
    drawFooter(ctx, W, H, "#1E1B4B", "#4C1D95", "#D4AF37", refCode, true);
    ctx.fillStyle = "#D4AF37"; ctx.fillRect(0, H - 11, W, 3);
    ctx.fillStyle = "#1E1B4B"; ctx.fillRect(0, H - 8, W, 8);
  } else if (templateId === "ocean") {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#060B2E"); bg.addColorStop(0.5, "#0C1A5C"); bg.addColorStop(1, "#040820");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.05; ctx.strokeStyle = "#60A5FA"; ctx.lineWidth = 1.5;
    for (let y = 200; y < H - 200; y += 80) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) {
        const wv = Math.sin((x + y) * 0.015) * 20;
        x === 0 ? ctx.moveTo(x, y + wv) : ctx.lineTo(x, y + wv);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#3B82F6"; ctx.fillRect(0, 0, W, 6);
    drawBrand(ctx, W, "#60A5FA", "#BFDBFE");
    drawAutoScaleQuote(ctx, quote, W, H, "#EFF6FF", "#60A5FA");
    drawFooter(ctx, W, H, "#60A5FA", "#BFDBFE", "rgba(96,165,250,0.7)", refCode);
    ctx.fillStyle = "#3B82F6"; ctx.fillRect(0, H - 5, W, 5);
  } else if (templateId === "rose") {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#1A0010"); bg.addColorStop(0.5, "#3B0020"); bg.addColorStop(1, "#0F000A");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H * 0.4, 500);
    glow.addColorStop(0, "rgba(244,63,94,0.12)"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#E11D48"; ctx.fillRect(0, 0, W, 6);
    drawBrand(ctx, W, "#FB7185", "#FECDD3");
    drawAutoScaleQuote(ctx, quote, W, H, "#FFF1F2", "#FB7185");
    drawFooter(ctx, W, H, "#FB7185", "#FECDD3", "rgba(251,113,133,0.7)", refCode);
    ctx.fillStyle = "#E11D48"; ctx.fillRect(0, H - 5, W, 5);
  } else if (templateId === "slate") {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#080E1A"); bg.addColorStop(0.5, "#0F1A2E"); bg.addColorStop(1, "#060C16");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.04; ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#F59E0B"; ctx.fillRect(0, 0, W, 5);
    ctx.fillStyle = "#F59E0B"; ctx.fillRect(80, 230, 4, H - 450);
    drawBrand(ctx, W, "#F59E0B", "#CBD5E1");
    drawAutoScaleQuote(ctx, quote, W, H, "#F1F5F9", "#F59E0B");
    drawFooter(ctx, W, H, "#F59E0B", "#CBD5E1", "rgba(245,158,11,0.7)", refCode);
    ctx.fillStyle = "#F59E0B"; ctx.fillRect(0, H - 5, W, 5);
  }
}

// ── Static styles (no functions) ─────────────────────────────
const CSS: Record<string, CSSProperties> = {
  fab: {
    position: "fixed", bottom: "170px", right: "24px", zIndex: 9000,
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 20px",
    background: "linear-gradient(135deg,#064E3B,#065F46)",
    border: "1.5px solid #D4AF37", borderRadius: "50px",
    color: "#D4AF37", fontWeight: 700, fontSize: "13px",
    cursor: "pointer", fontFamily: "Georgia,serif",
    boxShadow: "0 4px 20px rgba(6,78,59,0.5)",
    letterSpacing: "0.3px",
  },
  backdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.82)",
    zIndex: 9001, backdropFilter: "blur(6px)",
  },
  modal: {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: 9002,
    width: "min(740px,96vw)", maxHeight: "92vh", overflowY: "auto",
    background: "linear-gradient(160deg,#0D0A1E 0%,#1E1B4B 100%)",
    border: "1.5px solid rgba(212,175,55,0.35)",
    borderRadius: "20px", fontFamily: "Georgia,serif",
    boxShadow: "0 32px 80px rgba(0,0,0,0.75)",
  },
  goldBar: {
    height: "4px",
    background: "linear-gradient(90deg,transparent,#D4AF37,#F5D060,#D4AF37,transparent)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 24px 14px",
    borderBottom: "1px solid rgba(212,175,55,0.15)",
  },
  body: { padding: "20px 24px 24px" },
  label: {
    display: "block", fontSize: "11px", fontWeight: 700,
    color: "rgba(212,175,55,0.8)", letterSpacing: "1px",
    textTransform: "uppercase", marginBottom: "8px",
  },
  hint: {
    background: "rgba(212,175,55,0.07)",
    border: "1px solid rgba(212,175,55,0.18)",
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "12px", color: "#DDD6FE",
    lineHeight: 1.6, marginBottom: "14px",
  },
  textarea: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "12px 14px",
    color: "#F5F3FF", fontSize: "14px",
    fontFamily: "Georgia,serif", lineHeight: 1.7,
    resize: "vertical", outline: "none",
  },
  swatchGrid: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    gap: "8px", marginTop: "14px",
  },
  previewImg: {
    width: "100%", height: "100%",
    objectFit: "cover", display: "block",
  },
  outlineBtn: {
    width: "100%", padding: "12px",
    background: "rgba(212,175,55,0.08)",
    border: "1.5px solid rgba(212,175,55,0.3)",
    borderRadius: "11px", color: "#F5D060",
    fontSize: "13px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Georgia,serif",
    marginBottom: "8px",
  },
  captionBox: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(212,175,55,0.18)",
    borderRadius: "10px", padding: "12px 14px",
    fontSize: "12px", color: "#DDD6FE",
    lineHeight: 1.7, whiteSpace: "pre-wrap",
    maxHeight: "130px", overflowY: "auto",
    marginBottom: "10px",
  },
  note: {
    fontSize: "11px", color: "rgba(255,255,255,0.25)",
    textAlign: "center", lineHeight: 1.5, marginTop: "8px",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px", color: "rgba(255,255,255,0.6)",
    width: "32px", height: "32px",
    fontSize: "18px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  backBtn: {
    padding: "13px 20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "11px", color: "rgba(255,255,255,0.55)",
    fontSize: "13px", cursor: "pointer", fontFamily: "Georgia,serif",
  },
  continueBtn: {
    flex: 1, padding: "13px",
    background: "linear-gradient(135deg,#4C1D95,#7C3AED)",
    border: "1.5px solid rgba(212,175,55,0.4)",
    borderRadius: "12px", color: "#F5D060",
    fontSize: "15px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Georgia,serif",
  },
  continueBtnDisabled: {
    flex: 1, padding: "13px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(212,175,55,0.4)",
    borderRadius: "12px", color: "rgba(255,255,255,0.25)",
    fontSize: "15px", fontWeight: 700,
    cursor: "not-allowed", fontFamily: "Georgia,serif",
  },
  copyBtnDefault: {
    width: "100%", padding: "12px",
    background: "rgba(139,92,246,0.12)",
    border: "1.5px solid rgba(139,92,246,0.3)",
    borderRadius: "11px", color: "#DDD6FE",
    fontSize: "13px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Georgia,serif",
    marginBottom: "10px",
  },
  copyBtnCopied: {
    width: "100%", padding: "12px",
    background: "rgba(16,185,129,0.12)",
    border: "1.5px solid rgba(16,185,129,0.35)",
    borderRadius: "11px", color: "#6EE7B7",
    fontSize: "13px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Georgia,serif",
    marginBottom: "10px",
  },
  editLink: {
    width: "100%", background: "none", border: "none",
    color: "rgba(167,139,250,0.5)", fontSize: "12px",
    cursor: "pointer", fontFamily: "Georgia,serif",
    textDecoration: "underline",
  },
  refBox: {
    marginTop: "14px",
    background: "rgba(212,175,55,0.07)",
    border: "1px solid rgba(212,175,55,0.18)",
    borderRadius: "10px", padding: "10px 14px",
  },
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px",
  },
  previewWrap: {
    borderRadius: "12px", overflow: "hidden",
    border: "1.5px solid rgba(212,175,55,0.25)",
    aspectRatio: "1080/1350" as unknown as undefined,
    background: "#1E1B4B",
  },
  posterWrap: {
    borderRadius: "14px", overflow: "hidden",
    border: "2px solid rgba(212,175,55,0.35)",
    aspectRatio: "1080/1350" as unknown as undefined,
  },
  badgeSpan: {
    marginLeft: "auto", fontSize: "11px",
    opacity: 0.65, fontWeight: 400,
  } as CSSProperties,
};

// ── Main Component ────────────────────────────────────────────
export default function ECPosterStudio({ builderRef, builderName }: ECPosterStudioProps) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [hidden,  setHidden]  = useState(false);
  const [step, setStep]                   = useState<"pick" | "edit" | "share">("pick");
  const [selected, setSelected]           = useState("royal");
  const [quoteText, setQuoteText]         = useState("");
  const [imageUrl, setImageUrl]           = useState("");
  const [captionCopied, setCaptionCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const refCode  = builderRef || "Z2BREF";
  const caption  = buildCaption(builderRef);
  const template = TEMPLATES.find(t => t.id === selected)!;

  const drawPoster = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    canvasRef.current.width  = 1080;
    canvasRef.current.height = 1350;
    renderPoster(ctx, 1080, 1350, selected, quoteText || "Your remarkable quote will fill this space beautifully...", refCode);
    setImageUrl(canvasRef.current.toDataURL("image/png"));
  }, [selected, quoteText, refCode]);

  useEffect(() => {
    if (step === "edit" || step === "share") drawPoster();
  }, [step, selected, quoteText, drawPoster]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl; a.download = `Z2B-Poster-${selected}-${Date.now()}.png`;
    a.click();
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption).then(() => {
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2500);
    });
  };

  const handleWhatsApp  = () => window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
  const handleFacebook  = () => {
    const link = builderRef
      ? `https://app.z2blegacybuilders.co.za/signup?ref=${builderRef}`
      : `https://app.z2blegacybuilders.co.za/workshop`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(caption)}`, "_blank");
  };
  const handleTikTok    = () => { handleDownload(); handleCopyCaption(); };

  const close = () => { setIsOpen(false); setStep("pick"); };

  if (hidden) return null;

  const FloatingBtn = (
    <div style={{ position:"fixed", bottom:"170px", right:"24px", zIndex:9000, display:"flex", alignItems:"center", gap:"0" }}>
      <button style={{ ...CSS.fab, position:"relative", bottom:"auto", right:"auto", borderRadius:"50px 0 0 50px", zIndex:"auto" as any }} onClick={() => setIsOpen(true)}>
        <span style={{ fontSize: "16px" }}>🎨</span> Make Poster
      </button>
      <button
        onClick={() => setHidden(true)}
        title="Hide"
        style={{ height:"42px", width:"28px", background:"rgba(0,0,0,0.55)", border:"1.5px solid rgba(212,175,55,0.4)", borderLeft:"none", borderRadius:"0 50px 50px 0", color:"rgba(255,255,255,0.65)", fontSize:"16px", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
      >×</button>
    </div>
  );

  if (!isOpen) return FloatingBtn;

  return (
    <>
      {FloatingBtn}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={CSS.backdrop} onClick={close} />

      <div style={CSS.modal} onClick={e => e.stopPropagation()}>
        <div style={CSS.goldBar} />

        {/* Header */}
        <div style={CSS.header}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🎨</span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#D4AF37" }}>EC Poster Studio</span>
            </div>
            <p style={{ margin: "3px 0 0 30px", fontSize: "12px", color: "rgba(167,139,250,0.8)" }}>
              {step === "pick"  && "Step 1 — Choose your template"}
              {step === "edit"  && "Step 2 — Paste your remarkable quote"}
              {step === "share" && "Step 3 — Download & share your poster"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {(["pick", "edit", "share"] as const).map(s => (
              <div key={s} style={{
                width: step === s ? "24px" : "8px", height: "8px", borderRadius: "4px",
                transition: "all 0.3s",
                background: step === s ? "#D4AF37" : "rgba(212,175,55,0.2)",
              }} />
            ))}
            <button style={CSS.closeBtn} onClick={close}>×</button>
          </div>
        </div>

        {/* ── STEP 1: Pick Template ── */}
        {step === "pick" && (
          <div style={CSS.body}>
            <div style={CSS.hint}>
              💡 Pick a template → paste the quote that moved you → download the poster → share to WhatsApp, Facebook or TikTok with your referral link included automatically.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  style={{
                    cursor: "pointer", borderRadius: "14px", overflow: "hidden",
                    border: selected === t.id ? "3px solid #D4AF37" : "2px solid rgba(255,255,255,0.08)",
                    transform: selected === t.id ? "scale(1.03)" : "scale(1)",
                    transition: "all 0.2s",
                    boxShadow: selected === t.id ? "0 4px 20px rgba(212,175,55,0.3)" : "none",
                  }}
                >
                  <div style={{ height: "110px", background: t.preview, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", padding: "8px" }}>
                      <div style={{ fontSize: "10px", color: t.accent, fontWeight: 700, letterSpacing: "1px", marginBottom: "6px" }}>Z2B TABLE BANQUET</div>
                      <div style={{ width: "80px", height: "18px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", margin: "0 auto" }} />
                    </div>
                    {selected === t.id && (
                      <div style={{ position: "absolute", top: "6px", right: "6px", width: "22px", height: "22px", borderRadius: "50%", background: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#000", fontWeight: 700 }}>✓</div>
                    )}
                  </div>
                  <div style={{ padding: "8px 10px", background: "rgba(0,0,0,0.4)", fontSize: "12px", fontWeight: 700, color: selected === t.id ? "#D4AF37" : "rgba(255,255,255,0.6)", textAlign: "center" }}>
                    {t.name}
                  </div>
                </div>
              ))}
            </div>
            <button style={{ ...btnStyle("linear-gradient(135deg,#4C1D95,#7C3AED)"), marginTop: "20px", border: "1.5px solid #D4AF37" }} onClick={() => setStep("edit")}>
              Use {template.name} →
            </button>
          </div>
        )}

        {/* ── STEP 2: Edit Quote ── */}
        {step === "edit" && (
          <div style={CSS.body}>
            <div style={CSS.twoCol}>
              {/* Left */}
              <div>
                <label style={CSS.label}>Paste Your Remarkable Quote</label>
                <div style={CSS.hint}>The text auto-scales to fill the poster — short or long quotes both look professional.</div>
                <textarea
                  value={quoteText}
                  onChange={e => setQuoteText(e.target.value)}
                  placeholder="Paste or type the sentence or paragraph that moved you most..."
                  rows={7}
                  style={CSS.textarea}
                />
                <div style={{ marginTop: "14px" }}>
                  <label style={CSS.label}>Switch Template</label>
                  <div style={CSS.swatchGrid}>
                    {TEMPLATES.map(t => (
                      <div
                        key={t.id}
                        title={t.name}
                        onClick={() => setSelected(t.id)}
                        style={swatchStyle(t.id, selected)}
                      />
                    ))}
                  </div>
                </div>
                <div style={CSS.refBox}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(212,175,55,0.7)", letterSpacing: "0.5px", marginBottom: "4px" }}>REFERRAL LINK (auto-included)</div>
                  <div style={{ fontSize: "12px", color: "#F5D060", fontFamily: "monospace", wordBreak: "break-all" }}>
                    app.z2blegacybuilders.co.za/signup?ref={refCode}
                  </div>
                </div>
              </div>
              {/* Right: live preview */}
              <div>
                <label style={CSS.label}>Live Preview</label>
                <div style={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid rgba(212,175,55,0.25)", aspectRatio: "4/5", background: template.preview }}>
                  {imageUrl
                    ? <img src={imageUrl} alt="preview" style={CSS.previewImg} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "12px", color: "rgba(255,255,255,0.3)", padding: "20px", textAlign: "center" }}>Preview updates as you type...</div>
                  }
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={CSS.backBtn} onClick={() => setStep("pick")}>← Back</button>
              <button
                disabled={quoteText.trim().length < 5}
                onClick={() => setStep("share")}
                style={quoteText.trim().length >= 5 ? CSS.continueBtn : CSS.continueBtnDisabled}
              >
                {quoteText.trim().length >= 5 ? "Generate Poster & Share →" : "Paste your quote to continue"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Download & Share ── */}
        {step === "share" && (
          <div style={CSS.body}>
            <div style={CSS.twoCol}>
              {/* Poster */}
              <div>
                <label style={CSS.label}>Your Poster</label>
                <div style={{ borderRadius: "14px", overflow: "hidden", border: "2px solid rgba(212,175,55,0.35)", aspectRatio: "4/5" }}>
                  {imageUrl && <img src={imageUrl} alt="poster" style={CSS.previewImg} />}
                </div>
                <button style={{ ...CSS.outlineBtn, marginTop: "10px" }} onClick={handleDownload}>⬇ Download Poster (PNG)</button>
                <button style={CSS.editLink} onClick={() => setStep("edit")}>← Edit quote or template</button>
              </div>
              {/* Caption + share */}
              <div>
                <label style={CSS.label}>Auto-Generated Caption</label>
                <div style={CSS.captionBox}>{caption}</div>
                <button style={captionCopied ? CSS.copyBtnCopied : CSS.copyBtnDefault} onClick={handleCopyCaption}>
                  {captionCopied ? "✓ Caption Copied!" : "📋 Copy Caption"}
                </button>

                <label style={{ ...CSS.label, marginTop: "14px" }}>Share</label>

                <button style={shareBtnStyle("#25D366")} onClick={handleWhatsApp}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Share Caption to WhatsApp
                  <span style={CSS.badgeSpan}>attach poster manually</span>
                </button>

                <button style={shareBtnStyle("#1877F2")} onClick={handleFacebook}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.994 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Share to Facebook
                  <span style={CSS.badgeSpan}>attach poster manually</span>
                </button>

                <button style={shareBtnStyle("#010101", "#69C9D0")} onClick={handleTikTok}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.02a8.16 8.16 0 004.77 1.52V7.1a4.85 4.85 0 01-1-.41z"/></svg>
                  TikTok — Download + Copy Caption
                  <span style={CSS.badgeSpan}>paste in app</span>
                </button>

                <div style={CSS.note}>
                  WhatsApp &amp; Facebook cannot receive image files from websites.<br />
                  Download the poster first, then attach it manually when posting.
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={CSS.goldBar} />
      </div>
    </>
  );
}
