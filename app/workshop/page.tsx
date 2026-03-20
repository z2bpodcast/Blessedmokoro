"use client";

// ── ADDITION 1: Supabase import ──
import { supabase } from "@/lib/supabase";

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import WorkshopEmailGate from "@/components/WorkshopEmailGate";
// ── PurpleCowShareTool — inlined ─────────────────────────────
// ============================================================
// FILE LOCATION: components/PurpleCowShareTool.tsx
// USAGE: Import and drop anywhere in the workshop page
//        <PurpleCowShareTool builderRef={builderRef} builderName={builderFirstName} />
// ============================================================


interface PurpleCowShareToolProps {
  builderRef: string | null;
  builderName?: string | null;
}

// ── Colour palette ────────────────────────────────────────────
const ROYAL_PURPLE = "#4C1D95";
const DEEP_PURPLE  = "#1E1B4B";
const GOLD         = "#D4AF37";
const GOLD_LIGHT   = "#F5D060";
const WHITE        = "#FFFFFF";
const SOFT_LAVENDER = "#EDE9FE";
const DARK_CARD    = "#13102B";

// ── Platform configs ──────────────────────────────────────────
const PLATFORMS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    hoverColor: "#1DA851",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    hoverColor: "#0D65D8",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.994 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "tiktok",
    label: "TikTok",
    color: "#010101",
    hoverColor: "#333",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.02a8.16 8.16 0 004.77 1.52V7.1a4.85 4.85 0 01-1-.41z"/>
      </svg>
    ),
  },
  {
    id: "copy",
    label: "Copy Text",
    color: ROYAL_PURPLE,
    hoverColor: "#3b0764",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
    ),
  },
];

// ── Canvas image generator ────────────────────────────────────
function generateShareImage(
  remarkableText: string,
  builderRef: string,
  builderName: string,
  canvas: HTMLCanvasElement
): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const W = 1080, H = 1350; // Portrait 4:5 — best for all platforms
  canvas.width = W;
  canvas.height = H;

  // ── Background: deep royal gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0D0A1E");
  bgGrad.addColorStop(0.45, "#1E1B4B");
  bgGrad.addColorStop(1, "#0A0818");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative circles ──
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#8B5CF6";
  ctx.beginPath(); ctx.arc(950, 200, 320, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(80, 1150, 260, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#D4AF37";
  ctx.beginPath(); ctx.arc(540, 680, 400, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // ── Gold top border ──
  const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
  goldGrad.addColorStop(0, "transparent");
  goldGrad.addColorStop(0.3, "#D4AF37");
  goldGrad.addColorStop(0.7, "#F5D060");
  goldGrad.addColorStop(1, "transparent");
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, W, 5);

  // ── Header: Z2B branding ──
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 38px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Z2B LEGACY BUILDERS", W / 2, 90);

  ctx.fillStyle = "rgba(212,175,55,0.5)";
  ctx.fillRect(W / 2 - 220, 102, 440, 1.5);

  ctx.fillStyle = "#A78BFA";
  ctx.font = "22px Georgia, serif";
  ctx.fillText("ENTREPRENEURIAL CONSUMER WORKSHOP", W / 2, 140);

  // ── Quotation mark ──
  ctx.fillStyle = "rgba(212,175,55,0.25)";
  ctx.font = "bold 220px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("\u201C", 52, 330);

  // ── Remarkable text ──
  // Word-wrap the remarkable text
  ctx.fillStyle = "#F5F3FF";
  ctx.font = "italic 46px Georgia, serif";
  ctx.textAlign = "center";

  const maxWidth = 860;
  const lineHeight = 68;
  const startY = 350;
  const words = remarkableText.split(" ");
  let line = "";
  let lineY = startY;
  const lines: string[] = [];

  for (const word of words) {
    const test = line + (line ? " " : "") + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  // Cap at 8 lines for visual space
  const displayLines = lines.slice(0, 8);
  if (lines.length > 8) displayLines[7] = displayLines[7] + "...";

  // Center block vertically in quote area (350 to 820)
  const blockH = displayLines.length * lineHeight;
  const blockStartY = 350 + Math.max(0, (470 - blockH) / 2);

  displayLines.forEach((l, i) => {
    ctx.fillText(l, W / 2, blockStartY + i * lineHeight);
  });

  // ── Closing quote ──
  ctx.fillStyle = "rgba(212,175,55,0.25)";
  ctx.font = "bold 220px Georgia, serif";
  ctx.textAlign = "right";
  ctx.fillText("\u201D", W - 52, 830);

  // ── Gold divider ──
  const divGrad = ctx.createLinearGradient(0, 0, W, 0);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.5, "#D4AF37");
  divGrad.addColorStop(1, "transparent");
  ctx.fillStyle = divGrad;
  ctx.fillRect(80, 870, W - 160, 1.5);

  // ── Invitation text ──
  ctx.fillStyle = "#FDE68A";
  ctx.font = "bold 36px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("I just found this remarkable.", W / 2, 930);

  ctx.fillStyle = "#DDD6FE";
  ctx.font = "30px Georgia, serif";
  ctx.fillText("You are invited to start your", W / 2, 978);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 36px Georgia, serif";
  ctx.fillText("Entrepreneurial Consumer Workshop", W / 2, 1022);

  // ── Tier boxes ──
  // Free box
  ctx.fillStyle = "rgba(139,92,246,0.18)";
  ctx.beginPath();
  ctx.roundRect(130, 1058, 360, 88, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(167,139,250,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#A78BFA";
  ctx.font = "bold 28px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("FREE", 310, 1091);
  ctx.fillStyle = "#DDD6FE";
  ctx.font = "22px Georgia, serif";
  ctx.fillText("18 Sessions — No Cost", 310, 1122);

  // Paid box
  const boxGrad = ctx.createLinearGradient(590, 1058, 950, 1146);
  boxGrad.addColorStop(0, "rgba(212,175,55,0.22)");
  boxGrad.addColorStop(1, "rgba(212,175,55,0.08)");
  ctx.fillStyle = boxGrad;
  ctx.beginPath();
  ctx.roundRect(590, 1058, 360, 88, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(212,175,55,0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#F5D060";
  ctx.font = "bold 28px Georgia, serif";
  ctx.fillText("R480 ONCE-OFF", 770, 1091);
  ctx.fillStyle = "#FDE68A";
  ctx.font = "22px Georgia, serif";
  ctx.fillText("All 99 Sessions — No Monthly Fee", 770, 1122);

  // ── Builder referral URL ──
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "22px monospace";
  ctx.textAlign = "center";
  const refUrl = `app.z2blegacybuilders.co.za/signup?ref=${builderRef}`;
  ctx.fillText(refUrl, W / 2, 1198);

  // ── Builder name ──
  if (builderName) {
    ctx.fillStyle = "#6B7280";
    ctx.font = "20px Georgia, serif";
    ctx.fillText(`Shared by ${builderName}`, W / 2, 1238);
  }

  // ── Gold bottom border ──
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, H - 5, W, 5);

  // ── #Reka tagline ──
  ctx.fillStyle = "rgba(212,175,55,0.4)";
  ctx.font = "italic 18px Georgia, serif";
  ctx.fillText("#Reka_Obesa_Okatuka", W / 2, H - 18);

  return canvas.toDataURL("image/png");
}

// ── Post text generator ───────────────────────────────────────
function generatePostText(
  remarkableText: string,
  builderRef: string | null,
  platform: string
): string {
  const refLink = builderRef
    ? `https://app.z2blegacybuilders.co.za/signup?ref=${builderRef}`
    : "https://app.z2blegacybuilders.co.za/signup";

  if (platform === "whatsapp") {
    return (
      `Hello 👋\n\n` +
      `I just read something I find remarkable from the *Z2B Entrepreneurial Consumer Workshop*:\n\n` +
      `_"${remarkableText}"_\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `You are invited to start your Entrepreneurial Consumer Workshop:\n\n` +
      `✅ *FREE* — 18 Sessions. No cost. No card.\n` +
      `🔑 *R480 once-off* — All 99 Sessions. No monthly fees.\n\n` +
      `👇 Start here:\n${refLink}`
    );
  }

  if (platform === "facebook") {
    return (
      `I just read something that stopped me in my tracks. 👇\n\n` +
      `"${remarkableText}"\n\n` +
      `This is from the Z2B Entrepreneurial Consumer Workshop — a 99-session programme that teaches you how to build income without quitting your job.\n\n` +
      `📖 18 sessions are completely FREE.\n` +
      `🔑 Complete all 99 for just R480 once-off — no monthly fees, ever.\n\n` +
      `If this sparked something in you — start here:\n👉 ${refLink}\n\n` +
      `#EntrepreneurialConsumer #Z2B #PurpleCow #ThirdPath #BuildWhileEmployed`
    );
  }

  if (platform === "tiktok") {
    return (
      `POV: You're reading a workshop that rewires how you think about money 🤯\n\n` +
      `"${remarkableText}"\n\n` +
      `This hit different. 18 sessions FREE. 99 sessions R480 once-off.\n` +
      `Link in bio 👆 ${refLink}\n\n` +
      `#EntrepreneurialConsumer #Z2BWorkshop #MindsetShift #BuildWhileEmployed #SouthAfrica`
    );
  }

  return `"${remarkableText}"\n\n${refLink}`;
}

// ── Main Component ────────────────────────────────────────────
function PurpleCowShareTool({ builderRef, builderName }: PurpleCowShareToolProps) {
  const [isOpen, setIsOpen]                   = useState(false);
  const [step, setStep]                       = useState<"input" | "preview">("input");
  const [remarkableText, setRemarkableText]   = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [imageUrl, setImageUrl]               = useState<string>("");
  const [postText, setPostText]               = useState<string>("");
  const [copied, setCopied]                   = useState(false);
  const [imgCopied, setImgCopied]             = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const canvasRef                             = useRef<HTMLCanvasElement>(null);
  const textareaRef                           = useRef<HTMLTextAreaElement>(null);

  const refCode = builderRef || "Z2BREF";
  const name    = builderName || "a Z2B Builder";

  // Generate on platform select
  const handlePlatformSelect = useCallback(
    (platformId: string) => {
      if (!remarkableText.trim()) return;
      setSelectedPlatform(platformId);
      const text = generatePostText(remarkableText.trim(), builderRef, platformId);
      setPostText(text);

      if (platformId !== "copy" && canvasRef.current) {
        const url = generateShareImage(
          remarkableText.trim(),
          refCode,
          name,
          canvasRef.current
        );
        setImageUrl(url);
      }
      setStep("preview");
    },
    [remarkableText, builderRef, refCode, name]
  );

  const handleCopyText = () => {
    navigator.clipboard.writeText(postText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareLink = () => {
    const platform = PLATFORMS.find((p) => p.id === selectedPlatform);
    if (!platform) return;
    if (selectedPlatform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(postText)}`, "_blank");
    } else if (selectedPlatform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          builderRef
            ? `https://app.z2blegacybuilders.co.za/signup?ref=${builderRef}`
            : "https://app.z2blegacybuilders.co.za/signup"
        )}&quote=${encodeURIComponent(postText)}`,
        "_blank"
      );
    } else if (selectedPlatform === "tiktok") {
      // TikTok has no web share API — copy to clipboard for paste into app
      navigator.clipboard.writeText(postText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `z2b-purple-cow-${Date.now()}.png`;
    a.click();
  };

  const reset = () => {
    setStep("input");
    setSelectedPlatform(null);
    setImageUrl("");
    setPostText("");
    setCopied(false);
  };

  const refLink = builderRef
    ? `https://app.z2blegacybuilders.co.za/signup?ref=${builderRef}`
    : "https://app.z2blegacybuilders.co.za/signup";

  // Floating Purple Cow button
  const FloatingButton = (
    <button
      onClick={() => setIsOpen(true)}
      style={{
        position: "fixed",
        bottom: "100px",
        right: "24px",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 22px",
        background: `linear-gradient(135deg, ${ROYAL_PURPLE}, #7C3AED)`,
        border: `1.5px solid ${GOLD}`,
        borderRadius: "50px",
        color: GOLD,
        fontWeight: 700,
        fontSize: "14px",
        cursor: "pointer",
        letterSpacing: "0.5px",
        boxShadow: `0 4px 24px rgba(76,29,149,0.5), 0 0 0 1px rgba(212,175,55,0.2)`,
        fontFamily: "Georgia, serif",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 32px rgba(76,29,149,0.7), 0 0 0 2px rgba(212,175,55,0.4)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px rgba(76,29,149,0.5), 0 0 0 1px rgba(212,175,55,0.2)`;
      }}
    >
      <span style={{ fontSize: "18px" }}>🐄</span>
      Share Remarkable
    </button>
  );

  if (!isOpen) return FloatingButton;

  return (
    <>
      {FloatingButton}

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* ── Backdrop ── */}
      <div
        onClick={() => { setIsOpen(false); reset(); }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 9001,
          backdropFilter: "blur(4px)",
        }}
      />

      {/* ── Modal ── */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9002,
          width: "min(660px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: DARK_CARD,
          border: `1.5px solid rgba(212,175,55,0.35)`,
          borderRadius: "20px",
          boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.15), inset 0 1px 0 rgba(212,175,55,0.1)`,
          fontFamily: "Georgia, serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Gold top line ── */}
        <div style={{
          height: "3px",
          background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)`,
          borderRadius: "20px 20px 0 0",
        }} />

        {/* ── Header ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px 16px",
          borderBottom: "1px solid rgba(212,175,55,0.15)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>🐄</span>
              <h2 style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: GOLD,
                letterSpacing: "0.5px",
              }}>
                Purple Cow Share Tool
              </h2>
            </div>
            <p style={{ margin: "4px 0 0 32px", fontSize: "13px", color: "rgba(167,139,250,0.8)" }}>
              Share what moves you. Invite who needs it.
            </p>
          </div>
          <button
            onClick={() => { setIsOpen(false); reset(); }}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "rgba(255,255,255,0.6)",
              width: "34px",
              height: "34px",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Step 1: Input ── */}
        {step === "input" && (
          <div style={{ padding: "24px 28px 28px" }}>

            {/* Instruction */}
            <div style={{
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
            }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#C4B5FD", lineHeight: 1.6 }}>
                <strong style={{ color: "#DDD6FE" }}>How it works:</strong>{" "}
                Paste or type the sentence, lesson or paragraph from the workshop that moved you most.
                Then choose your platform — we will generate a beautiful post with your referral link.
              </p>
            </div>

            {/* Textarea */}
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "rgba(212,175,55,0.9)", fontWeight: 700, letterSpacing: "0.5px" }}>
              THE REMARKABLE THING YOU FOUND
            </label>
            <textarea
              ref={textareaRef}
              value={remarkableText}
              onChange={(e) => setRemarkableText(e.target.value)}
              placeholder='Paste or type the sentence, lesson or paragraph that moved you most from the workshop...'
              rows={6}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: remarkableText.trim()
                  ? `1.5px solid rgba(212,175,55,0.5)`
                  : "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "#F5F3FF",
                fontSize: "15px",
                lineHeight: 1.7,
                resize: "vertical",
                fontFamily: "Georgia, serif",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.7)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = remarkableText.trim()
                  ? "rgba(212,175,55,0.5)"
                  : "rgba(255,255,255,0.1)";
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              <span>{remarkableText.length} characters</span>
              <span>{remarkableText.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>

            {/* Platform select */}
            {remarkableText.trim().length > 10 && (
              <div style={{ marginTop: "24px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "13px", color: "rgba(212,175,55,0.9)", fontWeight: 700, letterSpacing: "0.5px" }}>
                  CHOOSE YOUR PLATFORM
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePlatformSelect(p.id)}
                      onMouseEnter={() => setHoveredPlatform(p.id)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "14px 20px",
                        background: hoveredPlatform === p.id ? p.hoverColor : p.color,
                        border: "none",
                        borderRadius: "12px",
                        color: WHITE,
                        fontWeight: 700,
                        fontSize: "15px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        transform: hoveredPlatform === p.id ? "translateY(-2px)" : "none",
                        boxShadow: hoveredPlatform === p.id
                          ? `0 6px 20px rgba(0,0,0,0.35)`
                          : `0 2px 8px rgba(0,0,0,0.2)`,
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      {p.icon}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {remarkableText.trim().length > 0 && remarkableText.trim().length <= 10 && (
              <p style={{ marginTop: "12px", fontSize: "13px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                Keep writing — your remarkable content is taking shape...
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: Preview ── */}
        {step === "preview" && (
          <div style={{ padding: "24px 28px 28px" }}>

            {/* Platform badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <button
                onClick={reset}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.6)",
                  padding: "6px 14px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                }}
              >
                ← Back
              </button>
              {selectedPlatform && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: `${PLATFORMS.find(p => p.id === selectedPlatform)?.color}22`,
                  border: `1px solid ${PLATFORMS.find(p => p.id === selectedPlatform)?.color}55`,
                  borderRadius: "20px",
                  padding: "4px 14px",
                  fontSize: "13px",
                  color: "#DDD6FE",
                  fontWeight: 700,
                }}>
                  {PLATFORMS.find(p => p.id === selectedPlatform)?.icon}
                  {PLATFORMS.find(p => p.id === selectedPlatform)?.label} Post
                </div>
              )}
            </div>

            {/* Preview post text */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "14px",
              padding: "18px 20px",
              marginBottom: "16px",
              maxHeight: "260px",
              overflowY: "auto",
            }}>
              <p style={{
                margin: 0,
                fontSize: "14px",
                color: "#F5F3FF",
                whiteSpace: "pre-wrap",
                lineHeight: 1.75,
              }}>
                {postText}
              </p>
            </div>

            {/* Referral link display */}
            <div style={{
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(212,175,55,0.7)", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "3px" }}>YOUR REFERRAL LINK</div>
                <a
                  href={refLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: GOLD_LIGHT, wordBreak: "break-all", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {refLink}
                </a>
              </div>
              <div style={{
                background: "rgba(212,175,55,0.15)",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                color: GOLD,
                fontWeight: 700,
                flexShrink: 0,
                letterSpacing: "0.3px",
              }}>
                ACTIVE
              </div>
            </div>

            {/* Image preview (not for copy-only) */}
            {imageUrl && selectedPlatform !== "copy" && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "rgba(212,175,55,0.7)", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "10px" }}>
                  VISUAL TEMPLATE PREVIEW
                </div>
                <div style={{
                  border: "1.5px solid rgba(212,175,55,0.25)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  maxHeight: "240px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.3)",
                }}>
                  <img
                    src={imageUrl}
                    alt="Share template preview"
                    style={{ width: "100%", objectFit: "contain", maxHeight: "240px" }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>

              {/* Copy text */}
              <button
                onClick={handleCopyText}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "13px 18px",
                  background: copied
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(139,92,246,0.15)",
                  border: copied
                    ? "1.5px solid rgba(16,185,129,0.5)"
                    : "1.5px solid rgba(139,92,246,0.35)",
                  borderRadius: "12px",
                  color: copied ? "#6EE7B7" : "#DDD6FE",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "Georgia, serif",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy Text"}
              </button>

              {/* Share on platform */}
              {selectedPlatform && selectedPlatform !== "copy" && (
                <button
                  onClick={handleShareLink}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "13px 18px",
                    background: PLATFORMS.find(p => p.id === selectedPlatform)?.color,
                    border: "none",
                    borderRadius: "12px",
                    color: WHITE,
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {PLATFORMS.find(p => p.id === selectedPlatform)?.icon}
                  {selectedPlatform === "tiktok" ? "Copy for TikTok" : `Open ${PLATFORMS.find(p => p.id === selectedPlatform)?.label}`}
                </button>
              )}

              {/* Download image */}
              {imageUrl && selectedPlatform !== "copy" && (
                <button
                  onClick={handleDownloadImage}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "13px 18px",
                    background: "rgba(212,175,55,0.12)",
                    border: "1.5px solid rgba(212,175,55,0.35)",
                    borderRadius: "12px",
                    color: GOLD_LIGHT,
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    gridColumn: selectedPlatform === "copy" ? "1 / -1" : "auto",
                    fontFamily: "Georgia, serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.12)";
                  }}
                >
                  ⬇ Download Image
                </button>
              )}
            </div>

            {/* TikTok note */}
            {selectedPlatform === "tiktok" && (
              <p style={{ marginTop: "12px", fontSize: "12px", color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.5 }}>
                TikTok doesn't support direct web sharing. Copy the text and download the image, then paste into the TikTok app.
              </p>
            )}

            {/* Share another */}
            <div style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(212,175,55,0.12)",
              display: "flex",
              justifyContent: "center",
            }}>
              <button
                onClick={reset}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(167,139,250,0.7)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                  textDecoration: "underline",
                }}
              >
                Share something else from the workshop
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 28px",
          borderTop: "1px solid rgba(212,175,55,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "12px", color: "rgba(212,175,55,0.4)", fontStyle: "italic" }}>
            #Reka_Obesa_Okatuka
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            Z2B Entrepreneurial Consumer Workshop
          </span>
        </div>

        {/* ── Bottom gold line ── */}
        <div style={{
          height: "3px",
          background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)`,
          borderRadius: "0 0 20px 20px",
        }} />
      </div>
    </>
  );
}

// ── ProspectRegistrationGate — inlined ───────────────────────
// ============================================================
// FILE LOCATION: components/ProspectRegistrationGate.tsx
//
// PURPOSE:
//   Lightweight 3-field registration modal shown to a new
//   prospect BEFORE they touch the workshop.
//   Records: full_name, whatsapp, email in profiles table.
//   Locks referred_by sponsor PERMANENTLY at this moment.
//   Also adds them to builder's funnel_prospects pipeline.
//
// USAGE in workshop/page.tsx:
//   <ProspectRegistrationGate
//     sponsorRef={urlRef}         // referral code from URL ?ref=
//     sponsorName={inviterName}   // resolved from profiles
//     onComplete={() => setShowWelcome(false)}
//   />
// ============================================================


interface ProspectRegistrationGateProps {
  sponsorRef: string | null;    // e.g. "REVMOK2B"
  sponsorName: string;          // e.g. "Rev Mokoro Manana"
  onComplete: () => void;       // called when registration done — opens workshop
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.82)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    backdropFilter: "blur(6px)",
  },
  modal: {
    background: "linear-gradient(160deg, #0D0A1E 0%, #1E1B4B 60%, #0A0818 100%)",
    border: "1.5px solid rgba(212,175,55,0.4)",
    borderRadius: "20px",
    width: "min(500px, 100%)",
    overflow: "hidden",
    boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.12), inset 0 1px 0 rgba(212,175,55,0.1)",
    animation: "slideInUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
    fontFamily: "Georgia, serif",
  },
  goldBar: {
    height: "4px",
    background: "linear-gradient(90deg, transparent, #D4AF37, #F5D060, #D4AF37, transparent)",
  },
  header: {
    padding: "28px 28px 0",
    textAlign: "center" as const,
  },
  hearts: {
    fontSize: "32px",
    letterSpacing: "4px",
    display: "block",
    marginBottom: "10px",
    animation: "heartbeat 1.5s ease-in-out infinite",
  },
  title: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#D4AF37",
    margin: "0 0 6px",
    textShadow: "0 2px 12px rgba(212,175,55,0.4)",
    letterSpacing: "0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#A78BFA",
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  inviteBox: {
    background: "rgba(139,92,246,0.12)",
    border: "1px solid rgba(139,92,246,0.3)",
    borderRadius: "12px",
    padding: "14px 18px",
    margin: "0 28px 20px",
    textAlign: "center" as const,
  },
  inviteLabel: {
    fontSize: "12px",
    color: "rgba(167,139,250,0.8)",
    margin: "0 0 6px",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  builderName: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#F5D060",
    margin: "0 0 4px",
  },
  inviteSub: {
    fontSize: "13px",
    color: "#DDD6FE",
    margin: 0,
    lineHeight: 1.5,
  },
  divider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
    margin: "0 28px 20px",
  },
  body: {
    padding: "0 28px 28px",
  },
  formLabel: {
    display: "block" as const,
    fontSize: "11px",
    fontWeight: 700,
    color: "rgba(212,175,55,0.85)",
    letterSpacing: "0.8px",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
  },
  formGroup: {
    marginBottom: "14px",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#F5F3FF",
    fontSize: "15px",
    fontFamily: "Georgia, serif",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  },
  error: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.4)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#FCA5A5",
    fontSize: "13px",
    marginBottom: "14px",
    lineHeight: 1.5,
  },
  freeTag: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  pill: (color: string) => ({
    flex: 1,
    background: `${color}18`,
    border: `1px solid ${color}44`,
    borderRadius: "8px",
    padding: "8px 10px",
    textAlign: "center" as const,
    fontSize: "12px",
    color: color,
    fontWeight: 700,
    lineHeight: 1.4,
  }),
  btn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #4C1D95, #7C3AED)",
    border: "1.5px solid #D4AF37",
    borderRadius: "12px",
    color: "#F5D060",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.5px",
    fontFamily: "Georgia, serif",
    boxShadow: "0 4px 20px rgba(76,29,149,0.5)",
    transition: "all 0.2s",
  },
  skipBtn: {
    display: "block" as const,
    width: "100%",
    background: "transparent",
    border: "none",
    color: "rgba(167,139,250,0.5)",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "Georgia, serif",
    marginTop: "10px",
    padding: "6px",
    textDecoration: "underline",
  },
  sponsorNote: {
    fontSize: "11px",
    color: "rgba(212,175,55,0.5)",
    textAlign: "center" as const,
    marginTop: "12px",
    lineHeight: 1.5,
    fontStyle: "italic" as const,
  },
  footer: {
    height: "4px",
    background: "linear-gradient(90deg, transparent, #D4AF37, #F5D060, #D4AF37, transparent)",
  },
};

function ProspectRegistrationGate({
  sponsorRef,
  sponsorName,
  onComplete,
}: ProspectRegistrationGateProps) {
  const [name, setName]         = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [step, setStep]         = useState<"register" | "done">("register");

  // Inject keyframes
  useEffect(() => {
    const id = "prospect-gate-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1);   }
          25%     { transform: scale(1.25);}
          50%     { transform: scale(1);   }
          75%     { transform: scale(1.12);}
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const validate = () => {
    if (!name.trim())          return "Please enter your full name.";
    if (!whatsapp.trim())      return "Please enter your WhatsApp number.";
    if (!email.trim())         return "Please enter your email address.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");

    try {
      // ── Step 1: Create Supabase auth account ─────────────────
      // Use a temporary password — they can set it later from dashboard
      const tempPassword = `Z2B${Math.random().toString(36).slice(2, 10).toUpperCase()}!`;

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: tempPassword,
        options: {
          data: {
            full_name:   name.trim(),
            whatsapp:    whatsapp.trim(),
            referred_by: sponsorRef || null,
          },
        },
      });

      // If email already registered — sign them in
      if (signUpError?.message?.includes("already registered")) {
        await supabase.auth.signInWithPassword({
          email:    email.trim().toLowerCase(),
          password: tempPassword,
        });
        // Still update profile with sponsor if missing
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            full_name: name.trim(),
            whatsapp:  whatsapp.trim(),
          }).eq("id", user.id).is("referred_by", null); // only if no sponsor yet
        }
        setStep("done");
        setTimeout(onComplete, 1200);
        return;
      }

      if (signUpError) throw signUpError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Account creation failed — please try again.");

      // ── Step 2: Write to profiles — lock sponsor permanently ──
      await supabase.from("profiles").upsert({
        id:               userId,
        full_name:        name.trim(),
        email:            email.trim().toLowerCase(),
        whatsapp:         whatsapp.trim(),
        referred_by:      sponsorRef || null,   // PERMANENT SPONSOR LOCK
        profile_complete: false,
        is_paid_member:   false,
        user_role:        "fam",
        paid_tier:        "fam",
      }, { onConflict: "id" });

      // ── Step 3: Add to builder's funnel_prospects pipeline ────
      if (sponsorRef) {
        // Resolve builder_id from referral code
        const { data: builderData } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", sponsorRef)
          .single();

        if (builderData?.id) {
          // Add to funnel pipeline — stage Day1
          await supabase.from("funnel_prospects").upsert({
            builder_id:       builderData.id,
            full_name:        name.trim(),
            whatsapp:         whatsapp.trim(),
            email:            email.trim().toLowerCase(),
            signup_date:      new Date().toISOString(),
            stage:            "day1",
            prospect_user_id: userId,   // links back to their profile
          }, { onConflict: "prospect_user_id" });

          // Also log in prospect_notifications so builder sees it
          await supabase.from("prospect_notifications").insert({
            builder_id:        builderData.id,
            builder_ref:       sponsorRef,
            prospect_name:     name.trim(),
            prospect_whatsapp: whatsapp.trim(),
            prospect_email:    email.trim().toLowerCase(),
            section_id:        1,
            section_title:     "Workshop Registration",
            status:            "new",
            read:              false,
            message:           `${name.trim()} just registered for the free workshop via your referral link.`,
          });
        }
      }

      setStep("done");
      setTimeout(onComplete, 1500);

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.message || "Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Allow skipping — but warn sponsor won't be credited
  const handleSkip = () => {
    onComplete();
  };

  const firstName = sponsorName ? sponsorName.split(" ")[0] : "your builder";

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* Gold top bar */}
        <div style={S.goldBar} />

        {/* Header */}
        <div style={S.header}>
          <span style={S.hearts}>❤️ ❤️</span>
          <h1 style={S.title}>Welcome to Abundance</h1>
          <p style={S.subtitle}>
            {sponsorName
              ? `${firstName} has personally invited you to start your Entrepreneurial Consumer journey.`
              : "You have been invited to start your Entrepreneurial Consumer journey."}
          </p>
        </div>

        {/* Sponsor box */}
        {sponsorName && (
          <div style={S.inviteBox}>
            <p style={S.inviteLabel}>Personally invited by</p>
            <p style={S.builderName}>🏆 {sponsorName}</p>
            <p style={S.inviteSub}>
              Your sponsor will be permanently credited when you upgrade. This link is yours.
            </p>
          </div>
        )}

        <div style={S.divider} />

        {/* Free tier pills */}
        <div style={{ padding: "0 28px" }}>
          <div style={S.freeTag}>
            <div style={S.pill("#6EE7B7")}>
              ✅ FREE<br />18 Sessions
            </div>
            <div style={S.pill("#F5D060")}>
              🔑 R480 Once-Off<br />All 99 Sessions
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={S.body}>

          {step === "register" && (
            <>
              {error && <div style={S.error}>{error}</div>}

              {/* Name */}
              <div style={S.formGroup}>
                <label style={S.formLabel}>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thabo Nkosi"
                  style={S.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.7)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  disabled={loading}
                />
              </div>

              {/* WhatsApp */}
              <div style={S.formGroup}>
                <label style={S.formLabel}>WhatsApp Number *</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 0821234567"
                  style={S.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.7)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div style={S.formGroup}>
                <label style={S.formLabel}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. thabo@email.com"
                  style={S.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.7)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  disabled={loading}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRegister(); }}
                />
              </div>

              {/* CTA Button */}
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  ...S.btn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <span style={{
                      width: "18px", height: "18px",
                      border: "2px solid rgba(245,208,96,0.3)",
                      borderTop: "2px solid #F5D060",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }} />
                    Creating your account...
                  </span>
                ) : (
                  "🎓 Start My Free Workshop"
                )}
              </button>

              {/* Skip option */}
              {!sponsorRef && (
                <button style={S.skipBtn} onClick={handleSkip}>
                  Continue without registering
                </button>
              )}

              {/* Sponsor credit note */}
              {sponsorName && (
                <p style={S.sponsorNote}>
                  🔒 {firstName}'s referral link will be permanently locked to your account.
                  Even if you upgrade months from now, they will be credited.
                </p>
              )}
            </>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "12px" }}>🎉</div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#F5D060", margin: "0 0 8px" }}>
                You're in!
              </p>
              <p style={{ fontSize: "14px", color: "#DDD6FE", lineHeight: 1.6 }}>
                {sponsorName
                  ? `${firstName} has been notified. Starting your workshop now...`
                  : "Your account is ready. Starting your workshop now..."}
              </p>
              <div style={{
                marginTop: "16px",
                width: "40px", height: "40px",
                border: "3px solid rgba(212,175,55,0.2)",
                borderTop: "3px solid #D4AF37",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "16px auto 0",
              }} />
            </div>
          )}

        </div>

        {/* Gold bottom bar */}
        <div style={S.footer} />

      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
// TYPES
// ============================================================
type ViewType = "home" | "workshop" | "section" | "paywall" | "results";

interface Question {
  q: string;
  options: string[];
  answer: number;
}

interface Section {
  id: number;
  free: boolean;
  title: string;
  subtitle: string;
  content: string;
  activity: string;
  questions: Question[];
}

interface SectionProgress {
  read: boolean;
  answers: Record<number, number>;
  activityDone: boolean;
  completed: boolean;
  score: number | null;
}

type ProgressMap = Record<number, SectionProgress>;

interface HomeViewProps {
  setView: (v: ViewType) => void;
  completedCount: number;
  freeCompleted: number;
}

interface PaywallViewProps {
  setView: (v: ViewType) => void;
}

interface Tier {
  name: string;
  price: string;
  desc: string;
  color: string;
  bg: string;
  cta: string;
}

// ============================================================
// MORNING SESSIONS — 9 EC DAILY BRIEFINGS (Audio Only)
// ============================================================
interface MorningSession {
  id: number;
  title: string;
  subtitle: string;
  content: string;
}

const MORNING_SESSIONS: MorningSession[] = [
  {
    id: 1,
    title: "Who You Are and Why You Are Here",
    subtitle: "Your identity is the foundation of everything you will build",
    content: `Good morning, Legacy Builder.

Before you step into your day — take 60 seconds to remember who you are and why you are here.

You are not just an employee. You are not just a consumer. You are an Entrepreneurial Consumer — someone who has chosen the third path. Someone who has decided to stop being a passive participant in the economy and start building equity while still employed.

This was not an accident. You found Z2B because something inside you already knew that the old formula — work hard, get paid, spend, repeat — was not enough. That knowing is the first sign of a builder's mindset.

You are here because you believe in Mindset, Systems, Relationships and Legacy. The four legs of your table. You may not have all four strong yet — but you are building. And that is what matters.

Every morning this week, these sessions will give you a 60-second mental anchor before the noise of the day begins. A reminder of who you are becoming.

Today's anchor: I am an Entrepreneurial Consumer. I am building while I am employed. I am participating in value creation. I have a seat at the table.

Carry that with you today. Now go and build. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 2,
    title: "The Mindset Shift — From Employee to Builder",
    subtitle: "The most important upgrade you will ever make happens in your mind",
    content: `Good morning, Legacy Builder.

The most important upgrade you will ever make does not happen on a pricing page. It does not happen in your bank account. It happens in your mind.

For most of your life, you were trained to think like an employee. Show up. Do the work. Get paid. Be grateful. Wait for the promotion. Save if you can. Repeat until retirement.

This is not a criticism of hard work. Hard work is honourable. But hard work inside an employee mindset will always hit a ceiling. Not because of your effort — but because of the structure.

The builder's mindset is different. A builder asks different questions. Not "how do I earn more?" but "how do I build a system that earns?" Not "who will give me a chance?" but "who can I serve and partner with?" Not "when will things get better?" but "what can I build today?"

The shift from employee thinking to builder thinking is not a one-time event. It is a daily practice. This is why we start the morning here — before the emails, before the commute, before the demands of the day. To reset the lens through which you see your life.

Today's anchor: I am not just an employee — I am a builder in progress. Every decision I make today is a brick in my table.

Go build. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 3,
    title: "Understanding the Income Model",
    subtitle: "How value flows — and how to position yourself in the flow",
    content: `Good morning, Legacy Builder.

Most people think about income in one direction — from employer to employee. Work is done. Money is received. That is the only flow most people ever experience.

But value in the economy does not only flow in one direction. It flows through networks. It flows through referrals. It flows through relationships. It flows through systems.

The Z2B income model is built on this truth. When you share knowledge — value flows. When someone joins through you — value flows. When they build their own table — value flows deeper. Through TSC commissions across generations. Through QPB bonuses for consistent growth. Through the marketplace. Through CEO competitions and awards.

You are not just earning a commission. You are positioning yourself inside a value chain. And the further you build that chain — the more value returns to you, even when you are not actively working.

This morning, think about the people in your life. The employees who are frustrated. The consumers who are spending without building. Each one is a potential node in your value chain — if you share the invitation.

Today's anchor: I am not selling. I am positioning. I am inviting others into a value chain that benefits everyone who enters it.

Go and invite someone today. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 4,
    title: "Building Your First System",
    subtitle: "Systems work while you sleep — start with one",
    content: `Good morning, Legacy Builder.

A salary requires your presence. A system does not.

This is the fundamental difference between being employed and being an Entrepreneurial Consumer. Your employer pays you for your time. A system pays you for the value it delivers — whether you are awake, asleep, at church, or on holiday.

Your first system in Z2B is simple: your referral link. That link — shared consistently through your content, your conversations, your WhatsApp status — works 24 hours a day. Every time someone clicks it and registers, your funnel activates. The 9-day email sequence begins. The pipeline tracks their journey. The WhatsApp Launcher reminds you when to reach out.

You do not have to be everywhere all the time. You build the system once. The system runs. And as your team grows, they each build their own systems — and your TSC commissions deepen automatically.

This is not passive income in the naive sense. It is leveraged income. You still work — but your work multiplies because it is plugged into a system.

Today's anchor: I am building a system today, not just completing tasks. Every post I make, every person I invite, every prospect I follow up — is adding leverage to my life.

Go build leverage. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 5,
    title: "Growing Your Relationships Intentionally",
    subtitle: "Your network is your net worth — but only if you tend it",
    content: `Good morning, Legacy Builder.

Your most undervalued asset is not your salary. It is not your savings. It is your relationships.

Every person in your life — your colleagues, your church family, your neighbours, your WhatsApp contacts, your social media followers — is a potential member of your table. Not to be exploited. But to be invited. There is a difference.

Exploitation takes. Invitation gives. When you share Z2B, you are not taking from people — you are offering them a third path they may never have heard of before. The path of the Entrepreneurial Consumer. The path from consumption to ownership. The path from someone else's table to their own.

Intentional relationship building means you do not wait for opportunities to appear. You create them. You show up. You add value before you make any invitation. You listen before you speak. You build trust before you ask for action.

The Purple Cow principle applies here — you do not chase people. You become so remarkable in how you show up that people are drawn to ask what you are doing. That curiosity becomes your invitation.

Today's anchor: I will add value to at least one relationship today before I make any invitation. I am building a community, not just a commission structure.

Go tend your table. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 6,
    title: "The Legacy Mission and Long-Term Vision",
    subtitle: "What you are building is bigger than this month's commission",
    content: `Good morning, Legacy Builder.

Legacy is not a word we use lightly at Z2B. It is the fourth leg of your table — and arguably the most important.

Short-term thinking builds income. Long-term thinking builds legacy. The difference is not just time — it is meaning.

When you think about your legacy, you are thinking about what remains after you. The financial foundation your children inherit. The mindset you model for your community. The businesses you helped launch. The employees you helped graduate into Entrepreneurial Consumers. The table you set — and who got to sit at it.

This vision is what sustains you on the days when the system is slow. When prospects do not convert. When the content gets no engagement. When doubt whispers that this is not working.

On those days, come back to the legacy. Come back to the why that is bigger than this month's commission. Come back to the faces of the people who need what you are building — even if they do not know it yet.

Z2B is not a side hustle. It is a Kingdom assignment. Every Bronze member you bring in is an ordinary person choosing an extraordinary path. Your legacy is measured in lives redirected, not rands collected.

Today's anchor: I am not building for this month. I am building for the next generation. My table has seats for people who are not yet at it.

Go build with vision. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 7,
    title: "The Entrepreneurial Consumer Identity",
    subtitle: "Stepping fully into who you are becoming",
    content: `Good morning, Legacy Builder.

Identity precedes action. What you believe about yourself determines what you attempt, what you tolerate, and what you build.

For most people, the deepest identity is still employee. Even when they are building Z2B on the side, there is a quiet inner voice that says — but I am really just an employee who is trying something. This identity keeps them playing small. Posting inconsistently. Giving up too early.

Today we name it and replace it.

You are an Entrepreneurial Consumer. This is not a title you will earn one day when you reach a certain income level. It is who you are right now — by decision, not by achievement. You made the decision to stop being passive. You made the decision to participate in value creation. You made the decision to build while employed.

That decision changed your identity. The income is following. The team is growing. The legacy is forming. But the identity shifted the moment you said yes to the third path.

Speak it today. Tell someone who you are. Not to impress them — to reinforce it in yourself. Identity is strengthened through declaration.

Today's anchor: I am an Entrepreneurial Consumer. I say it. I mean it. I build from it.

Declare it today. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 8,
    title: "Your Table in the Community",
    subtitle: "Building is not a solo sport — your community is your acceleration",
    content: `Good morning, Legacy Builder.

No table stands in isolation. A banquet requires guests. A community of builders multiplies what any single builder could do alone.

This is why the Z2B community matters beyond strategy. Yes, your team generates TSC commissions. Yes, your downline expands your reach. But the deepest value of community is not financial — it is motivational.

When you are in a community of people who see what you see — who understand the third path, who believe in Entrepreneurial Consumerism, who are building their four table legs alongside you — your belief is reinforced daily. You do not have to explain yourself to everyone around you. You belong somewhere that gets it.

This is why your Corporate WhatsApp Group matters. This is why your sponsor relationship matters. This is why the leaderboard matters. This is why celebrating team wins matters. You are not just building income — you are building belonging.

And the people you invite into Z2B are not just prospects. They are future table companions. You are not recruiting — you are gathering. There is a difference in the energy you bring to every invitation when you see it this way.

Today's anchor: I am gathering people for a banquet, not recruiting for a downline. Every person I invite, I am welcoming to a table.

Go gather your guests. Hallelujah! Let's get busy with it!`,
  },
  {
    id: 9,
    title: "Your First Step — From Learning to Doing",
    subtitle: "The bridge between the morning and the evening sessions",
    content: `Good morning, Legacy Builder.

You have spent 8 mornings anchoring your identity, your mindset, your vision and your community. Now it is time to bridge what you know with what you do.

The Evening Sessions — Sessions 1 through 9 — are your practical foundation. They go deeper. They challenge your thinking with comprehension questions, mirror moments and daily activities. They build the intellectual and strategic framework that the morning briefings have been preparing you for.

But knowledge without action is just inspiration. And inspiration without implementation is just a feeling.

Today's morning session is a bridge. Before you enter the Evening Sessions, ask yourself three questions:

One — What have the morning sessions revealed about how I see myself?

Two — What belief about employment or entrepreneurship am I ready to let go of?

Three — What is the one action I will take this week because of what I have learned?

Write your answers down. Not on your phone — on paper. The physical act of writing reinforces commitment in a way that typing does not.

Then open Evening Session 1. And begin. Not someday. Today.

The table is built one session at a time. One morning briefing at a time. One conversation at a time. One decision at a time.

Today's anchor: I am not just learning. I am becoming. The doing begins today.

Go begin. Hallelujah! Let's get busy with it!`,
  },
];

// ============================================================
// WORKSHOP DATA — 99 SECTIONS
// ============================================================
const SECTIONS: Section[] = [
  // ---- FREE TIER: SECTIONS 1–9 ----
  {
    id: 1, free: true,
    title: "The Silent Frustration of Employees",
    subtitle: "Understanding the System You Were Never Told About",
    content: `[[PERSONAL_OPENING]]

Most employees are not failing. They are surviving inside a system that was never designed for ownership.

Every month follows the same rhythm. You wake up early. You commute. You give your best hours to work. You get paid. And before the next paycheck arrives, most of it is already gone — rent, transport, food, school fees, electricity, data, insurance.

What remains is often not peace — it's pressure. Not because you are reckless. Not because you lack discipline. But because the cost of living keeps rising while income crawls forward.

Yet this struggle is rarely spoken about openly. Employees are expected to be grateful. To "manage better." To "budget smarter." To "be patient." So many suffer in silence, smiling at work while privately wondering: "Is this really it?"

**Hard Work Is No Longer the Problem.** Most employees were raised to believe one simple formula: Work hard → get educated → get a job → live well. For decades, this formula worked. But today, something has shifted. Hard work still exists — but rewards have thinned. Education still matters — but it no longer guarantees freedom. Jobs still provide income — but rarely ownership.

The issue is not effort. The issue is structure. Employees are trapped in a time-for-money model where income has a ceiling, but expenses do not. Inflation has no loyalty. Emergencies do not wait for promotions.

**You Are Not Broken — You Are Mispositioned.** If you are an employee feeling uneasy, hear this clearly: You are not lazy. You are not incapable. You are not late. You have simply been positioned only as a worker and a consumer — not as a participant in value creation.

**The Permission You Were Never Given.** Nobody sat you down at school and said — you are allowed to own things. You are allowed to build things. You are allowed to participate in the economy as more than a spender and a worker. That permission was withheld — not maliciously, but systematically. The Z2B Table Banquet is not just an opportunity. It is the permission that was always yours to claim.

[[MIRROR_MOMENT]]`,
    activity: "Write down your three biggest monthly expenses and next to each one, ask: 'Could this ever flow value back to me?' Don't answer yet — just sit with the question.",
    questions: [
      { q: "What is the PRIMARY reason most employees struggle financially?", options: ["They spend irresponsibly", "They lack education", "They are trapped in a time-for-money structure", "They don't work hard enough"], answer: 2 },
      { q: "The formula 'Work hard → get educated → get a job → live well' is described as:", options: ["Still perfectly effective today", "A formula that once worked but has shifted", "A myth that never worked", "The foundation of wealth building"], answer: 1 },
      { q: "Complete: 'You are not broken — you are ______.'", options: ["Unmotivated", "Mispositioned", "Uneducated", "Unlucky"], answer: 1 },
      { q: "What creates a 'quiet fear' in most employees?", options: ["Fear of their boss", "Fear of missing one paycheck", "Fear of competition", "Fear of technology"], answer: 1 },
      { q: "Debt in the employee's life becomes:", options: ["A strategic investment tool", "A survival tool instead of a strategic instrument", "Something to be avoided entirely", "A sign of poor character"], answer: 1 },
    ],
  },
  {
    id: 2, free: true,
    title: "Consumption Without Leverage",
    subtitle: "Why You Power the Economy but Don't Benefit From It",
    content: `Here is a truth few people explain clearly: Employees are powerful consumers — but powerless owners.

Every month, employees spend money. They support brands. They sustain companies. They keep entire industries alive. But most never benefit from the value they help create. Consumption flows outward — never back.

Employees are loyal customers to supermarkets, telecom companies, transport systems, financial institutions, and household brands. Yet none of these reward them for their loyalty beyond discounts and points.

**The problem is not consumption itself. The problem is consumption without leverage.**

No ownership. No participation. No upside. This is where frustration quietly turns into resignation. People stop dreaming big — not because they lack ambition, but because ambition feels dangerous when responsibility is heavy.

**The Myth of "Just Quit and Start a Business."** In recent years, a new pressure has emerged. Social media glorifies quitting jobs. "Escape the 9–5." "Be your own boss." "Hustle harder."

But for most employees, this advice feels reckless. They have families to support. Bills to pay. Reputations to protect. Limited time and energy. Quitting without preparation is not courageous — it is risky.

That's why many employees feel stuck between two unsatisfying options: stay employed and frustrated, or quit and gamble on uncertainty. This false choice creates paralysis.

**What is rarely offered is a third option** — one that respects reality while expanding possibility. A way that does not require quitting your job. Does not demand a business idea upfront. Does not pressure you to take reckless risks. Instead, it begins with clarity, community, and intentional consumption.

**The Good News Hidden in the Problem.** The fact that you consume consistently every month is not a weakness — it is an asset waiting to be repositioned. The same loyalty you give to supermarkets, telecoms and fuel stations can be redirected into a system that flows value back to you. You do not need to change how much you spend. You need to change where the value of that spending goes. That is the shift Z2B is built on.

[[MONTH_CHECK]]`,
    activity: "List 5 brands or companies you spend money with every month. Next to each one, write: 'Do I participate in their profits in any way?' This exercise plants the seed of strategic awareness.",
    questions: [
      { q: "Employees are described as 'powerful ______ but powerless owners':", options: ["Workers", "Consumers", "Investors", "Entrepreneurs"], answer: 1 },
      { q: "What is the core problem with the way most employees consume?", options: ["They buy too many luxury items", "Consumption without leverage — no ownership or upside", "They don't save enough", "They trust brands too much"], answer: 1 },
      { q: "The 'third option' being proposed is:", options: ["Start a business immediately", "Quit your job and freelance", "A path that respects reality while expanding possibility", "Invest in the stock market"], answer: 2 },
      { q: "Why does social media advice to 'quit' feel reckless to most employees?", options: ["They are lazy", "They have families, bills, and limited time", "Entrepreneurship is too difficult", "It always leads to failure"], answer: 1 },
      { q: "Ambition feels dangerous to employees because:", options: ["Their employers discourage it", "Responsibility is heavy and the system doesn't support ownership", "They lack intelligence", "Dreams are impractical"], answer: 1 },
    ],
  },
  {
    id: 3, free: true,
    title: "The Three Identities in the Marketplace",
    subtitle: "Discovering the Identity You Were Never Taught",
    content: `Most people believe there are only two financial identities available: Consumers, who earn and spend; and Entrepreneurs, who take risks and build businesses.

If you are an employee, this creates an invisible wall. On one side is safety without freedom. On the other is freedom without certainty.

**The Three Marketplace Identities:**

**1. The Consumer** — Earns income. Spends on necessities and lifestyle. Has no ownership in the value created. Depends on salary increases for growth. Consumption is the end of the journey.

**2. The Entrepreneur** — Creates products or services. Takes significant financial and emotional risk. Operates under uncertainty. Builds systems, teams, and structures. Ownership is the starting point — but the pressure is high.

**3. The Entrepreneurial Consumer (The Missing Identity)** — Earns income (often as an employee). Consumes intentionally and strategically. Buys where they are allowed to participate in value creation. Builds ownership gradually, without rushing to quit employment. They don't resign to run away from work — they graduate to ownership.

Consumption becomes a tool, not a weakness. Household expenses are turned into Income Generating Assets.

**Entrepreneurial consumers do not rush to "start businesses."** They start by asking better questions: What do I already spend money on every month? Who else around me spends on the same things? Is there a way to redirect this flow so value comes back to me?

This is not about inventing something new. It is about repositioning what already exists.

**The Identity You Carry Changes Everything Around You.** When you shift from Consumer to Entrepreneurial Consumer, the people around you begin to look different too. Your colleague stops being just a co-worker — they become a potential table companion. Your friend who always complains about month-end stops being a frustrated bystander — they become someone you can invite to a different path. Identity is not just internal. It reshapes how you see your entire world and everyone in it.

[[IDENTITY_SELECTOR]]`,
    activity: "Identify which of the three identities describes you TODAY. Be honest. Write it down. Then write which identity you want to grow INTO over the next 12 months. The gap between those two is your workshop journey.",
    questions: [
      { q: "What is the 'missing identity' this section introduces?", options: ["The Investor", "The Freelancer", "The Entrepreneurial Consumer", "The Side Hustler"], answer: 2 },
      { q: "How does the Entrepreneurial Consumer differ from a regular Consumer?", options: ["They earn more salary", "They consume intentionally and participate in value creation", "They own multiple businesses", "They never spend on necessities"], answer: 1 },
      { q: "Complete: 'Household expenses are turned into ______'", options: ["Savings accounts", "Income Generating Assets", "Business capital", "Investment funds"], answer: 1 },
      { q: "The Entrepreneurial Consumer graduates to ownership by:", options: ["Immediately quitting their job", "Taking massive financial risks", "Building ownership gradually without disrupting employment", "Starting multiple businesses at once"], answer: 2 },
      { q: "Entrepreneurial consumption is about:", options: ["Inventing new products", "Repositioning what already exists", "Copying successful businesses", "Avoiding all consumption"], answer: 1 },
    ],
  },
  {
    id: 4, free: true,
    title: "Why Employees Already Have Assets",
    subtitle: "Recognising the Capital You Have Been Ignoring",
    content: `Employees already have assets — even if they've never seen them that way.

They have: Monthly Salary (predictable cash flow), Stable routines (discipline and consistency), Predictable consumption (known spending patterns), Existing networks (colleagues, family, community), Daily exposure to systems and operations.

These are not small things. In community-based business models, these assets compound.

**Identity Comes Before Opportunity.** Most people fail not because they choose the wrong opportunity — but because they never shift identity. They join programs as consumers. They evaluate everything by short-term comfort. They quit when results are slow.

The Entrepreneurial Consumer thinks differently. They ask: What am I becoming through this process? What skills am I developing? How does this position me long-term?

This identity shift is what makes everything else work. Before income. Before business models. Before systems.

**Entrepreneurial consumption works because it:** Respects limited time. Reduces financial risk. Allows gradual confidence-building. Rewards consistency, not hype. Instead of forcing employees to become full-time entrepreneurs overnight, this model allows them to grow into ownership.

No quitting. No gambling. No pretending. Just structured progress.

Once you see yourself differently, you begin to notice opportunities that were always around you — quietly waiting for clarity. You do not need a business idea to move forward. You need a new way of seeing yourself in the economy.

**The Most Underestimated Asset of All — Your Story.** Every frustration you have lived through as an employee is not wasted material. It is your most powerful marketing tool. When you tell someone — honestly and simply — what it felt like to work hard and still feel stuck, and then show them the third path you found, that story resonates in a way no sales script ever could. Your lived experience is your credibility. Your journey is your invitation. Never underestimate the power of a story told from genuine transformation.

[[ASSET_AUDIT]]`,
    activity: "Make a list under these headings: MY SKILLS, MY NETWORKS, MY ROUTINES, MY KNOWLEDGE. Fill in at least 3 items under each. You are mapping your existing capital.",
    questions: [
      { q: "Which is listed as an existing asset most employees overlook?", options: ["Luxury investments", "Predictable consumption patterns and existing networks", "Business ownership experience", "Advanced technical skills"], answer: 1 },
      { q: "Why do most people fail to capitalise on opportunities?", options: ["Lack of money", "Never shifting their identity", "Poor education", "Bad timing"], answer: 1 },
      { q: "The Entrepreneurial Consumer model rewards:", options: ["Hype and bold moves", "Consistency, not hype", "Fast risk-taking", "Quitting employment quickly"], answer: 1 },
      { q: "What must come BEFORE income, business models, and systems?", options: ["A business plan", "A large network", "An identity shift", "Capital investment"], answer: 2 },
      { q: "Your current life contains:", options: ["Too many obstacles", "The raw material for something more", "Nothing of entrepreneurial value", "Only consumer habits"], answer: 1 },
    ],
  },
  {
    id: 5, free: true,
    title: "The Z2B TABLE Philosophy — Community Before Commerce",
    subtitle: "Why You Need a Table Before You Need a Business",
    content: `Wealth has always been built at tables. Long before wealth was measured in numbers, it was measured in access. Access to conversations. Access to relationships. Access to shared resources.

Tables are where plans are discussed, trust is built, partnerships are formed, and futures are negotiated. No one builds anything meaningful alone.

**Why Community Must Come Before Commerce.** Most opportunities today start with a product: "Sell this." "Promote that." "Recruit people." Community is treated as a by-product. Z2B reverses this order.

At the Z2B TABLE: People come before products. Education comes before execution. Trust comes before transactions.

Commerce is powerful — but without community, it becomes extractive. Community creates belonging before buying, understanding before selling, alignment before scaling.

**T.E.E.E — The Operating Philosophy:**
Transform — how members think about money, work, and ownership.
Educate — how members learn systems, skills, and strategy.
Empower — how members apply knowledge confidently.
Enrich — how value flows back to individuals, families, and communities.

This is not a slogan. It is a sequence. Transformation without education creates confusion. Education without empowerment creates frustration. Empowerment without enrichment creates burnout.

**Why the Table Creates Leverage.** A single consumer has no negotiating power. But a community of aligned Entrepreneurial Consumers creates collective leverage — a distribution channel, a marketing ecosystem, a negotiation partner.

**Why the Z2B Table Is Different From a Group Chat.** Many people have been part of groups, teams and communities before — and been disappointed. The difference with the Z2B Table is sequencing. Most communities form around shared excitement and fall apart when excitement fades. The Z2B Table forms around shared transformation. When people are growing together — mindset by mindset, session by session — the bond is not emotional hype. It is built on the bedrock of mutual investment in becoming. That kind of community does not dissolve. It deepens.

[[COMMUNITY_PREVIEW]]`,
    activity: "Think of one person in your life who is quietly frustrated with their financial situation but hasn't found a way forward. Don't contact them yet — just identify them. You may be about to invite them to your table.",
    questions: [
      { q: "In the Z2B philosophy, what comes BEFORE commerce?", options: ["Products", "Sales systems", "Community", "Marketing"], answer: 2 },
      { q: "What does T.E.E.E stand for?", options: ["Train, Execute, Earn, Expand", "Transform, Educate, Empower, Enrich", "Think, Engage, Earn, Establish", "Transform, Enable, Execute, Earn"], answer: 1 },
      { q: "Education without empowerment creates:", options: ["Burnout", "Confusion", "Frustration", "Growth"], answer: 2 },
      { q: "A community of aligned Entrepreneurial Consumers creates:", options: ["Individual wealth only", "Collective leverage", "Competition among members", "Dependency on leaders"], answer: 1 },
      { q: "The Z2B TABLE is a place you:", options: ["Visit once to get information", "Grow into over time", "Join only when you have money", "Use only for selling"], answer: 1 },
    ],
  },
  {
    id: 6, free: true,
    title: "Vision Before Execution — Milestone 1",
    subtitle: "Why Clarity Is the Most Valuable Asset You Can Build",
    content: `Most people approach income the same way they approach emergencies — reactively. They ask: What business can I start quickly? What opportunity pays fast? What can fix my situation now?

This urgency is understandable. But it is also why many fail repeatedly. Execution without clarity leads to burnout, confusion, jumping from one opportunity to another, and blaming systems instead of positioning.

**Z2B begins differently. Before tools. Before companies. Before income streams. We begin with vision.**

Not vague dreams — structured vision.

**The Three Levels of Vision:**

**Immediate Term — Stabilization:** Addresses pressure. Daily survival, cost of living, reducing financial stress. Extra income to cover essentials. Avoiding cash loans. Breathing room at month-end. This is not greed — it is dignity.

**Medium Term — Freedom:** Once pressure is reduced, perspective returns. Financial flexibility, time ownership, family goals. Housing, reliable transport, education funding, savings. Income stops being reactive — it becomes intentional.

**Long Term — Legacy:** Shifts thinking beyond self. Assets, ownership, generational impact. Properties, businesses, land, structures that outlive effort. Legacy thinking changes behavior today — even if results come later.

**The Five Foundational Questions:** Why. What. When. How. Where. These questions, asked correctly across all three time horizons, change everything. Most systems fail because they treat everyone the same regardless of urgency or stage. Z2B does not.

**Vision Is Not a Luxury — It Is a Survival Tool.** In difficult economic times, many people abandon dreaming because it feels irresponsible. "I cannot afford to think about the future — I am managing today." But the opposite is true. Without vision, every difficulty feels permanent. Every slow month feels like failure. Every challenge confirms the fear that this will never work. Vision does not ignore difficulty — it contextualises it. It gives you a reason to keep building on the hard days when results are not yet visible.

[[VISION_GATE]]`,
    activity: "Write one goal under each of the three time horizons: Immediate Term (next 90 days), Medium Term (1–3 years), Long Term (5–10 years). Don't overthink it. Your first answer is often your truest answer.",
    questions: [
      { q: "What does Z2B prioritise BEFORE tools, companies, and income streams?", options: ["Networking", "Vision", "Capital", "Skills training"], answer: 1 },
      { q: "Immediate Term vision focuses on:", options: ["Legacy and generational wealth", "Stabilization and reducing financial stress", "Building a business empire", "Retiring early"], answer: 1 },
      { q: "Medium Term vision is characterised by:", options: ["Survival and emergency management", "Financial flexibility and time ownership", "Platform ownership", "Building a team"], answer: 1 },
      { q: "Legacy thinking is important because:", options: ["It makes you feel better temporarily", "It changes behavior today even if results come later", "It replaces the need for immediate action", "It only applies to wealthy people"], answer: 1 },
      { q: "Complete: 'Execution without clarity leads to ______'", options: ["Slow growth", "Burnout, confusion and jumping between opportunities", "Steady progress", "Financial discipline"], answer: 1 },
    ],
  },
  {
    id: 7, free: true,
    title: "From SWOT to Opportunity",
    subtitle: "Turning Your Reality Into Your Strategy",
    content: `Most people believe opportunities come from ideas. In reality, opportunities come from awareness. Ideas feel heavy because they are imagined from pressure. Awareness feels light because it reveals what already exists.

That is why Z2B uses SWOT analysis — not as a business-school exercise, but as a mirror. A mirror does not judge. It simply shows you where you stand. Once you see clearly, direction becomes obvious.

**Strengths You've Been Overlooking.** Many employees underestimate their strengths because they see them as "normal." But normal to you can be valuable to others. Strengths include: Consistency, Reliability, Communication skills, Exposure to systems, Experience in specific environments. What matters is not how impressive a strength looks — but how usable it is.

**Weaknesses as Signals, Not Disqualifiers.** Weaknesses are not verdicts — they are signals. They point to: skills to learn, systems to leverage, people to partner with. In a community, no one needs to be complete. One person's weakness becomes another's contribution.

**Opportunities Hidden in Plain Sight.** Opportunities hide inside repeated expenses, shared frustrations, unmet needs, and underutilized networks. When SWOT is applied across all three time horizons, patterns emerge.

**Threats as Teachers.** Threats reveal what must be protected, what must be diversified, and why reliance on a single income is risky. Z2B does not promise immunity from challenges — it provides options. And options reduce fear.

**Your SWOT Is Not Static — It Grows With You.** The SWOT you do today is a snapshot, not a sentence. Twelve months from now, after completing this workshop, building your team, running your funnel and developing your skills — your strengths will be different, your weaknesses will be fewer, your opportunities will be larger, and your threats will be better managed. The purpose of the Reality Audit is not to define your limits. It is to show you your starting point so that you can measure your progress. You are not being evaluated. You are being positioned.

[[SWOT_BUILDER]]`,
    activity: "Draw a simple 2x2 grid on paper. Label the four boxes: STRENGTHS, WEAKNESSES, OPPORTUNITIES, THREATS. Fill in at least 3 items in each box as they relate to YOUR current financial and life situation.",
    questions: [
      { q: "In Z2B, SWOT analysis is used as:", options: ["A corporate planning tool only", "A personal mirror to reveal where you stand", "A way to compare yourself to competitors", "A recruitment screening process"], answer: 1 },
      { q: "Weaknesses should be treated as:", options: ["Reasons to quit", "Signals pointing to skills to learn and people to partner with", "Permanent limitations", "Secrets to hide from others"], answer: 1 },
      { q: "Where do opportunities often hide?", options: ["In expensive business courses", "In repeated expenses, shared frustrations, and underutilised networks", "Only in big cities", "In government programs"], answer: 1 },
      { q: "Threats in your SWOT are valuable because they:", options: ["Should be ignored", "Teach you what must be protected and diversified", "Prove the system is unfair", "Show you are not ready"], answer: 1 },
      { q: "Opportunities come primarily from:", options: ["New ideas", "Large investments", "Awareness of what already exists", "Luck and timing"], answer: 2 },
    ],
  },
  {
    id: 8, free: true,
    title: "Network Marketing — A Vehicle, Not the Destination",
    subtitle: "Understanding the Tool That Can Train You for Ownership",
    content: `Few economic vehicles have been more misunderstood than Network Marketing. Before many people even investigate it, they have already accepted negative conclusions: "It's just selling to friends." "It's a pyramid scheme." "It doesn't work."

These statements are often spoken by people who have never studied the model, never built within it, and never understood its structural genius.

**The truth is far simpler — and more powerful: Network Marketing is a vehicle, not a destination.** A vehicle transports people from one location to another. It does not define their identity. It accelerates movement.

Network Marketing transports employees from: Pure consumption → Strategic consumption. Income dependence → Income diversification. Isolation → Community collaboration. Employment only → Ownership exposure.

**Why Employees Thrive in Network Marketing.** The workplace has already trained them in: Communication, Accountability, Punctuality, Team collaboration, Target execution. These are not small skills — they are commercial infrastructure. You are not starting from zero. You are repurposing existing capacity.

**Household Products as Training Wheels.** Many network marketing companies distribute household necessities. Demand already exists. You are not creating consumption — you are redirecting it. This allows builders to learn in a low-risk environment with familiar products.

**Network Marketing Is Not Your Identity.** You are an Entrepreneurial Consumer first. Network Marketing is one of your tools — not your definition. Identity traps create burnout. Use it. Learn from it. Leverage it. But never mistake the vehicle for the vision.

**The Z2B Vehicle Is Built for the South African Context.** Z2B Legacy Builders was not designed for Silicon Valley or for wealthy investors. It was designed for the employed South African — someone with a salary, a community, a story and a phone. The products are personal development — something every human being needs regardless of income level. The distribution model is relationship-based — something South Africans are culturally wired for. The philosophy is Kingdom Economics — something that resonates in a nation where faith and community are deeply interwoven. This vehicle was built for you, on roads you already know.

[[OBJECTION_DISSOLVER]]`,
    activity: "Research one legitimate network marketing company that distributes products you already buy monthly. Look at their compensation plan for 30 minutes. You don't have to join — just understand the structure. Note what surprised you.",
    questions: [
      { q: "Network Marketing is described as:", options: ["The final goal for entrepreneurs", "A guaranteed path to wealth", "A vehicle that accelerates movement toward ownership", "A replacement for employment"], answer: 2 },
      { q: "Why do employees already have an advantage in Network Marketing?", options: ["They have lots of spare time", "The workplace has already trained them in commercial skills", "They have large savings to invest", "They know many wealthy people"], answer: 1 },
      { q: "Household products in network marketing are 'Training Wheels' because:", options: ["They are easy to sell to strangers", "They allow learning in a low-risk environment with familiar products", "They generate massive profits quickly", "They replace the need for an office"], answer: 1 },
      { q: "What happens when a Builder ties their identity to one company?", options: ["They achieve great success", "Disappointment becomes identity collapse", "They build sustainable income", "Their team grows faster"], answer: 1 },
      { q: "Your true positioning as a Z2B Builder is:", options: ["A Network Marketer", "A product seller", "An Entrepreneurial Consumer first", "A full-time entrepreneur"], answer: 2 },
    ],
  },
  {
    id: 9, free: true,
    title: "Building Your Circle of Twelve",
    subtitle: "Human Capital Is Heaven's First Currency",
    content: `Before God gives a man land, He gives him people. Before He releases territory, He releases relationships. Before He entrusts wealth, He tests stewardship through human connection.

You are not surrounded by employees and consumers by accident. You are surrounded by potential partners in dominion.

**The Z2B TABLE BANQUET reframes your environment.** You stop seeing people as co-workers only. You begin to see them as co-builders, co-learners, co-investors, co-visionaries.

**The Doctrine of the Table.** Tables are places of negotiation, alignment, covenant, strategy, and wealth architecture. "You prepare a table before me in the presence of my enemies." (Psalm 23:5) — God blesses you with provision AND positioning.

**Envision Partnerships Across Three Layers:**

**1. Short-Term Destiny Helpers:** Ready to walk immediately with you. They help you implement, share learning, test ideas, and break fear barriers. They are your ignition partners.

**2. Medium-Term Strategic Builders:** Carry complementary capabilities. Launch structured collaborations, combine skills, execute joint initiatives.

**3. Long-Term Covenant Partners:** Destiny alliances. They may grow with you into business partnerships, investment alliances, property collaborations, legacy ventures.

**The Circle of Twelve.** Identify 12 Builders across these three layers. Why Twelve? Because Twelve represents governmental structure — 12 Tribes of Israel, 12 Disciples, 12 Foundations of New Jerusalem. Twelve is a number of organized expansion.

**The Doctrine of Capital:** Financial Capital is money. Human Capital is skills, wisdom, and networks. Strategic Capital is alignment, positioning, and influence. Your Circle contains all three in seed form.

**What R480 Actually Unlocks.** Before you build your Circle of Twelve, understand what you are inviting them into. Bronze membership — R480 once-off, no monthly fees — activates your referral link, your 18% ISP commission on every Bronze sale you facilitate, your QPB bonus when you bring in four or more builders in a month, and your TSC commissions from your team up to three generations deep. When your Circle of Twelve each upgrades to Bronze and begins building their own circles, the income is not linear — it is exponential. You are not inviting twelve people to spend R480. You are inviting twelve people to activate a system that pays them and pays you simultaneously.

[[CIRCLE_OF_TWELVE]]`,
    activity: "Write down 12 names — people in your life across the three layers: 4 short-term helpers, 4 medium-term builders, 4 long-term covenant partners. Don't filter — just write names. You don't need their permission yet. You just need clarity.",
    questions: [
      { q: "In Kingdom economics, what does God give BEFORE land and territory?", options: ["Money and resources", "Business ideas", "People and relationships", "A vision statement"], answer: 2 },
      { q: "Short-Term Destiny Helpers are described as your:", options: ["Long-term investors", "Ignition partners", "Business competitors", "Mentors only"], answer: 1 },
      { q: "Why is 'Twelve' significant as the number for your Builder Circle?", options: ["It's a popular management number", "It represents governmental structure and organized expansion in scripture", "It fits on one page", "It's the maximum team size"], answer: 1 },
      { q: "Which is considered the LOWEST form of capital?", options: ["Human Capital", "Strategic Capital", "Financial Capital", "Social Capital"], answer: 2 },
      { q: "Long-Term Covenant Partners walk with you in agreement of:", options: ["Only financial returns", "Vision, values, and stewardship", "Profit-sharing formulas", "Marketing strategies"], answer: 1 },
    ],
  },

  // ---- PAID TIER: SECTIONS 10–20 — FULLY WRITTEN ----
  {
    id: 10, free: false,
    title: "Innovators and Early Adopters",
    subtitle: "Claiming Your Purple and Gold Mantle",
    content: `Every movement in history has been shaped by two categories of people: those who arrive first, and those who arrive when it is already obvious. The first category are the Innovators and Early Adopters — the Purple Cow people who see something before the crowd and say yes before it is safe to do so.

You are reading this session because you are already in that category. You did not wait for your entire office to join Z2B before you considered it. You did not need ten testimonials before you entered the workshop. Something in you recognised the signal before the noise of popular opinion confirmed it. That instinct is not accidental — it is your mantle.

**Why Early Adopters Win Disproportionately.** Everett Rogers' Diffusion of Innovation curve maps how any new idea spreads through a population. Innovators and Early Adopters make up only 16% of any market — but they capture the majority of the upside. In network marketing, this is multiplied. The person who arrives early builds deep team roots. Their TSC flows across generations. Their influence spreads before the market is saturated. Timing is not luck — it is obedience to discernment.

**The Purple and Gold Mantle.** Purple represents royalty — the identity of those who move before permission is granted. Gold represents the wealth that flows to those who build before the masses arrive. This is not arrogance. It is stewardship. You were given eyes to see this opportunity when others could not. The question is not whether you deserved to see it first. The question is what you will do with the early-mover advantage you have been given.

**Your Responsibility as an Early Adopter.** The people who join after you are watching your journey. Your consistency is their proof. Your upgrade story is their invitation. Your discipline is their permission to believe. You are not just building income — you are laying down the testimony that the next generation of builders will stand on. Carry the mantle with intentionality.

[[MIRROR_MOMENT]]`,
    activity: "Identify 3 people in your network who carry early adopter energy — curious, open-minded and willing to try new things before others. Write their names and beside each name write one sentence about why you believe they would resonate with the Entrepreneurial Consumer philosophy.",
    questions: [
      { q: "What percentage of any market do Innovators and Early Adopters typically represent?", options: ["5%", "16%", "34%", "50%"], answer: 1 },
      { q: "The Purple and Gold Mantle represents:", options: ["Wealth and fame", "Royalty and diligence — moving before permission and building before the crowd arrives", "A Z2B membership tier", "A marketing strategy only"], answer: 1 },
      { q: "Timing in network marketing is described as:", options: ["Mostly luck and circumstance", "Obedience to discernment — acting on what you see before others confirm it", "Dependent on your upline's performance", "Determined by market saturation only"], answer: 1 },
      { q: "As an Early Adopter, your primary responsibility to those who follow is:", options: ["To recruit them immediately", "To lay down consistent testimony they can stand on", "To explain the compensation plan first", "To post on social media daily"], answer: 1 },
      { q: "The early-mover advantage in Z2B is described as:", options: ["A guarantee of financial success", "A stewardship — eyes to see an opportunity when others could not, requiring faithful use", "Luck based on timing alone", "Available only to experienced entrepreneurs"], answer: 1 },
    ],
  },
  {
    id: 11, free: false,
    title: "The Power of Ethical Collaboration",
    subtitle: "Kingdom Economics Runs on Multiplication, Not Limitation",
    content: `The scarcity mindset says: if you win, I lose. It is the invisible architecture of most competitive business environments — the belief that resources are finite, that every opportunity someone else takes is one taken from you, and that success is a zero-sum game where there can only be one winner at the table.

Kingdom Economics operates on an entirely different logic. It says: your success increases the surface area of possibility for everyone at the table. Your overflow is not a threat to me — it is evidence that the table can carry more. This is not idealism. It is economic reality for anyone who understands network models.

**Why Ethical Collaboration Is Strategically Superior.** When you help your G1 team member close a sale, your TSC increases. When you celebrate another builder's promotion, the energy of the team rises and your own results follow. When you share a strategy that works, your reputation as a leader deepens and better people are attracted to your circle. Ethical collaboration is not charity — it is compound interest on relationship capital.

**What Ethical Collaboration Looks Like in Practice.** It means sharing scripts that work — not hoarding them. It means celebrating publicly when someone below you outperforms you, because their success is the most powerful proof your leadership works. It means correcting with precision and encouraging with generosity. The leader who empowers others does not diminish — they multiply.

**The Kingdom Mandate.** Jesus fed five thousand with five loaves and two fish not by rationing — but by blessing and releasing. The multiplication happened in the act of giving, not the act of holding. Your knowledge, your connections, your strategies — when released generously into your team — do not diminish. They multiply. Every builder you empower adds a branch to a tree you planted.

**A Warning About Toxic Competition.** Within your own team, competition is cancer. It erodes trust, destroys duplication and collapses the community that makes the table valuable. You are not competing with your downline. You are building with them.

[[MIRROR_MOMENT]]`,
    activity: "Identify one strategy, script or contact that has worked well for you this month. Share it with at least one person in your team this week — without expectation of return. Write down what you shared, who you shared it with, and how it felt to give it away generously.",
    questions: [
      { q: "Kingdom Economics is built on the principle of:", options: ["Competition and scarcity", "Multiplication and ethical collaboration", "Protecting your strategies from others", "Working faster than your competitors"], answer: 1 },
      { q: "When you help a G1 team member close a sale:", options: ["Your income is not affected", "Your TSC increases — their success directly benefits you", "You lose a potential customer", "It only helps them, not you"], answer: 1 },
      { q: "Ethical collaboration in practice includes:", options: ["Hoarding scripts so competitors don't copy them", "Sharing strategies generously and celebrating others' wins openly", "Only helping people in your immediate upline", "Keeping your best contacts private"], answer: 1 },
      { q: "Within your own team, competition is described as:", options: ["A healthy motivator", "Cancer that erodes trust and destroys duplication", "Necessary for growth", "The foundation of network marketing"], answer: 1 },
      { q: "The feeding of five thousand illustrates:", options: ["That resources must be rationed carefully", "That multiplication happens in the act of generous release, not in holding back", "That miracles replace strategy", "That large teams are unsustainable"], answer: 1 },
    ],
  },
  {
    id: 12, free: false,
    title: "AI Technology — The Digital Oil of This Generation",
    subtitle: "How Artificial Intelligence Levels the Playing Field",
    content: `Every generation has had its defining resource — the one that separated those who built empires from those who remained consumers. In the 20th century it was oil. In the early 21st century it was data. In the era you are building in right now, it is artificial intelligence. And unlike oil, AI is not buried under the ground in a foreign country. It is accessible to anyone with a phone, an internet connection and the discipline to learn how to use it.

This is the most equalising technological moment in economic history. For the first time, a single person with no staff, no office and no budget can produce the output that once required an entire marketing department. A builder anywhere in the world can now create professional-quality content, analyse their funnel performance, write client communication, generate business plans and coach themselves — all from a smartphone.

**How AI Specifically Serves the Entrepreneurial Consumer.** Coach Manlaw — the AI coach embedded in your Z2B platform — is not a generic chatbot. He is trained on the Z2B philosophy, the 4 Table Legs, and the Entrepreneurial Consumer mindset. Every conversation you have with him deepens your strategic clarity. This is the equivalent of having a personal business coach on demand — previously available only to those who could afford R5,000 per hour consulting fees.

**AI in Your Sales Funnel.** The Content Studio's AI generation means you never have to stare at a blank page again. Tell Coach Manlaw what you want to say, who you want to say it to, and which platform — and he writes it in your voice with your referral link included. The 9-Day Nurture Engine that follows up on your prospects is itself AI-assisted automation. The system thinks for you while you sleep.

**What AI Cannot Replace.** Your story. Your voice. Your presence at the table. The builders who win are not those who use AI instead of showing up — but those who use AI to amplify their showing up. Sharper content, faster follow-up, deeper systems. The raw material is your life. The tool is AI. The combination is unstoppable.

[[MIRROR_MOMENT]]`,
    activity: "Open the Content Studio in My Sales Funnel. Use Coach Manlaw's AI generation to create one piece of content on a topic from your most recent workshop session. Evaluate the output: what did it get right? What would you change to make it more authentically yours?",
    questions: [
      { q: "AI is described as 'the digital oil of this generation' because:", options: ["It is expensive and rare", "It is the defining resource that separates empire builders from consumers — and it is accessible to anyone", "It replaces human effort entirely", "It is only available to large corporations"], answer: 1 },
      { q: "Coach Manlaw differs from a generic chatbot because:", options: ["He is more expensive", "He is trained specifically on the Z2B philosophy, 4 Table Legs and EC mindset", "He only generates social media content", "He is available 24 hours a day"], answer: 1 },
      { q: "What AI cannot replace in your Z2B journey:", options: ["Content creation", "Follow-up sequences", "Your authentic story, voice and human presence at the table", "Funnel automation"], answer: 2 },
      { q: "The right relationship with AI tools is:", options: ["Use them instead of showing up personally", "Avoid them — they are impersonal", "Use them to amplify your showing up — sharper content, faster follow-up, deeper systems", "Only use them when you run out of ideas"], answer: 2 },
      { q: "Every week a builder should ask:", options: ["How many followers did I gain?", "What am I doing manually that AI could do better or faster — to free time for high-value human connection?", "When will AI replace my need to build?", "Should I switch platforms?"], answer: 1 },
    ],
  },
  {
    id: 13, free: false,
    title: "Converting Your Smartphone Into an Income Engine",
    subtitle: "The Tool in Your Pocket Is Already a Business Platform",
    content: `The most expensive piece of business infrastructure you own is already in your pocket. You paid for it. You charge it every night. You carry it everywhere. And for most people, it is used almost entirely for consumption — scrolling, watching, reacting — while the same device could be generating income around the clock.

The smartphone is not a distraction from your business. It is your business platform. Every major income-generating activity available to a Z2B builder can be executed from a phone: posting content, sharing your referral link, sending WhatsApp scripts, tracking your pipeline, coaching with Manlaw, completing workshop sessions, monitoring your earnings. The equipment problem does not exist. The strategy gap does.

**The 4 Business Functions of Your Phone.** First: Content Creation — your camera is your studio, your microphone is your broadcast. A 60-second TikTok filmed in your car during lunch has converted more prospects than polished studio productions — because authenticity outperforms production value when audiences make trust decisions. Second: Communication — WhatsApp is the most powerful sales tool in the community context because it is personal, immediate and lives where your prospects already spend hours daily. Third: Pipeline Management — My Sales Funnel lives in your browser, every update accessible from the same device. Fourth: Learning — morning sessions, evening sessions, Coach Manlaw — all in your pocket.

**The Mindset Shift: From Consumer Device to Producer Platform.** The consumer picks up their phone to receive — to be entertained, informed and distracted. The Entrepreneurial Consumer picks up their phone to produce — to post, to connect, to manage, to build. The physical device is identical. The intention is completely different. This shift — from receiver to transmitter — is one of the most practical expressions of the EC identity.

**Protecting Your Tool From Itself.** The same device that generates income is engineered by the world's most sophisticated attention engineers to steal your time. Every notification pulls you back into consumption mode. Your discipline requires boundaries: specific hours for content creation, specific sessions for pipeline management, and wisdom to close the consumption apps before they consume your building hours.

[[MIRROR_MOMENT]]`,
    activity: "For the next 7 days, track your phone use in 3 columns: CONSUMPTION (scrolling, watching), COMMUNICATION (personal non-business), PRODUCTION (content, pipeline, workshop, Coach Manlaw). At the end calculate your production percentage. That number is your current builder utilisation rate.",
    questions: [
      { q: "The smartphone is called your business platform because:", options: ["It is the most expensive thing you own", "Every major Z2B income-generating activity can be executed from it", "It has the best camera", "It connects you to social media"], answer: 1 },
      { q: "The 4 business functions of your phone in Z2B are:", options: ["Games, music, maps, payments", "Content creation, communication, pipeline management, learning", "Emails, calls, meetings, reports", "WhatsApp, TikTok, Facebook, YouTube only"], answer: 1 },
      { q: "Authenticity outperforms production value in content because:", options: ["Audiences don't notice quality", "Trust decisions are made based on genuine presence, not polish", "Professional content is too expensive", "Phone cameras are better than professional cameras now"], answer: 1 },
      { q: "The Entrepreneurial Consumer's relationship with their phone is:", options: ["Picking it up to receive and consume", "Picking it up to produce — post, connect, manage, build", "Keeping it off during work hours", "Only using it for business apps"], answer: 1 },
      { q: "The greatest threat your phone poses to your building journey is:", options: ["Poor battery life", "Slow internet connection", "Engineered consumption designed to steal your production time", "Limited storage space"], answer: 2 },
    ],
  },
  {
    id: 14, free: false,
    title: "Copywriting — Turning Words Into Currency",
    subtitle: "How the Right Words Open Doors and Close Deals",
    content: `Copywriting is the skill of using words to move people to action. It is the difference between a WhatsApp message that gets read and forgotten, and one that generates a response within minutes. It is the difference between a TikTok caption that stops the scroll and one that gets skipped. It is the difference between a referral link that gets clicked and one that gets archived. In the digital economy, the person who communicates with precision and intention earns more than the person who works twice as hard but speaks vaguely.

You do not need a marketing degree to write effective copy. You need three things: clarity about who you are speaking to, understanding of what they want and fear, and the discipline to write for them — not for yourself.

**The 3 Elements Every Piece of Z2B Copy Needs.** First: A Hook that stops the scroll or opens the message. The hook is not a greeting — it is a disruption. It answers the reader's question: "Why should I pay attention to this right now?" Second: A Body that connects their reality to your invitation. Nobody wakes up wanting to join a network marketing company. They wake up wanting to stop worrying about month-end. Speak to that. Third: A Call to Action that is specific and low-friction. Not "contact me for more information" — but "tap the link in my bio and register for the free workshop. No card. No pressure. Just the beginning."

**The Entrepreneurial Consumer Story Format.** The most powerful copy you will ever write is not taken from a template — it is drawn from your own journey. Before Z2B / After Z2B. Before I understood Entrepreneurial Consumerism / After I made the identity shift. This before-and-after structure is the oldest conversion format in communication history — because it shows transformation, not features. People do not buy products. They buy the version of themselves the product helps them become.

**Coach Manlaw and Your Copy.** You do not have to write every piece from scratch. Coach Manlaw generates platform-specific copy in your voice with your referral link embedded. But the best results come from builders who give Manlaw their genuine before-and-after story — not those who ask for something generic. The raw material is your life. The tool is the AI. The combination is unstoppable.

[[MIRROR_MOMENT]]`,
    activity: "Write a single WhatsApp message to a specific person in your network using the Hook-Body-CTA format. Before writing, complete: My reader wakes up worried about ______. They dream of ______. The one thing I want them to do after reading is ______. Now write the message. Compare it to previous messages and notice the difference in precision.",
    questions: [
      { q: "Copywriting is defined as:", options: ["Writing long articles and blogs", "Using words with precision and intention to move people to specific action", "Creating graphics and visual content", "Professional advertising only"], answer: 1 },
      { q: "The 3 elements every piece of Z2B copy needs are:", options: ["Logo, tagline, contact details", "Hook, Body, Call to Action", "Introduction, features, price", "Story, statistics, testimonials"], answer: 1 },
      { q: "The most powerful copy an EC can write is:", options: ["Taken from a corporate template", "Drawn from their own before-and-after transformation story", "Written by a professional copywriter", "Focused on product features and compensation rates"], answer: 1 },
      { q: "People do not buy products — they buy:", options: ["Lower prices than competitors", "The version of themselves the product helps them become", "Proof that others have succeeded first", "A guaranteed income"], answer: 1 },
      { q: "The best results from Coach Manlaw content generation come from:", options: ["Asking for completely generic content", "Giving Manlaw your genuine before-and-after story as raw material", "Copying scripts word for word without personalising", "Using only pre-written library scripts"], answer: 1 },
    ],
  },
  {
    id: 15, free: false,
    title: "The Platform Funnel — Your Economic Architecture",
    subtitle: "Building a System That Works While You Sleep",
    content: `An economic architecture is a system of interconnected parts that generates value continuously — with or without your active involvement in every transaction. The wealthiest people in the world do not work for every rand they receive. They have built architectures: systems, platforms, pipelines and processes that work while they rest, travel and sleep. The gap between those who earn time-for-money and those who earn leverage-for-money is not intelligence or talent. It is architecture.

Your Z2B platform funnel is your first architecture. It is modest by global standards. But it is real, operational, and it is yours. Every great architecture starts small before it scales.

**The 6 Layers of Your Z2B Economic Architecture.** Layer 1: Your Referral Link — every prospect who clicks it is automatically registered and tagged to you. Layer 2: The Free Workshop — your lead magnet, with 9 sessions that educate and warm prospects toward the paid upgrade. Layer 3: The 9-Day Nurture Engine — automated email follow-up that builds trust and handles objections without you writing a single message. Layer 4: My Sales Funnel Pipeline — visual tracking of every prospect's Day 1 through Day 9 journey. Layer 5: WhatsApp Launcher — at key conversion moments, the system surfaces the right script and opens WhatsApp for you. One tap. Personalised. Layer 6: TSC Multiplication — when your Bronze builders run the same architecture, their sales generate commissions that flow back to you automatically across up to ten generations. You did not make those sales. Your architecture did.

**What Maintenance the Architecture Requires.** A system does not run itself indefinitely. Your funnel requires: daily content creation (4 posts) to drive new sign-ups. Weekly pipeline review to identify Day 6 and Day 9 prospects. Monthly coaching of your G1 team to ensure their architecture runs. Concentrate your effort at the highest-value touch points and let the system handle everything else.

**The Vision: Architecture at Scale.** At 12 active Bronze builders, each running the same 6-layer architecture, your system processes 12 referral funnels simultaneously. At 100 builders, it processes 100. You are not doing 100 times more work. You are doing the same coaching work — with 100 times the reach. Build it once. Maintain it faithfully. Let it compound.

[[MIRROR_MOMENT]]`,
    activity: "Draw your current 6-layer architecture on paper. Label each layer and beside each write one word: ACTIVE (running well), WEAK (needs attention) or MISSING (not yet built). The WEAK and MISSING layers are your priority this week.",
    questions: [
      { q: "An economic architecture differs from active income because:", options: ["It requires no work at all", "It generates value continuously with or without your active involvement in every transaction", "It is only available to wealthy people", "It requires a business registration"], answer: 1 },
      { q: "Layer 3 — the 9-Day Nurture Engine — works by:", options: ["Sending manual WhatsApp messages", "Automated email follow-up that builds trust and handles objections without your direct involvement", "Requiring daily calls to each prospect", "Posting on social media automatically"], answer: 1 },
      { q: "The WhatsApp Launcher activates specifically at:", options: ["Day 1 and Day 2 of a prospect's journey", "Day 6 and Day 9 — key conversion moments", "Any time the builder chooses", "After the prospect upgrades to Bronze"], answer: 1 },
      { q: "TSC Multiplication is part of the architecture because:", options: ["You personally make each sale", "Your builders' sales generate commissions that flow back to you automatically", "It requires daily manual tracking", "It only works at Platinum tier"], answer: 1 },
      { q: "Architecture at scale means:", options: ["Doing 100 times more work for 100 builders", "Doing the same coaching work with 100 times the reach through a duplicated system", "Removing yourself from the business entirely", "Hiring staff to manage the funnel"], answer: 1 },
    ],
  },
  {
    id: 16, free: false,
    title: "Platform Ownership — From Tenant to Landlord",
    subtitle: "Never Build Your Empire on Borrowed Land",
    content: `There is a distinction most digital entrepreneurs never fully grasp until they experience its consequences: the difference between building on a platform and owning one. Building on a platform means you are a tenant. The landlord sets the rules, changes the algorithm, suspends accounts, and can evict you at any time — taking your audience and your income with them. Owning a platform means the rules are yours. The relationship between you and your audience belongs to you.

Thousands of content creators, network marketers and digital entrepreneurs have had Facebook pages, TikTok accounts and Instagram profiles suspended — losing years of audience building in a single moment. The platform they thought was their asset was never theirs. It was a channel they were temporarily permitted to use.

**What You Own vs What You Rent.** You own your email list — nobody can take it. You own your WhatsApp contacts — personal relationships, not platform relationships. You own your website and domain — your digital headquarters on land you hold the title to. You own your knowledge, curriculum and IP. You rent your social media audience — it exists only as long as the platform permits. You rent your reach on any algorithm-driven platform — your visibility is their decision, not yours.

**The Z2B Platform as Your Business Headquarters.** Your Z2B profile, referral link, pipeline and earnings exist on infrastructure you access — but operated by Z2B. This is appropriate for this stage of your journey. But as you grow, the EC mindset pushes you toward progressively more ownership: a personal email list, a WhatsApp broadcast list that bypasses algorithm, and eventually a personal digital presence that exists independently of any single platform.

**The First Step Toward Ownership.** Start collecting email addresses of people who engage with your content. Not just referral sign-ups — but people who comment, respond to your WhatsApp statuses, and engage genuinely. Build a list. Nurture it. That list is an asset that compounds over time and belongs entirely to you — regardless of what any platform decides to do with its algorithm tomorrow.

[[MIRROR_MOMENT]]`,
    activity: "Audit your digital presence in two columns: OWNED (email list, WhatsApp contacts, website, Z2B profile) and RENTED (Facebook followers, TikTok followers, YouTube subscribers). Count the numbers. Your OWNED column is your real asset base. Set a goal to grow your OWNED assets by 20% this month.",
    questions: [
      { q: "A platform tenant is someone who:", options: ["Pays monthly fees for tools", "Builds an audience on infrastructure owned by someone else — subject to their rules", "Owns multiple social media accounts", "Runs a legitimate business"], answer: 1 },
      { q: "The difference between owning and renting your audience is:", options: ["The size of the audience", "Ownership means the relationship belongs to you; renting means it exists by the platform's permission", "The cost of advertising", "Your follower count"], answer: 1 },
      { q: "Which of the following is OWNED, not rented?", options: ["Your Facebook page followers", "Your TikTok subscriber count", "Your email list and WhatsApp contacts", "Your Instagram engagement rate"], answer: 2 },
      { q: "The EC mindset pushes toward progressively more ownership because:", options: ["Social media is unreliable and should be avoided", "No single platform should be the sole relationship between you and your audience", "Email is more effective than social media", "Z2B encourages members to leave the platform"], answer: 1 },
      { q: "The first practical step toward platform ownership is:", options: ["Building a YouTube channel immediately", "Starting to collect and nurture an email list of people already interested in what you share", "Buying a domain name immediately", "Leaving all social media platforms"], answer: 1 },
    ],
  },
  {
    id: 17, free: false,
    title: "Digital Assets That Form Legacy Infrastructure",
    subtitle: "Building Systems That Outlive Your Effort",
    content: `A physical asset depreciates. A car loses value every year. A building requires maintenance. A machine wears out. Digital assets operate on a different principle — they can appreciate, multiply and work indefinitely with minimal maintenance. A piece of content created 3 years ago can still be driving sign-ups today. A curriculum built once can be sold to thousands simultaneously without additional work. An email sequence written in a weekend can nurture prospects for years. This is the extraordinary leverage of digital assets.

**The 5 Categories of Digital Assets for the EC.** First: Content Assets — blog posts, videos, podcasts and social media posts that continue to attract and convert audiences long after they were published. A TikTok video about EC philosophy filmed today can still bring sign-ups in five years. Second: Educational Assets — courses, workshops and guides that can be sold or distributed at scale. Your Z2B workshop is an educational asset. Third: Relationship Assets — your email list, WhatsApp community and coaching relationships that deepen over time. Fourth: System Assets — your sales funnel, referral pipeline and automated nurture sequences that work without your presence. Fifth: Intellectual Property Assets — your frameworks, philosophy and branded language. The EC concept, the 4 Table Legs, Coach Manlaw — IP assets that create positioning no competitor can legally replicate.

**Building vs Consuming Digital Assets.** Most people are net consumers — they consume content, subscribe to courses, use apps. The Entrepreneurial Consumer flips this: they produce content, build curriculum, create community and develop systems that others consume. The direction of the flow determines whether you are gaining wealth or transferring it.

**Legacy Infrastructure.** A digital asset built today becomes part of an inheritance. Your children could continue your referral business. Your workshop could be taught by coaches you train. Your platform — if built with intention and quality — becomes transferable wealth, not just operational income. This is how the EC moves from income generation to wealth architecture.

[[MIRROR_MOMENT]]`,
    activity: "List every digital asset you currently own — no matter how small. Include social media posts that performed well, content you have created, your Z2B profile, your WhatsApp community, any frameworks you have written. Beside each write ACTIVE, DORMANT or SEED. Your DORMANT list is hidden treasure.",
    questions: [
      { q: "Digital assets differ from physical assets because:", options: ["They are more expensive to create", "They can appreciate, multiply and work indefinitely with minimal maintenance", "They are riskier to build", "They require technical expertise"], answer: 1 },
      { q: "The 5 categories of digital assets for the EC are:", options: ["Cash, property, stocks, bonds, gold", "Content, educational, relationship, system and intellectual property assets", "Social media, email, phone, video, audio", "Bronze, Silver, Gold, Platinum, Diamond"], answer: 1 },
      { q: "The EC flips the digital asset equation by:", options: ["Spending more on premium tools", "Moving from net consumption to net production — creating assets others consume", "Avoiding social media entirely", "Partnering with large corporations"], answer: 1 },
      { q: "Legacy infrastructure means your digital assets:", options: ["Will only benefit you personally", "Can become transferable wealth — a business your children could continue or a platform that can be acquired", "Must be rebuilt every few years", "Require constant active management"], answer: 1 },
      { q: "Evergreen content is your most powerful legacy asset because:", options: ["It follows trending topics", "It is specifically designed to remain relevant and valuable regardless of when it is consumed", "It gets more immediate views", "It is easier to create than topical content"], answer: 1 },
    ],
  },
  {
    id: 18, free: false,
    title: "The Doctrine of Strategic Capital",
    subtitle: "Positioning, Influence, and Access as Economic Assets",
    content: `Most people understand financial capital — money, savings, investments. Some understand human capital — skills, knowledge, experience. But very few people have a working understanding of strategic capital — the economic value of positioning, influence and access. Strategic capital is invisible on a balance sheet. But it is often the most decisive factor in determining who gets the opportunity and who gets passed over.

Strategic capital is why two people with identical financial and human capital experience wildly different economic outcomes. One is positioned where decisions are made. The other is not. One has access to rooms where opportunities are discussed before they are announced. The other hears about them after they are gone. The gap between them is strategic capital.

**The 3 Pillars of Strategic Capital.** Positioning is about where you stand in relation to the flow of value and decision-making. In Z2B terms, your positioning is shaped by your tier, team depth, consistency of presence, and reputation quality. Influence is the capacity to shift others' thinking and action through credibility, trust and evidence — not pressure or manipulation. The builder who lives the EC lifestyle authentically — posting from genuine transformation, inviting without desperation, leading with generosity — accumulates influence that opens doors financial capital alone cannot. Access is about who knows you and who will take your call. Access is built through consistent value exchange — showing up at the table, contributing to community, celebrating others' wins and being known as someone who gives before they take.

**Building Strategic Capital in Z2B.** Every workshop session deepens your knowledge. Every post builds your influence. Every relationship invested in grows your access. Every upgrade signals your positioning. Strategic capital compounds quietly — almost invisibly in the short term. But at a certain threshold, doors open that you did not know existed. Collaborations appear. Introductions happen. Opportunities surface. Not because of luck — because of accumulated strategic capital reaching critical mass.

**A Warning.** Strategic capital can be destroyed faster than it is built. One act of deception, one exploitation of a relationship for short-term gain — and years of carefully accumulated trust evaporate. Guard your reputation with the same intensity as your financial savings.

[[MIRROR_MOMENT]]`,
    activity: "Evaluate your current strategic capital across 3 pillars: POSITIONING — where do you stand in your community and in Z2B right now? INFLUENCE — when you share something, do others engage and act? ACCESS — who would take your call today that would not have 12 months ago? Write one concrete action to build each pillar this week.",
    questions: [
      { q: "Strategic capital represents:", options: ["Money and financial savings", "The economic value of positioning, influence and access — invisible on a balance sheet but decisive in outcomes", "Skills and formal qualifications", "Social media following and online metrics"], answer: 1 },
      { q: "Positioning in Z2B is shaped by:", options: ["Your age and background", "Your tier, team depth, consistency and reputation quality", "The size of your social media following only", "How long you have been a member"], answer: 1 },
      { q: "Influence as strategic capital is built through:", options: ["Pressure and persuasion", "Credibility, trust and evidence — authentic living that others can observe and verify", "Aggressive promotion of the compensation plan", "Having the most followers"], answer: 1 },
      { q: "Strategic capital reaches critical mass when:", options: ["You hit Silver tier", "Accumulated positioning, influence and access compound to open doors that were previously invisible", "You have 100 team members", "You spend a certain amount on advertising"], answer: 1 },
      { q: "Strategic capital can be destroyed by:", options: ["Slow posting consistency", "Acts of deception, dishonesty or exploitation of relationships for short-term personal gain", "Not reaching Silver tier fast enough", "Having a small team in early stages"], answer: 1 },
    ],
  },
  {
    id: 19, free: false,
    title: "Sourcing Quality Business Partners",
    subtitle: "Discernment Over Desperation in Partnership Building",
    content: `The quality of your business journey is shaped significantly by the quality of the people you choose to walk it with. Not because some people are more valuable than others as human beings — but because alignment, commitment and character determine whether a partnership multiplies your effort or divides your energy. In network marketing, poor partnership decisions are amplified because you are building a living system of duplicated human behaviour. If you duplicate the wrong character, the whole tree bears that character's fruit.

Desperation is the most dangerous emotion in partnership building. When you need to hit a number — a QPB threshold, a competition target, a team growth goal — the temptation is to recruit anyone who says yes. The short-term relief of hitting the number is quickly overridden by the long-term cost of carrying a team member who is uncommitted, dishonest or misaligned. Quality over quantity is not a motivational slogan. It is an economic strategy.

**What to Look For in a Business Partner.** Character before capacity. A person with strong character and weak skills can be coached. A person with strong skills and weak character will eventually weaponise those skills against the team. Look for: integrity in how they speak about others, commitment visible in their current habits not just declared intentions, teachability demonstrated by their response to feedback, and genuine alignment with the Z2B philosophy — not just the compensation plan.

**The 3 Partnership Conversations.** Before deeply investing in a new builder, have 3 conversations: First, the Dream Conversation — where are you going and why? Second, the Reality Conversation — what is actually true about your current situation, available time, support system? Third, the Commitment Conversation — given the dream and the reality, what are you specifically willing to do, consistently, over the next 90 days? The builder who cannot sustain these 3 conversations honestly is telling you something important before you invest months of coaching energy.

**The Table Analogy.** A table stands because all four legs are stable. If one leg is shorter, the whole table wobbles. Your team is a table — and you are responsible for the structural integrity of the legs you sponsor. Sponsor with discernment. Build with patience. Invest deeply in those who demonstrate they are worth investing in.

[[MIRROR_MOMENT]]`,
    activity: "Review your current or potential first-generation team members. For each, honestly answer: Do they demonstrate integrity in how they speak about others? Do their habits reflect the commitment they declare? Are they teachable? Do they align with the EC philosophy or just the income potential? This is a clarity exercise — the answers show where to concentrate your coaching energy.",
    questions: [
      { q: "Why is desperation dangerous in partnership building?", options: ["It creates too much pressure on prospects", "It leads to recruiting anyone who says yes — importing misaligned character into a system that duplicates it", "It reduces your income temporarily", "It makes you appear unprofessional"], answer: 1 },
      { q: "Character should be prioritised over capacity because:", options: ["Skills are unimportant", "Character determines the fruit the whole team tree bears — skills can be coached but character replicates itself", "Capacity is easier to evaluate", "Z2B prefers inexperienced members"], answer: 1 },
      { q: "The 3 Partnership Conversations are:", options: ["Compensation, timeline, targets", "Dream, Reality, Commitment", "Welcome, onboarding, training", "Phone call, WhatsApp, meeting"], answer: 1 },
      { q: "The table analogy means you are responsible for:", options: ["Making decisions for your team", "The structural integrity of the legs you sponsor — choosing partners whose weight the table can hold", "Recruiting as many people as possible", "Only your personal sales performance"], answer: 1 },
      { q: "Quality over quantity in partnership building is:", options: ["A motivational slogan with limited practical value", "An economic strategy — duplicating the wrong character costs more than any short-term number gain", "Only relevant at higher tiers", "Something to consider after building a large team"], answer: 1 },
    ],
  },
  {
    id: 20, free: false,
    title: "Your Circle as an Economic Incubator",
    subtitle: "Before Corporations Form Publicly, They Form Privately",
    content: `Every major corporation that exists today — every global brand, every billion-dollar business, every movement that changed an industry — began as a private circle of aligned people. Before Amazon was public, it was a small team in a garage. Before Apple was a revolution, it was two people in a bedroom. Before the early church turned the world upside down, it was twelve people gathered around one table. The pattern is consistent across history: private circles of aligned purpose are the incubators of public impact.

Your Z2B team is your private circle. Right now it may be small. The results may not yet be visible to the world. But inside that circle, something is forming — the culture, the habits, the relationships and the discipline that will define the public impact you eventually create. Do not despise the smallness of your current circle. Nurture it. It is where your empire is being incubated.

**The Economic Functions of Your Circle.** Your circle serves 5 functions simultaneously: Knowledge Amplification — what one person learns, the whole circle accesses. Risk Reduction — community support reduces the isolation that kills most solo builders. Accountability — promises made in private are remembered by others, creating gentle enforcement of commitment. Cross-pollination — different backgrounds and networks create unexpected opportunities. Compounding Testimony — every breakthrough in the circle becomes evidence for every other member that breakthrough is possible.

**How to Cultivate Your Circle Intentionally.** A circle does not maintain itself. It requires: regular rhythm (weekly check-ins, monthly celebrations), intentional inclusion (inviting people who add different strengths), psychological safety (honest conversations without fear of judgment), and investment (pouring your best coaching energy into the people in your circle before expecting return).

**From Circle to Corporation.** When your circle develops a strong enough culture — shared values, shared language, shared vision — it begins to behave like an organism. Your team stops needing you to drive every initiative. They replicate the culture themselves. They train their own teams. They celebrate and grieve together. That is the moment your private circle becomes a public institution. And it started with two or three people willing to say: let us build this table together.

[[MIRROR_MOMENT]]`,
    activity: "This week, invest deliberately in your circle. Choose one person in your first-generation team and give them one hour of undivided coaching attention — not to review numbers, but to ask: What is the most important thing I can help you with right now? What do you need that you haven't asked for? Listen. What you hear will tell you more than any dashboard metric.",
    questions: [
      { q: "The historical pattern of major corporations teaches that:", options: ["Success requires immediate public visibility", "Every significant public institution began as a small private circle of aligned people", "Large teams are necessary from the beginning", "Solo founders are more successful than teams"], answer: 1 },
      { q: "The 5 economic functions of your circle include:", options: ["Sales, marketing, admin, finance, HR", "Knowledge amplification, risk reduction, accountability, cross-pollination, compounding testimony", "Recruiting, training, selling, managing, reporting", "WhatsApp, email, phone, meetings, events"], answer: 1 },
      { q: "A circle becomes a culture when:", options: ["It reaches a certain number of members", "It develops shared values, language and vision — and begins to replicate itself without being driven", "The leader achieves Diamond Legacy tier", "Everyone has the same background"], answer: 1 },
      { q: "Psychological safety in your circle means:", options: ["Protecting members from all criticism", "Creating an environment where people can be honest about struggles without fear of judgment", "Only celebrating successes publicly", "Keeping team problems secret from the wider community"], answer: 1 },
      { q: "Compounding testimony describes:", options: ["Financial returns on investment", "Each breakthrough in the circle becoming evidence for every other member that breakthrough is possible", "The cumulative effect of daily posting", "How TSC grows across generations"], answer: 1 },
    ],
  },

  // ---- PAID TIER: SESSIONS 21–40 — FULLY WRITTEN ----
  {
    id: 21, free: false,
    title: "Financial Literacy for the Entrepreneurial Consumer",
    subtitle: "Understanding Money as a Language You Must Learn",
    content: `Money is a language. Like any language, fluency takes time and practice — but once you are fluent, you can navigate environments that are completely inaccessible to those who cannot read the signs. Financial illiteracy is not a character flaw. It is a gap in education. Nobody taught most employees how money actually works — how it is created, how it compounds, how it is destroyed by ignorance, and how it flows toward those who understand its grammar.

The Entrepreneurial Consumer begins their financial education not with investment strategies — but with foundational understanding. What is the difference between an asset and a liability? What is cash flow and why does it matter more than salary? What does it mean for money to work for you instead of the other way around? These are not advanced concepts. They are foundational literacy — and yet most adults were never taught them.

**Assets vs Liabilities — The Most Important Distinction You Will Learn.** An asset puts money into your pocket. A liability takes money out of your pocket. Most people spend their lives accumulating liabilities — cars, furniture, fashion, subscriptions — while calling them assets. A car that takes R4,000 per month in repayments, insurance, fuel and maintenance is not an asset. It is a liability. A referral link that earns you R86.40 every time someone upgrades to Bronze is an asset. The difference is not moral — it is directional. Which direction is money flowing?

**Cash Flow Over Salary.** The wealthy do not focus primarily on increasing their salary — they focus on increasing their cash flow. Salary is active income: you stop working, it stops coming. Cash flow includes passive, residual and leveraged income that continues regardless of your daily activity. The Z2B TSC commission that flows into your account every month because your team is active is cash flow. The goal of the Entrepreneurial Consumer is to build enough cash flow sources to gradually reduce their dependence on any single salary.

**Financial Literacy as a Spiritual Discipline.** The Bible says "the borrower is servant to the lender" (Proverbs 22:7). Financial literacy is the practical outworking of breaking debt servitude. Every rand you redirect from liability accumulation to asset building is an act of stewardship. Every income stream you add is a demonstration of the multiplication principle. Understanding money is not greed — it is faithful dominion over the resources you have been entrusted with.

[[MIRROR_MOMENT]]`,
    activity: "Write down your current monthly income and monthly expenses in two columns. Under income, include ALL sources. Under expenses, beside each item write A (Asset — contributes to your wealth), L (Liability — takes money out), or N (Neutral — necessary but neither). Your financial literacy journey begins with seeing your current reality clearly.",
    questions: [
      { q: "What is the definition of an asset?", options: ["Something you own", "Something that puts money into your pocket", "Something with high market value", "Something you paid a lot for"], answer: 1 },
      { q: "Financial literacy is described as:", options: ["A talent some people are born with", "A language — learnable, foundational, and directly connected to economic outcomes", "Only necessary for business owners", "A secondary skill after technical expertise"], answer: 1 },
      { q: "Cash flow is more important than salary because:", options: ["It is always larger", "It continues regardless of your daily activity — salary stops when you stop working", "It is easier to generate", "It is tax-free"], answer: 1 },
      { q: "The Z2B TSC commission is an example of:", options: ["Active income requiring daily effort", "Cash flow — income generated by your team's activity, not just your own", "A once-off payment", "A salary supplement"], answer: 1 },
      { q: "Financial literacy as a spiritual discipline means:", options: ["Avoiding all debt permanently", "Faithful stewardship — redirecting resources from liability accumulation to asset building", "Giving all your money away", "Never taking financial risks"], answer: 1 },
    ],
  },
  {
    id: 22, free: false,
    title: "The Employee Mindset vs The Owner Mindset",
    subtitle: "Rewiring How You Think About Time, Money and Work",
    content: `The difference between an employee and an owner is not primarily income — it is perspective. An employee with a million-rand salary can still carry a poverty mindset. An owner building their first small business can already carry the thinking that leads to generational wealth. The mindset shift comes first. The income follows.

The employee mindset is not a moral failing. It is a trained response to a specific environment. Years of receiving instructions, being evaluated by others, having your time structured externally, and trading hours for payment — all of this creates a neural pattern that defaults to: wait for direction, avoid risk, value security over opportunity, and measure success by the consistency of the monthly paycheck.

**Seven Key Differences.** The employee asks "What are my hours?" — the owner asks "What needs to be done?" The employee values job security — the owner values options and positioning. The employee sees money as something to earn — the owner sees money as something to deploy. The employee avoids failure — the owner mines failure for information. The employee works for a salary — the owner builds systems that generate income. The employee thinks in weeks and months — the owner thinks in years and decades. The employee asks "How much will I be paid?" — the owner asks "What value can I create, and who will pay for it?"

**You Are Already in Transition.** The fact that you are in this workshop means the employee mindset is already cracking. You did not wait for permission to explore this. You did not ask your employer if it was okay to think differently about income. You showed up at the table before you knew exactly what was on the menu. That is owner energy. Recognise it. Reinforce it daily — through your morning sessions, through your pipeline work, through every post you publish and every conversation you have about the third path.

**A Caution About False Transitions.** Some people leave the employee mindset superficially — they quit their job before they have built anything, driven by frustration rather than strategy. This is not the owner mindset. It is the escape mindset. The Entrepreneurial Consumer makes the transition intelligently: build the systems, grow the income, reduce the dependency — then make the move when the table can hold your weight. Patience in the transition is not weakness. It is wisdom.

[[MIRROR_MOMENT]]`,
    activity: "Write two columns: EMPLOYEE THINKING and OWNER THINKING. In each column, write 5 thoughts you have had this week — about time, money, risk, opportunities or your building journey. Be honest. The employee thoughts are not shameful — they are signals of where the rewiring work still needs to happen.",
    questions: [
      { q: "The employee mindset is described as:", options: ["A moral failing that must be eliminated immediately", "A trained response to a specific environment — not a character flaw", "A permanent state that cannot change", "Only present in people with low education"], answer: 1 },
      { q: "An owner thinks about money as:", options: ["Something to earn through hard work", "Something to deploy — to generate more value and more income", "Something to save and protect", "Something to spend on lifestyle"], answer: 1 },
      { q: "The Z2B approach to the employee-to-owner transition is:", options: ["Quit your job immediately when you find a better opportunity", "Build systems and grow income first, then reduce dependency intelligently — patience is wisdom", "Stay employed forever and never make the transition", "Transition only when you are completely debt-free"], answer: 1 },
      { q: "Owner energy is demonstrated when:", options: ["You wait for permission before making decisions", "You show up before knowing exactly what is on the menu — initiative without guaranteed outcome", "You secure your salary before taking any action", "You ask someone else to evaluate your opportunities"], answer: 1 },
      { q: "The escape mindset differs from the owner mindset because:", options: ["It involves leaving employment", "It is driven by frustration rather than strategy — moving away from something rather than toward a built alternative", "It is faster and more effective", "It is what the EC philosophy recommends"], answer: 1 },
    ],
  },
  {
    id: 23, free: false,
    title: "Creating Your Personal Income Blueprint",
    subtitle: "Mapping Multiple Income Streams Before You Need Them",
    content: `The most dangerous financial position is depending on a single source of income. Not because that source will definitely disappear — but because the possibility of its disappearance controls your every decision, your every conversation and your every risk tolerance. When your entire financial existence flows through one pipe, the owner of that pipe controls you. Your employer knows this. Your landlord knows this. Your bank knows this. You should know it too.

The Entrepreneurial Consumer's answer to single-income dependency is not to immediately replace their salary — it is to build additional pipes. Small ones at first. Unreliable ones. Ones that generate R200 one month and R800 the next. The goal is not immediate income replacement — it is income diversification. Multiple small flows are more resilient than one large one.

**The Six Z2B Income Streams as Your Blueprint Foundation.** Your Z2B compensation plan already gives you a six-stream income blueprint to build toward: ISP (individual sales), QPB (fast recruiting bonus), TSC (team commissions across generations), MKT (marketplace sales for Gold/Platinum), CEO Competitions, and CEO Quarterly Awards. These six streams are not separate businesses — they are six facets of one coherent system. Start with ISP. Add QPB in your first 90 days. Build toward TSC as your team grows. Plan for Marketplace when you reach Gold. This is your income architecture — mapped out for you already.

**Beyond Z2B — The Long-Term Blueprint.** The Z2B income streams are your first architecture. But the Entrepreneurial Consumer's vision does not stop there. As you build, you will identify adjacent income opportunities: a skill you can teach, a problem you can solve for others, a platform you can build, a product you can create. These do not compete with Z2B — they compound it. The person who has multiple income streams is not scattered. They are diversified. And diversification is the foundation of financial resilience.

**Map It Now — Even Before It Exists.** You do not have to wait until you have multiple income streams to create your income blueprint. Draw it now — the streams that exist, the streams you are building, and the streams you intend to add in the next 2–5 years. A map drawn before the journey is not wishful thinking. It is navigation. And people who navigate arrive at destinations that people who wander rarely reach.

[[MIRROR_MOMENT]]`,
    activity: "Draw your personal income blueprint right now. Circle 1: income you have today. Circle 2: income streams actively being built (Z2B ISP, QPB). Circle 3: income streams you plan to add within 2 years (TSC growth, a skill monetised, a product created). Draw connecting lines that show how each stream supports the others. This is your financial architecture map.",
    questions: [
      { q: "The most dangerous financial position is:", options: ["Having multiple income streams", "Depending on a single source of income — any disruption controls every decision", "Building income too slowly", "Earning more than you need"], answer: 1 },
      { q: "The Z2B income blueprint provides:", options: ["One income stream — ISP only", "Six interconnected streams — ISP, QPB, TSC, MKT, CEO Competitions, CEO Awards", "Unlimited instant income", "A salary replacement guarantee"], answer: 1 },
      { q: "The goal of income diversification is:", options: ["Immediately replacing your salary", "Building resilience through multiple flows — small ones that compound over time", "Quitting your job as fast as possible", "Earning from as many unrelated sources as possible"], answer: 1 },
      { q: "A personal income map drawn before streams exist is:", options: ["Wishful thinking with no practical value", "Navigation — people who map their journey arrive at destinations that wanderers rarely reach", "Only appropriate for experienced entrepreneurs", "A financial planning document for your bank"], answer: 1 },
      { q: "Multiple income streams and Z2B:", options: ["Compete with each other", "Compound each other — adjacent streams reinforce the Z2B architecture", "Should not be built simultaneously", "Are only possible at Platinum tier"], answer: 1 },
    ],
  },
  {
    id: 24, free: false,
    title: "The Psychology of Money",
    subtitle: "Why Your Beliefs About Money Determine Your Financial Ceiling",
    content: `You will never out-earn your money psychology. You can receive a windfall and be broke again within months. You can learn every investment strategy and still sabotage yourself at the moment of execution. You can build a strong Z2B team and then unconsciously undermine it when it approaches income levels your subconscious has decided you do not deserve. This is not theory. It is observable pattern — in lottery winners who lose everything, in athletes who earn millions and retire penniless, and in network marketers who build to a certain point and then inexplicably stop.

Money psychology is the collection of beliefs, stories and emotional responses you have accumulated about money since childhood. Some were inherited from parents who lived through scarcity. Some were absorbed from a culture that equates wealth with greed. Some were formed by personal experiences of financial pain. All of them are operating invisibly beneath every financial decision you make.

**The 4 Most Common Money Beliefs That Limit Builders.** First: "Rich people are greedy." This belief makes wealth itself feel like a moral compromise — so you unconsciously self-sabotage as you approach it. Second: "I am not the kind of person who makes a lot of money." Identity-level beliefs are the deepest ceiling of all. Third: "It is selfish to want more than I need." This confuses greed with ambition and keeps builders playing small out of misplaced virtue. Fourth: "Money causes problems — relationships break down, people change." This makes part of you fear wealth because of what it might cost you socially and relationally.

**Rewiring the Story.** The Z2B morning sessions are in part a money psychology intervention — daily identity anchoring that replaces "I am an employee" with "I am an Entrepreneurial Consumer." But the deeper rewiring happens through exposure and experience. Every time you earn from your Z2B referral link and the world does not end — your money story updates. Every time you receive a commission and use it generously — you break the "wealth makes you greedy" narrative. Every time you upgrade your tier and your relationships survive — you disprove the "money changes you" fear. Transformation happens through repeated experience, not just intellectual understanding.

**Generosity as Financial Medicine.** The antidote to money fear is generosity. Not reckless generosity that creates new scarcity — but intentional, proportionate, joyful giving that demonstrates you are not controlled by money. The person who gives freely is demonstrating mastery over their financial psychology. And curiously, the generous tend to attract more — because their relationship with money is healthy, open-handed and not fearful.

[[MIRROR_MOMENT]]`,
    activity: "Write down 3 money beliefs you absorbed from your family or community growing up. For each one, write: Is this belief serving me? What evidence do I have that contradicts it? What belief would I choose to replace it with? You cannot change a belief you cannot see. This exercise makes the invisible visible.",
    questions: [
      { q: "Money psychology operates:", options: ["Only when you are consciously thinking about money", "Invisibly beneath every financial decision — shaped by inherited beliefs and past experiences", "Only in people with negative family backgrounds", "Only when you are under financial stress"], answer: 1 },
      { q: "Which belief creates a moral ceiling on wealth?", options: ["I do not have enough time", "'Rich people are greedy' — making wealth feel like a moral compromise", "I am working hard enough", "I need better investment advice"], answer: 1 },
      { q: "Z2B morning sessions function partly as:", options: ["Entertainment during commutes", "A money psychology intervention — daily identity anchoring that replaces limiting financial narratives", "A marketing strategy for recruitment", "A substitute for financial planning"], answer: 1 },
      { q: "Deep money psychology rewiring happens through:", options: ["Reading books about wealth", "Repeated experience that contradicts the limiting belief — earning, giving, upgrading and seeing the world continue normally", "A single breakthrough moment of insight", "Attending financial seminars"], answer: 1 },
      { q: "Generosity is described as financial medicine because:", options: ["It is a tax strategy", "It demonstrates mastery over money — an open-handed relationship that attracts rather than repels wealth", "It generates social media content", "It is required by the Z2B philosophy"], answer: 1 },
    ],
  },
  {
    id: 25, free: false,
    title: "Understanding Compensation Plans",
    subtitle: "How to Evaluate and Choose the Right Network Marketing Vehicle",
    content: `Not all compensation plans are created equal. The difference between a well-designed compensation plan and a poorly structured one can mean the difference between an income that compounds and one that plateaus — regardless of your effort. The Entrepreneurial Consumer does not accept any vehicle without first understanding the engine. And the compensation plan is the engine.

Before you recruit a single person into Z2B, or before you evaluate any network marketing opportunity you may encounter in the future, you need to be able to read a compensation plan fluently. This is not just about Z2B — it is about developing the literacy that protects you from predatory structures and positions you to maximise legitimate ones.

**The 5 Questions to Ask About Any Compensation Plan.** First: Where does the money come from? A legitimate plan pays commissions on actual product or service sales to real customers — not just on recruitment fees. Second: How many levels deep can I earn? Shallow plans (1–2 levels) limit your residual potential. Deep plans (8–10 levels) with meaningful percentages at each level compound powerfully. Third: Is there a fast-start bonus? QPB-style bonuses reward activity in the first 90 days and help new builders see income quickly. Fourth: Is there a retail profit component? The ability to earn on your own personal sales (ISP) independent of team building provides income stability. Fifth: Are the qualification thresholds reasonable? Plans that require enormous monthly personal purchases to qualify for commissions often benefit the company more than the builder.

**The Z2B Compensation Plan Evaluated.** Against these 5 questions: Z2B earns on Bronze membership sales (real product — personal development). TSC reaches 10 generations deep at meaningful rates (10%, 5%, 3%, 2%, 1%). QPB rewards fast activity in the first 90 days. ISP provides immediate retail profit from personal sales. Qualification thresholds are built into tier upgrades — not monthly purchase requirements. Six income streams total. No monthly fees for members. This is a well-structured plan.

**What to Watch For in the Market.** Be cautious of plans that: pay primarily on recruitment (not product sales), require large monthly personal consumption to qualify, have only 1–2 income levels, front-load income to those who join first with nothing for those who join later, or make income promises that require exponential recruitment to be mathematically possible. The Entrepreneurial Consumer develops discernment — using this literacy to protect themselves and those they invite.

[[MIRROR_MOMENT]]`,
    activity: "Apply the 5 evaluation questions to the Z2B compensation plan specifically. Write your answer to each question based on what you know about Z2B's structure. Then identify which income stream you are currently earning from, which you are actively building toward, and which represents your 2-year target.",
    questions: [
      { q: "A legitimate compensation plan earns primarily from:", options: ["Recruitment fees from new members joining", "Actual product or service sales to real customers", "Monthly subscription fees charged to builders", "Training course sales"], answer: 1 },
      { q: "Deep compensation plans (8-10 levels) are superior because:", options: ["They are more complicated and impressive", "They allow residual income to compound meaningfully across generations", "They require less personal effort", "They guarantee higher income"], answer: 1 },
      { q: "QPB-style fast-start bonuses serve the purpose of:", options: ["Benefiting the company primarily", "Helping new builders see income quickly during the critical first 90 days when motivation is highest", "Replacing TSC commissions", "Rewarding only senior builders"], answer: 1 },
      { q: "A warning sign in a compensation plan is:", options: ["Having more than 3 income streams", "Requiring large monthly personal purchases to qualify for commissions — benefiting the company more than the builder", "Offering retail profit on personal sales", "Having a fast-start bonus structure"], answer: 1 },
      { q: "The Z2B compensation plan is evaluated as well-structured because:", options: ["It is the most generous plan available", "It earns on real product sales, reaches 10 generations deep, rewards fast activity, provides retail profit, and has no monthly fees", "It guarantees income to all members", "It was designed by the most experienced compensation planners"], answer: 1 },
    ],
  },
  {
    id: 26, free: false,
    title: "Retail Profit — Your First Income Layer",
    subtitle: "Mastering the Foundation Before Building the Structure",
    content: `Every building needs a foundation. In Z2B, your ISP — Individual Sales Profit — is that foundation. Before you think about team building, TSC commissions, generational depth or Platinum awards, you must master the skill of personally facilitated sales. Not because ISP is the most lucrative income stream — it is not. But because the habits, communication skills, conversion mindset and rejection tolerance you develop through personal selling are the exact same capabilities your team will need to build. You cannot teach what you have not practised.

ISP is earned every time a person you have personally introduced to Z2B upgrades to Bronze or higher. At Bronze tier, you earn 18% of R480 — R86.40 per sale. At Silver, 25%. At Gold, 28%. At Platinum, 30%. These numbers may appear modest individually. But at 12 sales per month at Bronze tier — which is exactly what the 4:4:5:4:15% ratio produces — your monthly ISP is R1,036.80. From one income stream. Before QPB. Before TSC.

**The Sales Skills That ISP Builds.** Every conversion you facilitate teaches you something that cannot be learned from a book: how to identify the right prospect, how to read their readiness, how to time your invitation, how to handle their specific objections, and how to close without pressure. These skills compound. The builder who has facilitated 50 Bronze upgrades is not just more experienced — they are more effective per conversation. They waste less time on the wrong people and invest the right energy at the right moments.

**Retail Profit as Proof of Concept.** When you recruit a new builder, the first question they will have — usually unspoken — is: does this actually work? Your personal ISP record is your answer. Not a compensation plan presentation. Not a YouTube video. Your actual, documented record of conversions. "I have personally facilitated 7 Bronze upgrades in my first 4 weeks" is a sentence that converts sceptics faster than any slide deck. Your ISP performance is your most credible recruitment asset.

**The Foundation Before the Structure.** Build your ISP first. Run your ratio. Generate your 12 conversions per month consistently before you obsess over duplication and TSC. Once your personal conversion machine is running — then you duplicate it. A builder who tries to build a team without a working personal sales process is building walls without a foundation. It looks impressive briefly. Then it collapses.

[[MIRROR_MOMENT]]`,
    activity: "Calculate your current ISP performance. How many Bronze upgrades have you personally facilitated since joining? What is your conversion rate (upgrades divided by total sign-ups)? What would 12 conversions per month mean for your monthly income at your current tier? This is your personal sales baseline — the number to beat every month.",
    questions: [
      { q: "ISP is called the foundation income stream because:", options: ["It pays the most", "The skills developed through personal selling are the same capabilities your team needs — you cannot teach what you have not practised", "It is the easiest to earn", "It is only available at higher tiers"], answer: 1 },
      { q: "At Bronze tier, 12 monthly conversions generates ISP of:", options: ["R480", "R1,036.80 (12 × R480 × 18%)", "R5,760", "R2,000"], answer: 1 },
      { q: "The sales skills ISP develops include:", options: ["Investment analysis and financial modelling", "Prospect identification, timing, objection handling and closing without pressure", "Social media advertising techniques", "Corporate presentation skills"], answer: 1 },
      { q: "Your personal ISP record functions as:", options: ["A legal compliance requirement", "Your most credible recruitment asset — documented proof that the system works", "An internal accounting metric only", "A qualification requirement for higher tiers"], answer: 1 },
      { q: "The sequence for building Z2B income should be:", options: ["Build a large team first, then learn personal sales", "Master personal ISP first, then duplicate that working process into your team", "Focus on TSC from the beginning", "Skip ISP and go straight to QPB"], answer: 1 },
    ],
  },
  {
    id: 27, free: false,
    title: "Team Building Basics",
    subtitle: "How to Invite Without Being Pushy or Desperate",
    content: `The single greatest mistake new Z2B builders make is approaching their network with the energy of someone who needs the yes. When you need the yes — because you are behind on a QPB target, because you promised yourself 5 recruits this month, because you are watching your leaderboard position — the person in front of you can sense it. Desperation has a smell. It pushes people away at exactly the moment you need them to come closer.

The solution is not to become indifferent to results. It is to become so genuinely invested in the person in front of you that your energy is about them — not about your target. The best invitation is a generous act. You are not asking someone to help your numbers. You are offering them access to something that changed your thinking, because you believe it might change theirs.

**The Two Invitation Mistakes.** Mistake 1: Information Overload. You share the entire compensation plan, the 99-session workshop structure, the 6 income streams, the TSC generations and the QPB qualification before the person has expressed any genuine interest. You have turned an invitation into a presentation. Nobody wants to be presented at. They want to be seen, understood and offered something relevant. Mistake 2: Pressure Follow-Up. Contacting someone repeatedly because you need their answer is not follow-up — it is harassment. The 9-Day Nurture Engine exists precisely to handle systematic follow-up on your behalf. Your personal contact should add warmth and relevance — not pressure and repetition.

**The Invitation Formula.** Step 1: Identify specifically why this particular person might benefit from the workshop — not Z2B in general, but them specifically. Step 2: Share one genuine thing from your own journey that is relevant to their specific situation. Step 3: Offer the free workshop as a no-commitment entry point. Step 4: Send your referral link. Step 5: Let the system do the rest. Your role after step 4 is to be available, warm and patient — not pushy.

**Building With the Right Energy.** The builders who create the largest teams are rarely the most aggressive recruiters. They are the most genuine sharers. They post from real transformation. They invite from real care. They follow up from real interest in the person. That energy is contagious — it creates a community that others want to join. And a community people want to join recruits itself.

[[MIRROR_MOMENT]]`,
    activity: "Think about the last 3 people you invited to Z2B or considered inviting. For each one, answer honestly: Was your energy about them (what would this do for their specific situation?) or about you (I need to hit my target)? If the answer is 'about me' for any of them, reframe the invitation before sending it.",
    questions: [
      { q: "Desperation in the invitation process:", options: ["Motivates prospects to join quickly", "Pushes people away — it communicates need rather than value", "Is normal and expected in network marketing", "Only affects the inviter, not the prospect"], answer: 1 },
      { q: "The best invitation energy is:", options: ["Urgency and excitement about the income potential", "Genuine investment in the specific person — focused on what this would do for them", "Confidence in the compensation plan's superiority", "Persistence until you get a yes"], answer: 1 },
      { q: "Information overload as an invitation mistake means:", options: ["Sharing too little about Z2B", "Presenting everything before the person has expressed genuine interest — turning an invitation into a presentation", "Using too many social media platforms", "Following up too frequently"], answer: 1 },
      { q: "The Invitation Formula's final step is:", options: ["Demand an answer within 48 hours", "Call daily until they respond", "Let the system handle follow-up — your role is to be available, warm and patient", "Share the compensation plan in detail"], answer: 1 },
      { q: "The largest Z2B teams are built by:", options: ["The most aggressive recruiters", "The most genuine sharers — posting from real transformation and inviting from real care", "The builders who hit QPB every month", "Those who spend the most on advertising"], answer: 1 },
    ],
  },
  {
    id: 28, free: false,
    title: "The Art of the Invitation",
    subtitle: "Scripts and Frameworks for Expanding Your Circle",
    content: `An invitation is a gift. Not every gift is accepted. But that does not make the giving wrong — it makes the receiving the prospect's responsibility, not yours. When you understand this, the fear of rejection dissolves. You are not being rejected. Your gift is being declined. These are different things. And the quality of the gift — the honesty, the relevance, the specificity — is entirely within your control regardless of whether it is received.

Scripts are tools, not identities. The builders who use scripts most effectively are those who understand the principle behind the script — and then speak from that principle in their own words. A script that sounds scripted fails. A principle spoken from genuine conviction succeeds. The Content Studio's 13 pre-written scripts are frameworks — starting points that your voice, your story and your specific relationship with the prospect should transform into something authentic.

**The Four Invitation Contexts.** Context 1: Cold Audience (social media). You are speaking to people who do not know you personally. Hook with a problem they recognise. Body with a principle that challenges their thinking. CTA with the free workshop link. No mention of income. No mention of Z2B yet. Let curiosity do the work. Context 2: Warm Audience (people who engage with your content). They have already shown interest. A direct but low-pressure personal message: "I noticed you engaged with my post about [topic]. I thought you might find the free workshop valuable — no cost, no pressure, just 9 sessions that changed how I think about [problem]. Here is my link if you want to explore." Context 3: Known Contact (friends, colleagues, family). Be direct about your personal journey. Do not pitch — share. "I have been doing something that has shifted how I think about [area]. I genuinely think you would find value in it. Can I send you something to look at?" Context 4: Re-engagement (people who registered but did not upgrade). The WhatsApp Launcher scripts are designed for Day 6 and Day 9. Use them exactly as they are. They were written for precisely this context.

**The Follow-Up Principle.** One follow-up after initial invitation is appropriate and expected. Two follow-ups suggest enthusiasm. Three follow-ups border on pressure. After three contacts with no response, the prospect has communicated their current readiness. File them in your pipeline as Long Term and let the nurture engine keep them warm. People's readiness changes. Your job is not to force a season — it is to be present when the season arrives.

[[MIRROR_MOMENT]]`,
    activity: "Write one invitation message for each of the 4 contexts described in this session: one for a cold social media audience, one for a warm engaged follower, one for a specific known contact, and one re-engagement message for someone who registered but has not upgraded. You now have 4 ready-to-use personalised invitations.",
    questions: [
      { q: "Scripts are described as:", options: ["The exact words you must memorise and deliver", "Tools and frameworks — starting points that your voice, story and genuine conviction must transform into something authentic", "Only for beginners who cannot think for themselves", "Marketing materials created by the Z2B team only"], answer: 1 },
      { q: "For a cold social media audience, the invitation approach is:", options: ["Immediately explain the compensation plan and income potential", "Hook with a recognisable problem, body with a challenging principle, CTA with the free workshop — no income mention yet", "Ask them to join immediately", "Share your tier and earnings record"], answer: 1 },
      { q: "Re-engagement of registered non-upgraders should be:", options: ["Done with urgency and a deadline offer", "Handled via the WhatsApp Launcher Day 6 and Day 9 scripts — written specifically for this context", "Abandoned after one failed contact", "Done through a group message to all inactive prospects simultaneously"], answer: 1 },
      { q: "After three follow-up contacts with no response:", options: ["Keep following up daily", "File the prospect as Long Term and let the nurture engine keep them warm — readiness changes with time", "Remove them from your pipeline permanently", "Ask a senior builder to contact them for you"], answer: 1 },
      { q: "The fear of rejection in invitations dissolves when you understand:", options: ["Not everyone is qualified for Z2B", "You are giving a gift — whether it is received is the prospect's responsibility, not yours", "Rejection means your invitation was poorly written", "Some people are simply not worthy of the invitation"], answer: 1 },
    ],
  },
  {
    id: 29, free: false,
    title: "Handling Objections With Confidence",
    subtitle: "Turning 'No' Into a Navigation Tool",
    content: `An objection is not a rejection. An objection is a question wearing a disguise. When someone says "it sounds too good to be true," they are asking: "Is this legitimate and can I trust you?" When they say "I don't have time," they are often asking: "Is this worth the time I would have to rearrange to accommodate it?" When they say "network marketing never works," they are asking: "How is this different from the bad experiences I have heard about?" Your job is to hear the question beneath the objection and answer that — not the surface statement.

Confident objection handling comes from genuine knowledge and authentic experience. You cannot fake certainty. But when you have completed your workshop sessions, run your pipeline, earned your first ISP commissions and experienced the system working — you speak from a place of grounded evidence. That groundedness is what handles objections better than any rehearsed rebuttal.

**The 5 Most Common Z2B Objections and Their Underlying Questions.** "It sounds like a pyramid scheme" — underlying question: Is this legal and legitimate? Answer: Z2B earns on personal development product sales, not on recruitment fees. The compensation is attached to real value exchange. "I don't have money to join" — underlying question: Is R480 a risk worth taking? Answer: R480 is one meal at a restaurant. The free workshop requires nothing. Start there. "I don't have time" — underlying question: Would the return justify rearranging my schedule? Answer: The ratio requires 4 social media posts per day. Most people scroll that long doing nothing. "I tried something like this before and it didn't work" — underlying question: Why would this be different? Answer: Ask what specifically did not work. Usually it was either the product, the system, the support or the commitment. Address the specific failure, not the general category. "I'm not a salesperson" — underlying question: Do I have to pressure people? Answer: You are not selling. You are sharing what moved you. The system follows up. You just need to be authentic.

**The Acknowledge-Reframe-Invite Method.** Step 1: Acknowledge — "I completely understand that concern." Step 2: Reframe — offer the truthful perspective that addresses the underlying question. Step 3: Invite — return to a low-pressure entry point: "Would you be open to just completing the first 3 free workshop sessions? No commitment after that required." Most objections dissolve when the entry barrier is low enough and the trust level is high enough.

[[MIRROR_MOMENT]]`,
    activity: "Write down the 3 objections you have personally heard most frequently (or that you yourself had before joining). For each one, write: What is the underlying question this objection is really asking? What is your honest, grounded answer? Practice saying it aloud until it sounds natural rather than rehearsed.",
    questions: [
      { q: "An objection is defined as:", options: ["A final decision not to join", "A question wearing a disguise — an expression of concern that reveals an underlying need for reassurance", "Evidence that the prospect is the wrong person to invite", "A hostile response to your invitation"], answer: 1 },
      { q: "The most effective objection handling comes from:", options: ["Memorised rebuttals and scripted responses", "Genuine knowledge and authentic experience — speaking from grounded evidence, not rehearsed certainty", "Persistence until the prospect gives up their objection", "Involving your upline in every difficult conversation"], answer: 1 },
      { q: "'I don't have time' as an objection is really asking:", options: ["Whether to join immediately", "Whether the return justifies rearranging a schedule — whether this is worth the time investment", "For a deadline extension", "Whether the workshop can be done faster"], answer: 1 },
      { q: "The Acknowledge-Reframe-Invite method ends with:", options: ["A closing pressure statement and a deadline", "A return to a low-pressure entry point — inviting them to complete the first 3 free sessions with no further commitment", "A request for a yes or no decision immediately", "Sharing your income figures"], answer: 1 },
      { q: "'I'm not a salesperson' is addressed by:", options: ["Agreeing that sales skills are required", "Clarifying that you are sharing what moved you — not selling, with the system handling follow-up automatically", "Recommending they develop sales skills first", "Suggesting they join at FAM tier only"], answer: 1 },
    ],
  },
  {
    id: 30, free: false,
    title: "Leadership vs Management",
    subtitle: "Why the Entrepreneurial Consumer Must Develop Leaders, Not Dependents",
    content: `Management maintains a system. Leadership transforms people. A manager ensures tasks are completed, standards are met and processes are followed. A leader shapes the thinking of those around them so that the tasks, standards and processes become internal — no longer requiring enforcement. In network marketing, the difference between management and leadership is the difference between a team that requires your daily attention and one that expands in your absence.

Most builders unknowingly start as managers of their team. They check on people daily. They push activity. They remind builders to post. They monitor pipelines. This feels productive — and in the early days, it is necessary. But a team built on management never scales. The moment the manager looks away, the activity stops. The income is tethered to the manager's attention. This is not a business. It is a supervised task.

**The Transition From Manager to Leader.** The leadership transition happens when you shift your primary question from "Are they doing the tasks?" to "Do they understand why the tasks matter?" A builder who posts because you reminded them is managed. A builder who posts because they have internalised the Purple Cow principle and their own transformation story is led. The difference in outcomes is enormous — and it is created by the quality of your coaching conversations, not the frequency of your check-in messages.

**Developing Leaders in Your Circle.** Leadership development in Z2B means: walking your G1 team through the workshop sessions yourself so they develop the philosophical foundation, not just the tactical skills. It means asking coaching questions — "What from this session changed how you see your situation?" — rather than giving instructions. It means celebrating thinking improvements, not just activity metrics. It means gradually transferring authority — letting your G1 team make their own decisions, make their own mistakes and develop their own voice.

**The Dependence Trap.** Some builders inadvertently create dependents — team members who need their upline's approval for every action, who cannot send a WhatsApp without checking the script first, who feel incapable of recruiting without being carried. This feels supportive — but it is actually disempowering. The greatest act of leadership is to make yourself unnecessary at the task level while remaining deeply relevant at the vision and culture level.

[[MIRROR_MOMENT]]`,
    activity: "Evaluate your current leadership style with each person in your first-generation team. For each person: Are they doing the tasks because you reminded them (managed) or because they have internalised the reason (led)? What would one conversation look like that moves them from task-compliance toward philosophical ownership? Plan and have that conversation this week.",
    questions: [
      { q: "Management differs from leadership in that:", options: ["Management is more valuable than leadership", "Management maintains tasks through enforcement; leadership transforms thinking so tasks become internally motivated", "Management is for beginners; leadership is only for senior builders", "Management is about people; leadership is about systems"], answer: 1 },
      { q: "A team built on management never scales because:", options: ["Management is too expensive to maintain", "The moment the manager looks away, the activity stops — the income is tethered to the manager's attention", "Management cannot handle large teams", "Managers are not paid enough for their effort"], answer: 1 },
      { q: "The leadership transition happens when you shift your question from:", options: ["'Are they earning enough?' to 'Are they in the right tier?'", "'Are they doing the tasks?' to 'Do they understand why the tasks matter?'", "'Are they posting?' to 'Are they hitting their QPB?'", "'Are they active?' to 'Are they growing their team?'"], answer: 1 },
      { q: "The dependence trap occurs when:", options: ["Builders become too independent too quickly", "A team member requires upline approval for every action — disempowered by over-support rather than developed by coaching", "A builder outgrows their sponsor's capabilities", "Team members develop their own voice too early"], answer: 1 },
      { q: "The greatest act of leadership is:", options: ["Being available 24/7 for your team", "Making yourself unnecessary at the task level while remaining relevant at the vision and culture level", "Having the largest team in your organisation", "Recruiting the most people personally"], answer: 1 },
    ],
  },
  {
    id: 31, free: false,
    title: "Building Duplication Systems",
    subtitle: "How to Create an Organisation That Grows Without You Doing Everything",
    content: `Duplication is the word that separates network marketing from every other income model. It is also the most misunderstood concept in the industry. Most people think duplication means teaching others to do exactly what you do. It does — but only if what you do is simple enough to be exactly reproduced. The sophistication of your personal process is inversely proportional to how well your team can copy it.

This is the great discipline of duplication: the builder must be willing to reduce what works for them personally into the simplest possible form — so that someone with no experience, no confidence and no background can execute a version of it on their first day. If the bar is too high, nobody clears it. If the bar is appropriately low, everyone clears it — and the team moves.

**What Must Be Duplicated.** The 4:4:5:4:15% ratio. The workshop session habit (morning and evening). The referral link sharing practice. The WhatsApp Launcher use at Day 6 and Day 9. The pipeline review rhythm. These five activities, done consistently by every builder in your team, produce the results. Not your personality. Not your writing skill. Not your social media following. The system, faithfully executed by ordinary people, produces extraordinary collective results.

**Your Duplication Checklist for Every New Builder.** Week 1: they understand the ratio and have posted at least once. Week 2: their referral link is live and they have shared it with at least 3 people. Week 3: they have used the WhatsApp Launcher at least once. Week 4: they have had their first pipeline review with you. Month 2: they are coaching their own first prospect. If a new builder completes this 8-week onboarding, they are duplicated — not dependent on your continued hand-holding.

**Simple Beats Sophisticated Every Time.** The most successful network marketing organisations in history were not built on complex training programmes. They were built on one or two simple activities, repeated by many people, over a long time. Simplicity scales. Sophistication stagnates. Design your duplication system with this principle as the non-negotiable constraint.

[[MIRROR_MOMENT]]`,
    activity: "Create a simple one-page duplication checklist for a brand new Bronze builder joining your team. It should cover the first 4 weeks. Each week should have no more than 2 specific activities. Make it so simple that someone who has never built a business before could follow it without asking you a single question. That simplicity is your duplication standard.",
    questions: [
      { q: "Duplication means:", options: ["Teaching others your exact personal style and personality", "Reducing what works into its simplest possible form so that anyone can execute a version of it", "Recruiting as many people as possible quickly", "Only advanced builders training their teams"], answer: 1 },
      { q: "A builder's personal sophistication affects duplication because:", options: ["Sophisticated processes produce better results", "The more sophisticated the process, the harder it is for an inexperienced new builder to copy it", "Sophistication inspires confidence in new builders", "It has no effect on duplication"], answer: 1 },
      { q: "The 5 activities that must be duplicated in Z2B are:", options: ["Social media management, email marketing, SEO, paid ads, networking", "The ratio, workshop sessions, referral link sharing, WhatsApp Launcher use, pipeline review", "Compensation plan presentation, team meetings, monthly calls, recognition, awards", "Product knowledge, pricing, objection handling, closing, follow-up"], answer: 1 },
      { q: "Simple beats sophisticated in duplication because:", options: ["Simple things are easier for the leader to teach", "Simplicity scales — sophisticated processes stagnate because few people can execute them consistently", "Simple activities require less time", "Sophisticated builders prefer simple systems"], answer: 1 },
      { q: "A new builder is considered duplicated when:", options: ["They have recruited 4 people", "They have completed the 8-week onboarding and are coaching their own first prospect independently", "They achieve Bronze tier", "They have earned their first ISP commission"], answer: 1 },
    ],
  },
  {
    id: 32, free: false,
    title: "Personal Branding for Builders",
    subtitle: "Why You Are the Brand Before the Product Is",
    content: `Before your prospect decides whether to sign up for the free workshop, before they evaluate the compensation plan, before they decide whether Z2B is legitimate — they decide whether they trust you. Not the company. Not the product. You. In the digital economy, personal brand is the first currency exchanged in every commercial relationship. And the Entrepreneurial Consumer who understands this builds their personal brand as deliberately as they build their income streams.

Personal brand is not a logo. It is not a colour palette. It is not a perfectly curated Instagram feed. It is the consistent answer to one question: when someone thinks of you, what do they think? What do they associate you with? What problem do you solve? What perspective do you carry? What transformation do you represent? The clarity of that answer in the mind of your audience is your personal brand.

**The 3 Foundations of a Z2B Builder's Personal Brand.** First: Your Transformation Story. The before-and-after of your EC journey is your brand origin story. It is what separates you from every other Z2B builder — because nobody else has your specific experience of the shift. Own it. Tell it often. Evolve it publicly as you grow. Second: Your Consistent Presence. A brand is built through repetition. Not perfection — but presence. Showing up weekly with your referral link in your bio, posting from genuine session insights, engaging honestly with your community. Inconsistency is the brand killer. Third: Your Specific Audience. The builder who speaks to everyone speaks to no one. Who specifically do you want at your table? Employed professionals? Faith community members? Recent graduates? Young parents? The more specific your audience, the more resonant your content and the more effective your invitation.

**Your Brand Precedes Your Recruitment.** The strongest Z2B builders rarely have to recruit in the traditional sense. Their brand does the recruiting for them. People who have followed their journey for 3 months already understand the EC philosophy before any conversation happens. The sign-up is almost a formality by the time the referral link is shared. This is the compound effect of personal brand: it pre-sells the conversation before the conversation begins.

[[MIRROR_MOMENT]]`,
    activity: "Write your personal brand statement in one sentence: 'I help [specific audience] [achieve specific transformation] through [your unique approach/story/method].' Then evaluate your last 5 social media posts against this statement. Are they consistent with who you say you are and who you say you serve? The gap between the statement and the posts is your brand work.",
    questions: [
      { q: "Personal brand is primarily:", options: ["A professional logo and visual identity", "The consistent answer to: when someone thinks of you, what do they think — what transformation do you represent?", "The number of social media followers you have", "The quality of your professional photography"], answer: 1 },
      { q: "The 3 foundations of a Z2B builder's personal brand are:", options: ["Product knowledge, compensation understanding, recruitment skills", "Transformation story, consistent presence, specific audience definition", "Social media followers, post frequency, engagement rate", "Tier level, team size, monthly income"], answer: 1 },
      { q: "Inconsistency is described as the brand killer because:", options: ["Inconsistent builders earn less money", "Brand is built through repetition — inconsistency prevents the association that makes you trustworthy and memorable", "Inconsistent posting violates social media algorithms", "Inconsistency signals low quality to prospects"], answer: 1 },
      { q: "The strongest Z2B builders rarely recruit in the traditional sense because:", options: ["They pay for advertising", "Their personal brand pre-sells the conversation — people already understand the EC philosophy before any direct conversation happens", "They have access to special recruitment tools", "Their team recruits for them exclusively"], answer: 1 },
      { q: "Speaking to a specific audience rather than everyone:", options: ["Limits your potential reach", "Increases resonance — specific content connects more deeply than general content, producing more engaged sign-ups", "Is only appropriate for experienced builders", "Reduces your income potential"], answer: 1 },
    ],
  },
  {
    id: 33, free: false,
    title: "Content Creation for Non-Creators",
    subtitle: "How AI Removes Every Excuse for Not Showing Up Online",
    content: `The most common reason Z2B builders give for not posting consistently is: "I don't know what to say." The second most common is: "I don't know how to make it look professional." The third is: "I'm afraid of what people will think." All three objections have been neutralised. The first two by Coach Manlaw and the Content Studio. The third requires nothing but a decision.

Content creation is not a talent. It is a discipline. Some people express ideas more naturally than others — but the ability to show up consistently, to translate what you are learning into something shareable, and to do so repeatedly over months and years — that is habit and decision, not gift. And it is the habit that creates the compound effect of personal brand.

**Your Workshop as Your Content Source.** The Z2B workshop is not just a development programme — it is a content engine. Every morning session gives you a thought to share. Every evening session gives you an activity result or a mirror moment insight. Every comprehension question you answer reveals something about your current thinking. Every shift you experience is a potential post. You do not need to invent topics. You need to harvest what is already growing in your daily workshop practice.

**The Coach Manlaw Content Studio Workflow.** When you are stuck: open the Content Studio, select your platform (TikTok, Facebook, WhatsApp, YouTube), describe your topic (drawn from your last session), and let Manlaw generate a draft. The draft is a starting point — not the final product. Read it, find the sentences that sound like you, remove what sounds generic, add your specific language and your real story detail. Five minutes of personalisation turns AI content into authentic content.

**The Permission to Be Imperfect.** The builders who grow the fastest are not the most polished. They are the most consistent. A slightly shaky TikTok posted today beats a perfectly produced video posted never. A genuine WhatsApp status from your real workshop experience beats a copywriter's perfect caption. Your audience is not evaluating your production quality — they are evaluating your authenticity. And authenticity is something you already possess. No tool can give it to you. But every tool can amplify it.

[[MIRROR_MOMENT]]`,
    activity: "Commit to a 7-day content challenge. Every day for the next 7 days, post one piece of content drawn directly from your workshop session that day. It can be a quote, a reflection, a question, a before-and-after thought, or a full video. No days off. At the end of 7 days, review what you posted and notice: which piece got the most engagement? What does that tell you about your audience?",
    questions: [
      { q: "Content creation is described as:", options: ["A natural talent that some people are born with", "A discipline — the habit of showing up consistently, translating learning into shareable form, repeatedly over time", "Only possible with professional equipment", "A skill requiring formal training"], answer: 1 },
      { q: "The Z2B workshop functions as a content engine because:", options: ["It provides pre-written social media posts", "Every session generates insights, activity results and mirror moments that can be directly translated into authentic content", "It includes a marketing module", "It gives builders a script for every platform"], answer: 1 },
      { q: "The Coach Manlaw Content Studio workflow produces:", options: ["Final content ready to post immediately", "A draft starting point — personalised by adding your specific language and real story detail to turn AI content into authentic content", "Only TikTok content", "Pre-approved corporate messaging"], answer: 1 },
      { q: "The builders who grow fastest are:", options: ["The most polished and professionally produced", "The most consistent — showing up repeatedly with authentic content beats occasional perfect production", "Those with the largest existing social media following", "Those who spend the most on content creation tools"], answer: 1 },
      { q: "Your audience evaluates your content primarily on:", options: ["Production quality and visual aesthetics", "Authenticity — the genuine evidence of your real transformation and honest perspective", "The number of hashtags you use", "Whether you post at optimal algorithm times"], answer: 1 },
    ],
  },
  {
    id: 34, free: false,
    title: "Video Marketing for Builders",
    subtitle: "Why the Camera Is Your Most Powerful Recruitment Tool",
    content: `Video is the highest-trust content format available to a Z2B builder. Text can be copied from anyone. An image can be staged. But a video of a real person speaking from genuine experience — with their own voice, their own expressions, their own energy — communicates authenticity in a way that no other format can replicate. And trust, as we have established throughout this workshop, is the single most valuable currency in the invitation economy.

The fear of being on camera is universal. Almost nobody feels comfortable on video when they first start. The difference between the builder who overcomes this fear and the builder who does not is not confidence — it is decision. You decide to post the imperfect video anyway. Then you do it again. Then again. By the 20th video, the fear is gone. By the 50th, you cannot imagine why it was ever there.

**The 4 Video Formats That Work for Z2B Builders.** Format 1: Transformation Story (60–90 seconds). You on camera, speaking directly to your audience, sharing your before-and-after EC journey. This is your most powerful recruiting video — post it and leave it permanently visible. Format 2: Workshop Insight (30–60 seconds). "I just completed Session [X] of the Z2B workshop and this one thing changed how I see [specific aspect of the session]. Link in bio." No sales pitch. Pure value. Format 3: Day-in-the-Life (60 seconds). Morning session, pipeline check, first post — showing the daily discipline of an Entrepreneurial Consumer. Format 4: Direct Invite (30 seconds). Looking straight at the camera: "If you are an employee who is tired of the gap between your income and your life — this free workshop is for you. No cost. No pressure. Just the beginning. Link in my bio." Specific. Direct. Honest.

**Technical Minimums That Are Enough.** Good lighting (face a window), clear audio (quiet room, speak close to your phone), stable shot (lean phone against something or use a R50 phone stand), vertical orientation (9:16 for TikTok, Reels and Stories). That is everything you need. The message matters more than the studio.

[[MIRROR_MOMENT]]`,
    activity: "Film one video today. It does not have to be perfect. It does not have to be long. It can be a 30-second direct invite, a 60-second workshop insight, or anything from the 4 formats above. Film it, watch it once (resist the urge to delete it), make one small improvement if necessary, and post it. The first video is the hardest. Do it today.",
    questions: [
      { q: "Video is described as the highest-trust content format because:", options: ["It gets more algorithm reach", "A real person speaking from genuine experience communicates authenticity in a way no other format can replicate", "It is more expensive to produce", "It requires no writing skills"], answer: 1 },
      { q: "The difference between builders who overcome camera fear and those who don't is:", options: ["Natural confidence and extroversion", "Decision — choosing to post the imperfect video anyway and doing it repeatedly until the fear dissolves", "Professional training in presenting", "Having a high-quality camera"], answer: 1 },
      { q: "The Transformation Story video format is described as:", options: ["Best for daily posting", "Your most powerful recruiting video — a direct before-and-after EC journey account that should remain permanently visible", "Only appropriate for experienced builders", "A replacement for the compensation plan presentation"], answer: 1 },
      { q: "Technical minimums for video that are sufficient include:", options: ["Professional lighting rig, DSLR camera, external microphone, video editing software", "Good natural lighting, clear audio, stable phone, vertical orientation — nothing more is required", "A professional studio environment", "Post-production editing and colour grading"], answer: 1 },
      { q: "The first video is described as:", options: ["The most important video you will make", "The hardest — do it today despite imperfection, because every subsequent video becomes easier", "Something to delay until you are fully confident", "Only necessary once you have 100 followers"], answer: 1 },
    ],
  },
  {
    id: 35, free: false,
    title: "WhatsApp as a Business Platform",
    subtitle: "Structuring Your Messaging App Into a Revenue Engine",
    content: `WhatsApp is the most powerful sales tool available to a Z2B builder in the community-oriented market context. It is personal without being intrusive. It is immediate without being demanding. It operates in the same space where your prospects already spend significant daily time — making it a native environment for relationship-based selling. And it is free. This combination — personal, immediate, native, free — makes WhatsApp a platform that sophisticated paid advertising cannot easily replicate.

The key to WhatsApp as a business platform is structure. An unstructured WhatsApp presence is just personal messaging. A structured one is a distribution system, a nurture channel, a sales conversation platform and a community hub — all simultaneously.

**The 5 WhatsApp Business Assets to Build.** Asset 1: Your Profile — professional photo, business bio that includes your EC identity and referral link, status that is always updated. Asset 2: Your Status — daily content that mirrors your social media posts. Status reaches your existing contacts passively — they see it while checking other statuses. A daily workshop insight status is your cheapest and most consistent marketing. Asset 3: Your Broadcast Lists — segmented lists for different audiences: prospects, active builders, inactive contacts. Broadcasts go to everyone on the list simultaneously but appear as individual messages. Asset 4: Your WhatsApp Launcher Scripts — the 4 pre-written Z2B scripts in your Content Studio for Day 1, Day 3, Day 6 and Day 9 follow-up. Asset 5: Your Business Contacts — every person whose number you have is a potential relationship. Not every conversation leads to a business outcome. But every authentic conversation adds to your relationship capital.

**The WhatsApp Conversation Rhythm.** Not every WhatsApp interaction is an invitation. Most should not be. Build the relationship first. Share value. Ask genuine questions about their life. When the moment is right — when they mention a financial frustration, a career concern, a desire for something different — that is when the invitation becomes natural. The hard-sell WhatsApp is a relationship destroyer. The value-first WhatsApp is a trust builder. Trust builds income.

[[MIRROR_MOMENT]]`,
    activity: "Audit your WhatsApp business presence today. Check: Does your profile picture look professional and warm? Does your bio include your EC identity and referral link? When did you last update your WhatsApp Status with something of value? Do you have broadcast lists set up? Rate each of these on a scale of 1-5 and identify the one to improve first.",
    questions: [
      { q: "WhatsApp is described as Z2B's most powerful sales tool because:", options: ["It has the most users globally", "It is personal, immediate, native to your audience's daily habits, and free — a combination paid advertising cannot replicate", "It allows automated messaging", "It is the only platform with voice note capability"], answer: 1 },
      { q: "WhatsApp Status is valuable for Z2B builders because:", options: ["It generates viral content automatically", "It reaches existing contacts passively — they see your daily workshop insight while checking other statuses, without requiring them to follow you", "It is seen by the algorithm and boosted to new audiences", "It is more permanent than other social media posts"], answer: 1 },
      { q: "Broadcast lists differ from group messages because:", options: ["They are only available on WhatsApp Business", "They go to everyone simultaneously but appear as individual personal messages — maintaining the personal feel of 1:1 communication", "They can only include 10 people", "They require everyone's permission to receive"], answer: 1 },
      { q: "The WhatsApp conversation rhythm for building trust is:", options: ["Lead every conversation with the compensation plan", "Build the relationship first through value and genuine interest — introduce the invitation when a relevant moment arises naturally", "Send the referral link in the first message", "Follow up daily until you get a response"], answer: 1 },
      { q: "The hard-sell WhatsApp approach is:", options: ["Efficient for reaching many people quickly", "A relationship destroyer — authentic, value-first conversation is what converts, not pressure", "Standard practice in network marketing", "Effective for cold audiences"], answer: 1 },
    ],
  },
  {
    id: 36, free: false,
    title: "Facebook Strategy for Builders",
    subtitle: "Organic Growth Systems That Don't Require an Advertising Budget",
    content: `Facebook is often underestimated by younger builders who associate it with an older demographic. But Facebook's user base in Africa — across the age range most relevant to Z2B's target audience of employed professionals — remains enormous, active and underserved by authentic EC content. The platform's group functionality, long-form content support and relatively lower competition for organic reach make it one of the highest-value platforms for a Z2B builder willing to invest consistent effort.

The key word is organic. You do not need a paid advertising budget to build significant Facebook reach. Organic Facebook growth is slower than paid — but it produces higher-quality leads because the people who find you through genuine content are self-selected for interest. They showed up because of something real you said. That alignment makes them more likely to convert.

**The 4-Part Facebook Organic Strategy.** Part 1: Personal Profile as Your Hub. Your Facebook personal profile is your most visible digital presence — it is what appears when people search your name. It should clearly communicate who you are, what transformation you represent, and how to access your workshop link. Your cover photo and profile picture should be professional and warm. Your bio should include your EC identity. Part 2: Long-Form Storytelling Posts. Facebook supports longer posts than TikTok or Instagram. This is an advantage for the EC builder. A 300-word post about the moment your thinking shifted — told honestly and specifically — can drive significant organic reach because people share stories, not advertisements. Part 3: Facebook Groups. The most effective Facebook organic strategy involves finding and engaging authentically in groups where your specific audience spends time: employed professionals, side hustle seekers, faith-based business groups, parenting communities. Value-first engagement in these groups — not promotion — builds visibility and credibility. Part 4: Consistent Posting Rhythm. Three posts per week minimum. One transformation story, one educational principle from your workshop, one direct but low-pressure invite. That rhythm, sustained for 90 days, builds an audience.

**Facebook and Your Referral Link.** Never post your referral link without context. A link posted in isolation is ignored or reported as spam. A link embedded in a genuine story — "I spent three sessions this week on the Z2B workshop and this one concept from Session 12 completely changed how I see AI in my business. If you're curious about what changed my mind, here's where to start:" — gets clicked.

[[MIRROR_MOMENT]]`,
    activity: "Conduct a Facebook audit. Open your personal profile and view it as a stranger would. Does it communicate your EC identity? Is your most recent post something that builds trust with someone who does not know you? Is your referral link accessible? Now write one long-form storytelling post for Facebook — a specific moment in your EC journey, told honestly. Schedule it to post today.",
    questions: [
      { q: "Facebook is underestimated by Z2B builders because:", options: ["It has declined in all markets", "It is associated with an older demographic — but its user base in Africa among employed professionals remains enormous and underserved by authentic EC content", "It is too expensive to advertise on", "Its algorithm prevents organic reach"], answer: 1 },
      { q: "Organic Facebook leads are described as higher quality because:", options: ["They are cheaper to acquire", "They self-selected by engaging with genuine content — the alignment makes them more likely to convert than cold paid traffic", "Organic reach is faster than paid", "Facebook's algorithm prioritises organic content"], answer: 1 },
      { q: "Long-form storytelling posts work on Facebook because:", options: ["Facebook's algorithm rewards longer posts", "People share stories, not advertisements — and Facebook's format supports the depth required for an honest EC story", "They are easier to write than short posts", "They get more comments than short posts"], answer: 1 },
      { q: "The most effective Facebook group strategy involves:", options: ["Posting your referral link in every relevant group", "Value-first engagement — genuine contribution to group conversations that builds visibility and credibility without direct promotion", "Creating your own Facebook group immediately", "Asking group administrators for promotional permission"], answer: 1 },
      { q: "Your referral link gets clicked on Facebook when:", options: ["It is posted frequently in multiple locations", "It is embedded in a genuine story that provides context and earns the click through interest rather than requesting it directly", "It is accompanied by an income claim", "It is boosted with paid advertising"], answer: 1 },
    ],
  },
  {
    id: 37, free: false,
    title: "TikTok and Short Video for Entrepreneurial Consumers",
    subtitle: "How 60 Seconds Can Change a Life",
    content: `TikTok democratised content distribution in a way that no previous platform had achieved. For the first time, a brand-new account with zero followers could produce a video that reached one million people — if the content was genuinely compelling. Follower count, brand reputation and advertising budget became secondary to one variable: does this video make someone stop, watch, feel something, and want to show it to others?

This is the most favourable distribution environment that has ever existed for an Entrepreneurial Consumer with a genuine story to tell. You do not need an audience to start. You need one compelling truth, delivered with authenticity, in 60 seconds or less.

**The Z2B TikTok Formula.** Second 0–3: The Hook. The first 3 seconds determine whether the viewer stays or scrolls. Do not start with "Hi guys" or an introduction. Start with the most compelling sentence of your entire video. Examples: "Most employees have no idea they are building someone else's wealth with every rand they spend." "I discovered something 6 months ago that rewired how I think about my salary." "There are three types of people in the economy. Most people only know about two." Second 4–45: The Body. Develop the hook with specificity. Name the problem. Introduce the principle. Reference your personal experience. Tell them something they have never heard framed this way. Second 46–60: The CTA. Soft and specific: "If this shifted anything for you — the free workshop is in my bio. No cost. No pressure. Just the thinking that changed mine."

**Content Categories That Convert on TikTok for Z2B.** Transformation stories (before EC / after EC). Myth-busting (what people believe about network marketing vs what is true). EC philosophy explainers (the third path, consumption without leverage, the 4 table legs). Workshop session insights (one thing I learned today). Day-in-the-life builder content. All of these draw from your real experience. None require scripts you do not believe. TikTok detects inauthenticity — and so do the people who stop to watch.

**The Consistency Principle.** One viral video does not build a business. Fifty consistent videos build an audience. One hundred consistent videos build authority. The TikTok algorithm rewards accounts that post consistently over time, increasing their organic reach with each post. The builders who succeed on TikTok are not the ones who produce the most impressive single video — they are the ones who show up every day, regardless of performance.

[[MIRROR_MOMENT]]`,
    activity: "Write your first (or next) TikTok script using the Z2B formula. Line 1 (0-3 seconds): your hook — the most compelling sentence first. Lines 2-8 (4-45 seconds): develop the hook with one specific Z2B principle from your experience. Last line (46-60 seconds): your soft, specific CTA with free workshop link. Film it today. Post it. Note the view count at 24 hours.",
    questions: [
      { q: "TikTok democratised content distribution by:", options: ["Making advertising affordable for small businesses", "Allowing brand-new accounts to reach massive audiences based on content quality alone — not follower count, brand or budget", "Creating a platform exclusively for young creators", "Requiring less equipment than other video platforms"], answer: 1 },
      { q: "The first 3 seconds of a TikTok are critical because:", options: ["The algorithm only processes the first 3 seconds", "They determine whether the viewer stays or scrolls — a weak hook loses the entire audience immediately", "TikTok counts only 3-second views in reach statistics", "Introductions must be kept brief by platform rules"], answer: 1 },
      { q: "The Z2B TikTok CTA should be:", options: ["Urgent — 'join now before it's too late'", "Soft and specific — directing to the free workshop with no cost and no pressure", "Detailed — explaining the full compensation plan", "Generic — 'follow me for more content'"], answer: 1 },
      { q: "TikTok detects inauthenticity because:", options: ["It has sophisticated content moderation AI", "The platform's audience responds to genuine content and scrolls past anything that feels rehearsed or performed — reflected in the algorithm's performance data", "TikTok's terms of service prohibit scripted content", "Its algorithm specifically promotes educational content"], answer: 1 },
      { q: "The TikTok consistency principle teaches:", options: ["One viral video is sufficient to build a sustainable business", "50-100 consistent videos build audience and authority — the algorithm rewards accounts that show up repeatedly over time", "TikTok success requires daily posting for at least 2 years before results appear", "Only professionally produced content performs consistently"], answer: 1 },
    ],
  },
  {
    id: 38, free: false,
    title: "Email Marketing Fundamentals",
    subtitle: "Building a List That Belongs to You",
    content: `Email is the only major digital marketing channel where you own the relationship entirely. Your social media following can be taken from you by an algorithm change, an account suspension or a platform policy update. Your email list belongs to you — regardless of which email platform you use, regardless of changes in any social media environment. Every person on your email list has given you explicit permission to enter their inbox. That permission is a form of trust, and trust — as we have established throughout this workshop — is the most valuable currency in the invitation economy.

The Z2B builder who builds an email list alongside their social media presence is building two parallel assets. One that is visible, growing and somewhat volatile (social). One that is private, controlled and stable (email). Together, they create a resilient marketing infrastructure.

**The Email List Building Fundamentals.** You need three things to start: a free email service (Mailchimp, MailerLite and ConvertKit all have free tiers), a reason for someone to subscribe (called a lead magnet — this could be a free guide, a workshop invitation, an EC philosophy overview), and a sign-up link that you share consistently across all platforms. Every piece of content you post should point toward one of two destinations: your Z2B referral link, or your email list sign-up.

**The Z2B Email Sequence Structure.** Email 1 (immediately after sign-up): Welcome and deliver the lead magnet. Introduce yourself briefly. No sales pitch. Email 2 (Day 2): One idea from the EC philosophy that challenges their current thinking. Email 3 (Day 4): Your personal transformation story — before and after. Email 4 (Day 6): Introduce the free workshop. "I have been sharing ideas about the Entrepreneurial Consumer mindset. There is a full 9-session free workshop that goes deeper than any email can. Here is the link." Email 5 (Day 9): Social proof and a direct but gentle invitation to upgrade if they have completed the workshop. This sequence mirrors the 9-Day Nurture Engine already built into Z2B — the email list extends this beyond the Z2B platform.

**Email vs Social Media: Complementary Not Competing.** Social media builds the audience. Email deepens the relationship. A follower sees your post when the algorithm shows it to them. An email subscriber receives your message directly — no algorithm between you and them. The most effective builders use social media to grow the list and email to nurture it. This two-channel system creates depth that a single-channel strategy cannot achieve.

[[MIRROR_MOMENT]]`,
    activity: "This week, set up a free email account on MailerLite (or any free platform). Create a simple sign-up form. Write your welcome email — introduce yourself and your EC journey in no more than 150 words. Share the sign-up link on every platform this week. Your goal is your first 10 subscribers. Your email list starts today.",
    questions: [
      { q: "Email is the only digital channel where:", options: ["You guarantee the highest open rates", "You own the relationship entirely — your list belongs to you regardless of platform changes, algorithm updates or account suspensions", "Everyone on the list is guaranteed to read your message", "You pay per message sent"], answer: 1 },
      { q: "A lead magnet is:", options: ["A paid advertising tool", "A free resource that gives someone a compelling reason to subscribe to your email list", "A follow-up sequence for existing subscribers", "A social media growth strategy"], answer: 1 },
      { q: "The Z2B email sequence structure mirrors:", options: ["The compensation plan structure", "The 9-Day Nurture Engine — educating, building trust, and introducing the workshop invitation progressively", "The workshop session order", "The social media content calendar"], answer: 1 },
      { q: "Social media and email serve different functions because:", options: ["Email is more powerful than social media", "Social media builds the audience; email deepens the relationship — together they create depth that neither achieves alone", "They reach different demographic groups", "Email is only for business-to-business communication"], answer: 1 },
      { q: "The most resilient marketing infrastructure for a Z2B builder includes:", options: ["Multiple paid advertising platforms", "Social media for audience growth and an email list for stable, owned relationship depth", "Only the Z2B referral link shared on WhatsApp", "Professional advertising agency management"], answer: 1 },
    ],
  },
  {
    id: 39, free: false,
    title: "The Power of Testimonials",
    subtitle: "How Social Proof Multiplies Trust at Scale",
    content: `Human beings are tribal decision-makers. Before we commit to anything — a restaurant, a relationship, a career move, a business opportunity — we look around to see what other people like us have done. Not celebrities. Not experts. People like us. People we could imagine being. People whose situation resembles our own. This is called social proof — and it is the most powerful conversion mechanism available to a Z2B builder.

A testimonial is social proof in its most direct form. It is one person telling another: I was where you are. I tried what you are considering. Here is what happened. When that person is specific, credible and relatable — their story does more conversion work in 30 seconds than a perfectly crafted compensation plan presentation does in 30 minutes.

**The 4 Types of Testimonials Every Builder Needs.** Type 1: The Identity Shift Testimonial — "Before Z2B I thought like an employee. After completing Session 3, I understood what the Entrepreneurial Consumer identity means — and it changed how I see everything." This testimonial works before income is generated. It addresses the most fundamental transformation. Type 2: The First Income Testimonial — "My first ISP commission arrived 12 days after I joined. It was R86.40 — small, but the proof that the system works." Specificity is everything. The exact amount, the exact day. Type 3: The System Working Testimonial — "I shared my referral link in my WhatsApp status on Monday. By Friday, 3 people had registered without me contacting them individually. The system followed up. I just checked the pipeline." Type 4: The Life Change Testimonial — "Month 3 my TSC meant my salary was no longer my only income. For the first time in my adult life, I had a second income that arrived without me trading time for it."

**Collecting and Sharing Testimonials From Your Team.** Every win in your team is a testimonial waiting to be shared (with permission). Every first commission. Every first upgrade. Every session completed. Every mindset shift documented. Your team's wins are your recruitment fuel. Celebrate them publicly. Share them generously. And tag the builder — because their credibility transfers to yours.

[[MIRROR_MOMENT]]`,
    activity: "Write your current testimonial — whichever of the 4 types is most truthful to where you are right now. If you have no income yet, write a Type 1 identity shift testimonial. If you have earned your first commission, write a Type 2 testimonial. Be specific. Use exact numbers, exact days, exact moments. Vague testimonials convert no one. Specific ones convert deeply.",
    questions: [
      { q: "Social proof is described as the most powerful conversion mechanism because:", options: ["It is cheaper than advertising", "People make tribal decisions — they look for evidence from people like them before committing to anything new", "It is required by consumer protection laws", "It eliminates all objections automatically"], answer: 1 },
      { q: "A testimonial produces more conversion impact than a compensation plan presentation because:", options: ["Testimonials are shorter and easier to understand", "A real person's specific story from a credible, relatable individual transfers trust in seconds rather than minutes", "Compensation plans are too technical for most prospects", "Testimonials never get questioned or challenged"], answer: 1 },
      { q: "The Identity Shift Testimonial is valuable because:", options: ["It includes the most impressive income figures", "It works before any income is generated — addressing the most fundamental transformation available to any prospect at any stage", "It is the easiest type of testimonial to write", "It specifically targets the most sceptical prospects"], answer: 1 },
      { q: "Specificity in testimonials (exact amounts, exact days) matters because:", options: ["It sounds more professional", "Vague testimonials convert no one — specific details create credibility and give the prospect a concrete reference point for their own journey", "It is required for legal compliance", "Specific details are easier to remember"], answer: 1 },
      { q: "Sharing your team's wins publicly:", options: ["Is inappropriate — private achievements should stay private", "Converts your team's growth into recruitment fuel — their wins transfer credibility and social proof to your brand", "Should only be done at quarterly team meetings", "Is only effective for large teams"], answer: 1 },
    ],
  },
  {
    id: 40, free: false,
    title: "Goal Setting for Builders",
    subtitle: "The Difference Between Wishes and Targets With Deadlines",
    content: `A goal without a deadline is a wish. A wish is something you want. A goal is something you have committed to pursuing by a specific date through specific actions. The difference between them is not ambition — it is structure. And structure is the bridge between where you are and where you intend to go.

Most people set goals once — at the beginning of a year, or at the beginning of a new business journey — and then abandon them within weeks. Not because they are undisciplined. Because the goals were set without the structures that make them survivable when motivation fades. And motivation always fades. The question is not how to sustain motivation — it is how to build habits and accountability structures that persist when motivation is absent.

**The Z2B Goal Framework.** Three levels, three time horizons. Immediate Goals (next 90 days): specific, measurable, tied to activity rather than outcome. Not "I want to earn R5,000 from Z2B" — but "I will run the 4:4:5:4:15% ratio Monday to Friday every week for 90 days." Outcome is influenced by too many variables. Activity is entirely within your control. Medium Goals (6–18 months): upgrade milestones, team size targets, income threshold goals. These provide direction for your quarterly activity goals. Long-Term Goals (2–5 years): the legacy vision. The table you are building. The income level that represents freedom from salary dependency. The number of builders you want in your generational tree. Legacy goals pull you through the medium-term grind.

**Writing Goals That Survive Contact With Reality.** A goal survives when it is: Written down (unwritten goals have no accountability), specific enough to be measurable, realistic enough to be believable, time-bound to create urgency, and anchored in a powerful enough why to carry you through the weeks when results are slow. Without the why, the goal is a target on paper. With a compelling why — the faces of your children, the freedom of your family, the seats at your table that are not yet filled — the target becomes a calling.

**The Weekly Goal Review.** Successful builders do not review their goals annually. They review them weekly. Every Monday: what are my 3 most important activities this week? Every Friday: which did I complete? What do I need to adjust? This weekly rhythm turns goals from wall decorations into living navigation systems.

[[MIRROR_MOMENT]]`,
    activity: "Write your Z2B goals across all three levels. Immediate: one specific activity goal for the next 90 days. Medium: one milestone goal for 12 months from today. Long-term: one legacy vision goal for 3 years from today. Beside each goal, write the WHY — the real reason this matters to you, not the polished version. Then schedule a weekly Monday morning 10-minute review session in your calendar.",
    questions: [
      { q: "A goal differs from a wish by:", options: ["The size of the ambition involved", "The presence of a specific deadline and a commitment to pursue it through specific actions — structure, not just desire", "The level of motivation behind it", "Whether other people know about it"], answer: 1 },
      { q: "The Z2B Immediate Goal framework focuses on activity rather than outcome because:", options: ["Outcomes are impossible to predict in network marketing", "Activity is entirely within your control — outcomes are influenced by many variables that you cannot fully control", "Activities are more motivating than outcomes", "Z2B only measures activity, not results"], answer: 1 },
      { q: "A goal survives contact with reality when it is:", options: ["Set ambitiously high to maximise motivation", "Written, specific, measurable, realistic, time-bound and anchored in a compelling enough why to carry you through slow periods", "Kept private to avoid embarrassment if not achieved", "Set by an experienced mentor rather than yourself"], answer: 1 },
      { q: "Without a compelling why, a goal is:", options: ["Still effective if the target is specific enough", "A target on paper only — the why transforms a target into a calling that carries you through weeks when results are slow", "More achievable because it is purely rational", "Appropriate for short-term goals only"], answer: 1 },
      { q: "Successful builders review their goals:", options: ["Annually — at year end when results can be properly evaluated", "Weekly — Monday for priorities, Friday for review — turning goals into living navigation systems rather than wall decorations", "Monthly — tied to income tracking", "Only when results are disappointing"], answer: 1 },
    ],
  },

  // ---- PAID TIER: SESSIONS 41–60 — FULLY WRITTEN ----
  {
    id: 41, free: false,
    title: "Morning Routines of the Entrepreneurial Consumer",
    subtitle: "How the First 60 Minutes Shape the Entire Day",
    content: `The first 60 minutes of your day are not neutral. They either set the frame through which you interpret everything that follows — or they allow someone else to set it for you. The person who picks up their phone within 5 minutes of waking and begins consuming other people's content, other people's news, other people's urgency — has handed the first and most impressionable hour of their cognitive day to strangers. The Entrepreneurial Consumer reclaims this hour deliberately.

A morning routine is not a productivity hack. It is an identity declaration. It is you saying, before the day begins: I am an Entrepreneurial Consumer. I am building something. My time belongs to my vision first. Everything else comes after.

**The Z2B Morning Architecture.** The morning sessions in this workshop are not coincidentally placed. They are positioned at the start of your day because identity anchoring is most effective when done before the world has had a chance to remind you of your role as an employee, a subordinate, a consumer. Five to ten minutes of the morning audio session — heard during your commute, your morning walk, or before your first cup of tea — sets the mental frequency for the rest of the day.

**The 5 Components of a High-Performance Builder Morning.** First: Guard the first 15 minutes. No phone. No news. No social media. Let your mind wake naturally before it is invaded. Second: Movement — even 10 minutes of physical activity increases blood flow, mental clarity and emotional baseline. Third: Your morning session audio — the Z2B identity anchor. Fourth: One specific intention for the day — not a to-do list, but one answer to: what is the most important thing I can accomplish for my Z2B journey today? Fifth: Your first post — created and scheduled before the demands of the day begin.

**The Compound Effect of Consistent Mornings.** A single morning routine makes no measurable difference. Ninety consecutive morning routines reshape a life. The discipline of protecting your morning is the discipline of protecting your identity. And identity — as this entire workshop has taught — is the foundation that everything else is built on.

[[MIRROR_MOMENT]]`,
    activity: "Design your ideal Z2B morning routine. Write the specific sequence — from the moment you wake to the moment you leave for work or begin your workday. Include your morning session audio, your movement, your daily intention and your first post. Now compare it to what your morning actually looks like today. The gap between ideal and actual is your morning discipline work.",
    questions: [
      { q: "The first 60 minutes of the day are not neutral because:", options: ["Morning nutrition affects productivity", "They set the interpretive frame for the entire day — either by your own design or by someone else's content and urgency", "The brain is most creative immediately after waking", "Morning habits determine evening behaviour"], answer: 1 },
      { q: "A morning routine is described as an identity declaration because:", options: ["It is performed publicly", "It is a deliberate act of saying: I am an EC, I am building something, my time belongs to my vision first", "It demonstrates discipline to your team", "It is recommended by productivity experts"], answer: 1 },
      { q: "Z2B morning sessions are positioned at the start of the day because:", options: ["Morning is when people have the most free time", "Identity anchoring is most effective before the world has reminded you of your roles as employee and consumer", "Morning audio sounds better than evening audio", "It is easier to focus without distractions"], answer: 1 },
      { q: "The compound effect of consistent morning routines works because:", options: ["Each individual morning creates immediate measurable results", "Ninety consecutive mornings reshape identity and habits — the consistency creates cumulative transformation", "Morning discipline creates social proof", "Consistent mornings directly increase income"], answer: 1 },
      { q: "The most important element of a Z2B builder's morning is:", options: ["Checking social media engagement from last night's posts", "Guarding against invasion by other people's content until your own identity and intention are set", "Planning the entire day in detail", "Completing the most difficult task first"], answer: 1 },
    ],
  },
  {
    id: 42, free: false,
    title: "Financial Planning Basics",
    subtitle: "Budgeting as a Strategic Tool, Not a Restriction",
    content: `Most people experience budgeting as a cage — a set of limitations that restricts their spending and reminds them of what they cannot afford. This experience makes budgeting feel punishing, and punishing habits are abandoned. But the Entrepreneurial Consumer understands budgeting differently: not as a cage, but as a blueprint. Not as a restriction, but as a deployment strategy for every rand that passes through their hands.

A budget is not a moral judgment on your spending. It is a declaration of priorities. It is you saying: given what I earn and what I intend to build, here is where my money goes — by design, not by accident. The person who does not budget does not live without a budget — they live with an accidental one, shaped by impulse, obligation and whoever markets to them most effectively.

**The EC Budget Framework: Four Buckets.** Every rand you earn should be consciously allocated to one of four buckets. Bucket 1: Essentials — non-negotiable living costs. Rent, transport, food, utilities, school fees. These are the costs of functioning. Bucket 2: Freedom — savings and investments. Money that leaves your hands and builds assets. Your Z2B earnings reinvested as upgrades. Your emergency fund. Your future property deposit. Bucket 3: Building — active investment in your income-generating activities. Z2B membership costs. Content creation tools. Business development. Bucket 4: Lifestyle — discretionary spending on things that bring quality of life. Not eliminated — consciously allocated. The EC does not punish themselves with poverty. They plan for pleasure intentionally.

**The Freedom Bucket First Principle.** Most people pay their bills, spend on lifestyle, and save whatever is left. Typically nothing is left. The Entrepreneurial Consumer inverts this: save first, build first, then live on what remains. Even R200 into the freedom bucket before any other allocation is a declaration of financial self-governance. The amount matters less than the habit. The habit, consistently maintained, compounds into the financial infrastructure that eventually replaces the salary.

**The Budget as a Monthly Business Review.** Once per month — not once per year — review your four buckets. Are your essentials shrinking as income grows? Is your freedom bucket growing? Is your building bucket producing return? Is your lifestyle allocation conscious and satisfying? This monthly review turns the budget from a passive ledger into an active strategy.

[[MIRROR_MOMENT]]`,
    activity: "Create your EC budget right now. List your monthly income at the top. Then allocate every rand into the four buckets: Essentials, Freedom (savings), Building (business investment), Lifestyle. Be honest. Do not create an ideal budget you cannot maintain — create an honest one you can. Then identify one thing you can reduce in the Lifestyle bucket and redirect to Freedom or Building.",
    questions: [
      { q: "The EC understands budgeting as:", options: ["A restriction that limits spending and reminds you of limitations", "A deployment strategy — a declaration of priorities that directs money by design rather than accident", "A tool for tracking past spending only", "Something required by banks and financial institutions"], answer: 1 },
      { q: "Someone who does not formally budget:", options: ["Lives without any financial structure", "Lives with an accidental budget shaped by impulse, obligation and whoever markets to them most effectively", "Spends more freely and enjoys life more", "Is more financially resilient"], answer: 1 },
      { q: "The Freedom Bucket First Principle inverts the typical approach by:", options: ["Spending more on lifestyle to motivate higher earning", "Saving and building first, then living on what remains — rather than saving what is left after spending", "Eliminating all discretionary spending", "Paying bills first, then investing the rest"], answer: 1 },
      { q: "The monthly budget review turns a budget into:", options: ["A compliance document for tax purposes", "An active strategy — a regular business review of whether money is moving toward the EC's financial vision", "Evidence of financial discipline for lenders", "A record of spending habits"], answer: 1 },
      { q: "The EC's relationship with lifestyle spending is:", options: ["Eliminate it entirely until income targets are reached", "Consciously allocated and planned — not punished, but intentionally limited to what remains after essentials, freedom and building", "Prioritised above savings in the early stages", "Determined by the amount of ISP earned monthly"], answer: 1 },
    ],
  },
  {
    id: 43, free: false,
    title: "Saving and Investment Principles",
    subtitle: "Building Financial Buffers Before You Need Them",
    content: `The best time to build a financial buffer is before you need it. The second best time is now. A financial buffer is not a luxury — it is the infrastructure that allows you to take risks, make long-term decisions, and survive the inevitable disruptions that life delivers without warning. The person without a buffer is at the mercy of every emergency. Every unexpected expense becomes a crisis. Every business setback becomes a panic. The buffer converts crises into inconveniences and panics into problems.

The Entrepreneurial Consumer builds buffers at two levels simultaneously: personal (to protect the family from income disruption) and business (to protect the Z2B building journey from slow months and unexpected costs).

**The Personal Emergency Fund.** Three to six months of essential living expenses, held in a separate account that is not easily accessible for impulse spending. This is not your investment account. It is your insurance policy. The discipline required to build it — and to not touch it for non-emergencies — is the same discipline that builds your Z2B team. Start small. R500 per month becomes R6,000 in a year. R6,000 becomes the buffer that means a sudden car repair does not derail your entire financial architecture.

**Investment Principles for the Beginning EC.** You do not need to be wealthy to begin investing. You need to begin before you are wealthy — because beginning is what creates the wealth. Three principles guide the EC's early investment approach: First, compound interest favours the patient. Even modest regular investments grow significantly over decades. Second, diversification protects against catastrophic loss. No single investment should hold your entire financial future. Third, invest in what you understand. The Z2B platform is an investment you understand because you are inside it. Your own skills are investments you understand because you can measure their return directly.

**The Z2B Upgrade as Strategic Investment.** Every tier upgrade in Z2B is an investment with a measurable return. R480 Bronze → 18% ISP on every sale. R2,500 Silver → 25% ISP and 6-generation TSC. The upgrade cost is finite. The income potential is ongoing. Understanding your tier investments through the lens of return — not just cost — is the beginning of investment literacy.

[[MIRROR_MOMENT]]`,
    activity: "Calculate your current financial buffer status. How many months of essential expenses could you cover if your income stopped today? If the answer is less than 1 month, write a specific plan to build a 1-month buffer within the next 6 months. Calculate exactly how much per month you need to save and identify where that money will come from.",
    questions: [
      { q: "A financial buffer is described as:", options: ["A luxury that only wealthy people can afford", "Infrastructure that converts crises into inconveniences and panics into problems — available before you need it", "Money held in a current account for daily expenses", "An investment portfolio for retirement"], answer: 1 },
      { q: "The personal emergency fund should contain:", options: ["Every spare rand you can accumulate", "Three to six months of essential living expenses in a separate, not easily accessible account", "Your investment capital and emergency reserves together", "One month of full income including discretionary spending"], answer: 1 },
      { q: "The first principle of compound interest is:", options: ["You need significant capital before it produces meaningful returns", "Compound interest favours the patient — modest regular investments grow significantly over decades", "Compound interest only works in stock markets", "It produces best results when investments are withdrawn regularly"], answer: 1 },
      { q: "A Z2B tier upgrade is described as a strategic investment because:", options: ["It unlocks recognition and status", "The upgrade cost is finite but the income potential from higher ISP and deeper TSC is ongoing — a measurable return", "All investments require initial capital", "It demonstrates commitment to the Z2B philosophy"], answer: 1 },
      { q: "The EC invests in what they understand because:", options: ["Unfamiliar investments are always fraudulent", "Returns can be measured directly and risks can be evaluated intelligently — knowledge reduces investment risk", "Simple investments always outperform complex ones", "Financial advisors recommend familiar investments only"], answer: 1 },
    ],
  },
  {
    id: 44, free: false,
    title: "Debt Strategy for Builders",
    subtitle: "When Debt Is a Tool and When It's a Trap",
    content: `Not all debt is equal. There is debt that destroys — consumer debt that funds depreciating purchases, carries high interest rates, and transfers your future income to a lender today. And there is debt that builds — strategic debt that funds appreciating assets, generates income that exceeds the repayment cost, and accelerates your timeline to financial freedom. The Entrepreneurial Consumer develops the discernment to tell these apart and the discipline to manage both intentionally.

The most dangerous debt in the EC's world is the invisible kind: the small, recurring debts that accumulate quietly — a store account here, a data plan there, an insurance policy on a possession you no longer need, a subscription you forgot to cancel. These small drains collectively represent hundreds of rands per month flowing away from your building activities. The first debt audit most people conduct reveals significant resources that can be redirected.

**The Debt Audit.** Write down every single debt you carry: credit cards, store accounts, personal loans, vehicle finance, home loans, money owed to family members. Beside each write: the outstanding balance, the monthly repayment, the interest rate, and whether the debt funded an appreciating or depreciating asset. This single exercise creates a financial picture most people have never seen clearly. Clarity precedes strategy.

**The Two Debt Priorities.** Priority 1: Eliminate high-interest consumer debt as aggressively as possible. A store account charging 24% per year is not a convenience — it is a 24% guaranteed return on every rand you use to pay it down. No investment reliably beats 24%. Pay it first. Priority 2: Preserve or build strategic debt capacity. Your credit record is a future tool. A builder who has eliminated consumer debt and maintained a clean credit record has access to property loans, business funding and investment vehicles that will amplify their EC journey significantly in years 3-5.

**Debt and the Z2B Journey.** The discipline required to manage debt — the deferred gratification, the long-term thinking, the consistent execution of a strategy that produces no immediate reward — is identical to the discipline required to build a Z2B team. They train the same muscle. And the builder who demonstrates mastery over their personal finances communicates credibility to everyone they invite to the table.

[[MIRROR_MOMENT]]`,
    activity: "Conduct a complete debt audit today. List every obligation. For each: balance, monthly cost, interest rate, appreciating or depreciating? Then rank your debts from highest-interest to lowest. Identify the single debt you will attack most aggressively this month — direct every spare rand toward it. Name the amount you will redirect and the source it comes from.",
    questions: [
      { q: "The distinction between destructive and strategic debt is:", options: ["The size of the debt", "Consumer debt funds depreciating purchases at high rates; strategic debt funds appreciating assets that generate income exceeding repayment costs", "Who you borrowed from", "Whether it is secured or unsecured"], answer: 1 },
      { q: "The most dangerous debt for the EC is often:", options: ["Large home loans", "Small, recurring invisible debts that accumulate quietly — store accounts, forgotten subscriptions, unnecessary insurance", "Vehicle finance", "Student loans"], answer: 1 },
      { q: "Paying down high-interest consumer debt is described as:", options: ["A delay in investment activity", "A guaranteed investment return — paying off a 24% store account produces a 24% guaranteed return no other investment reliably beats", "Something to do after building income streams", "Only necessary when debt becomes unmanageable"], answer: 1 },
      { q: "Debt discipline trains the same muscle as Z2B building because:", options: ["Both involve money management", "Both require deferred gratification, long-term thinking, and consistent execution of a strategy with no immediate visible reward", "Both are taught in the workshop", "Both produce income streams"], answer: 1 },
      { q: "A builder who demonstrates financial discipline communicates:", options: ["Technical expertise in investment", "Credibility — the same self-mastery required to manage debt builds the trust that makes others willing to follow your invitation", "Academic financial qualifications", "Compliance with Z2B requirements"], answer: 1 },
    ],
  },
  {
    id: 45, free: false,
    title: "The Compound Effect in Business",
    subtitle: "Small Consistent Actions and Their Extraordinary Long-Term Results",
    content: `Darren Hardy called it the Compound Effect. The Bible calls it "he who is faithful in little will be faithful in much." Both point to the same economic reality: the results of any consistent practice are not linear. They are exponential. And the most extraordinary outcomes in business, health, relationships and wealth are almost universally the product of small, consistent, invisible-seeming actions sustained over long periods of time.

The challenge is that the compound effect is invisible in the short term. You post four times a day for 30 days and see minimal results. You question whether the ratio works. You question whether Z2B is right for you. You question your own ability. But the invisible accumulation is happening — every post is depositing into an account of audience awareness, algorithmic preference and trust-building that will eventually yield a return that appears sudden to outside observers. It was not sudden. It was compound.

**Compound Effect in the 4 Table Legs.** In Mindset: each morning session deposits a small shift in your self-concept. After 30 sessions the shift is unmistakable. In Systems: each day your pipeline runs, it processes prospects. After 90 days your funnel is mature, your conversion insights are specific, and your results accelerate. In Relationships: each genuine conversation, each WhatsApp follow-up, each team coaching call adds to a relationship capital account. After 12 months you have a community. In Legacy: each Bronze upgrade your team facilitates adds a node to your generational tree. After 24 months your team is generating TSC that compounds through generations you no longer need to manage personally.

**The Danger of Inconsistency.** The compound effect requires consistency the way a savings account requires regular deposits. Irregular deposits produce irregular results — and in compound systems, breaks in consistency set the account back further than just the missed contribution. Two weeks of inactivity in your pipeline does not just produce two weeks of lost results. It disrupts the nurture sequences, cools the prospects and resets the momentum that was building. Consistency is not the secret weapon of successful builders. It is the weapon — the only one that actually works over time.

[[MIRROR_MOMENT]]`,
    activity: "Identify one area of your Z2B building where you have been inconsistent. Calculate what the compound result would look like if you were perfectly consistent in that one area for the next 90 days. Write the specific daily action, the expected 30-day result, the 60-day result and the 90-day result. Then commit to that single consistent action for 90 days.",
    questions: [
      { q: "The compound effect is described as invisible in the short term because:", options: ["Results are deliberately hidden by the platform", "The accumulation happens gradually — each small action deposits into an account that only becomes visible at a threshold", "Small actions are genuinely ineffective", "Results only appear after exactly 90 days"], answer: 1 },
      { q: "In the Z2B Mindset table leg, the compound effect produces:", options: ["An immediate dramatic identity transformation", "A cumulative shift that becomes unmistakable after sustained daily morning sessions — invisible early, obvious later", "Results proportional to each individual session", "No measurable effect on income"], answer: 1 },
      { q: "Inconsistency in a compound system is especially damaging because:", options: ["It creates a bad reputation", "Breaks in consistency set the system back further than just the missed contribution — they disrupt sequences and cool momentum", "The algorithm penalises irregular posting", "It reduces the QPB qualification window"], answer: 1 },
      { q: "The compound effect requires consistency the way a savings account requires:", options: ["A large initial deposit", "Regular deposits — irregular contributions produce irregular results without the compounding that makes the system powerful", "High interest rates", "A long fixed-term commitment"], answer: 1 },
      { q: "Extraordinary business outcomes appear sudden to outside observers because:", options: ["They are the result of a single breakthrough moment", "The compound accumulation was invisible during the building phase — the threshold is reached and results appear to arrive all at once", "Success is always unpredictable", "External observers lack access to the full story"], answer: 1 },
    ],
  },
  {
    id: 46, free: false,
    title: "Creating Your First Product or Service",
    subtitle: "How to Monetise What You Already Know",
    content: `Every person reading this workshop has a skill, knowledge area or lived experience that someone else would pay for. Not a theoretical skill — something you have actually done, navigated, survived or mastered through experience. A teacher who knows how to manage a classroom of 40 children possesses knowledge that parents, educators and training organisations would pay for. A nurse who has navigated the private healthcare system holds information that ordinary patients desperately need. An employee who has managed a complex operational process has expertise that consulting firms would value. The Entrepreneurial Consumer sees this value — and eventually creates a way to distribute it beyond their employer.

Creating a product or service is not about inventing something new. It is about packaging what you already know in a form that others can access. The packaging is the product. Your knowledge is the raw material.

**The Three Product Types for Beginning ECs.** Type 1: A Service — you do something for someone using your existing skill. Tutoring, coaching, consulting, design, writing, translation. This is the fastest to launch and requires no upfront investment. The limitation is that it is time-traded — you can only serve as many clients as your hours allow. Type 2: A Digital Product — you package your knowledge into a form that can be downloaded, consumed and applied without your direct involvement. An ebook, a video course, a template, a guide, a checklist. This scales. Once created, it can be sold to hundreds without additional time investment. Type 3: A Coaching or Membership Programme — recurring access to your knowledge, community or guidance. Monthly fee. Recurring income. The most scalable and most relationship-intensive of the three.

**Your Z2B Knowledge Is a Product.** The understanding of the Entrepreneurial Consumer philosophy that you have developed through this workshop is itself a product. The ability to explain the third path — employment vs entrepreneurship vs EC — to an employed person in 5 minutes is a coaching skill. The experience of running your first sales funnel, navigating your pipeline, and guiding a prospect through the 9 days is practical knowledge that new Z2B builders would pay for as a coaching service.

[[MIRROR_MOMENT]]`,
    activity: "Identify one skill, knowledge area or lived experience you possess that someone else would find valuable. Write: What do I know that others don't know as well as I do? Who specifically would benefit from this knowledge? What is the simplest product form this knowledge could take? Could this be a service, a digital guide, or a coaching session? Name the product, name the audience, and write one sentence describing the transformation it provides.",
    questions: [
      { q: "Creating a first product is described as:", options: ["Inventing something entirely new", "Packaging what you already know in a form that others can access — the packaging is the product, knowledge is the raw material", "Copying a successful product from someone else", "Requiring significant upfront investment and expertise"], answer: 1 },
      { q: "A service product is described as the fastest to launch because:", options: ["Services generate the highest income", "It requires no upfront investment — you use existing skills immediately without creating a product first", "Services are easier to market than digital products", "Clients prefer working directly with people"], answer: 1 },
      { q: "A digital product is valuable because:", options: ["It always generates more income than services", "It scales — once created, it can be sold to hundreds without additional time investment", "It requires no technical skills to create", "Customers prefer digital products over personal services"], answer: 1 },
      { q: "The EC's Z2B knowledge is described as a product because:", options: ["Z2B pays builders to share their knowledge", "The understanding of the third path and the experience of running a funnel are practical coaching knowledge that new builders would pay for", "All workshop graduates automatically become coaches", "Knowledge sharing is required for team building"], answer: 1 },
      { q: "The three product types for beginning ECs are:", options: ["Physical goods, retail, wholesale", "Service, digital product, coaching or membership programme", "Affiliate marketing, dropshipping, e-commerce", "Network marketing, consulting, freelancing"], answer: 1 },
    ],
  },
  {
    id: 47, free: false,
    title: "Pricing Your Value",
    subtitle: "Why Undercharging Is a Strategy That Destroys Income",
    content: `Undercharging is the most common mistake that skilled, capable, principled people make when they begin to monetise what they know. And it is not a modest mistake — it is a compounding one. Every time you undercharge, you attract clients who are accustomed to low prices and resistant to paying more. You create a market expectation for your work at a level that does not sustain you. You communicate — to your clients and to yourself — that your value is limited. And you create resentment: the slow burn of delivering significant value for inadequate compensation.

The solution is not to be greedy. It is to understand the relationship between price and value — and to price at the level of the value you deliver, not the level of your personal financial need.

**Price Communicates Positioning.** In every market, price is a signal. A product priced too low triggers suspicion — what is wrong with it? A product priced appropriately for its category communicates quality and confidence. The builder who charges R200 for a coaching session is communicating something fundamentally different from one who charges R750 — even if the content of the session is identical. Price shapes perception before the client experiences the value.

**The Value Calculation.** What is the outcome your product or service produces? What is that outcome worth to the person who receives it? A coach who helps someone build their first Z2B income stream of R1,500/month has delivered R18,000 in annual value. What is a reasonable percentage to charge for that outcome? A digital guide that saves someone 40 hours of trial and error: at a conservative R100 per hour, that is R4,000 of time saved. What price reflects that? Anchor your price to the value of the outcome — not to what you personally feel comfortable charging.

**The EC Pricing Principle.** Start at the price you believe is fair for the value delivered. Then raise it slightly — until the price feels slightly uncomfortable to declare. That slight discomfort is often the signal that you are pricing at an appropriate level for your actual value, not at the level your scarcity mindset has conditioned you to accept. Then hold it. Your confidence in your price is part of the product.

[[MIRROR_MOMENT]]`,
    activity: "Identify the product or service you mapped in the previous session. Calculate the value of the outcome it delivers to the recipient (time saved, money generated, problem solved). Price it at 20-30% of that value as a starting point. Now declare that price aloud. Does it feel slightly uncomfortable? If yes — you are probably pricing correctly. If it feels completely comfortable — consider that you may still be undercharging.",
    questions: [
      { q: "Undercharging is described as a compounding mistake because:", options: ["It reduces your total income", "It attracts price-resistant clients, creates market expectations, communicates limited value, and builds resentment — all of which compound over time", "It is only a problem in the short term", "Undercharging is sometimes a valid strategy"], answer: 1 },
      { q: "Price communicates positioning because:", options: ["Higher prices always mean better quality", "Price is a signal — it shapes perception of quality and confidence before the client even experiences the value", "Clients always research pricing before purchasing", "Markets are purely rational in their price assessment"], answer: 1 },
      { q: "The value calculation anchors price to:", options: ["What competitors are charging", "The value of the outcome delivered to the recipient — time saved, money generated, problem solved", "What you personally feel comfortable charging", "Your costs of production and delivery"], answer: 1 },
      { q: "The slight discomfort in pricing is described as:", options: ["A signal to lower the price", "A signal that you are pricing at an appropriate level for your actual value rather than your scarcity mindset's comfort level", "A sign that the market will not accept the price", "Evidence that you need more qualifications"], answer: 1 },
      { q: "Confidence in your price is:", options: ["Irrelevant — only the product quality matters", "Part of the product — the way you declare your price communicates as much as the price itself", "Only important for luxury products", "Something that develops only after years of experience"], answer: 1 },
    ],
  },
  {
    id: 48, free: false,
    title: "Customer Service as a Growth Strategy",
    subtitle: "How to Turn One Customer Into Ten Through Experience",
    content: `In most businesses, customer service is treated as a cost centre — the department that handles complaints and manages problems. In the Entrepreneurial Consumer's world, customer service is a growth strategy — the most powerful and least expensive marketing tool available. Every person who has an outstanding experience in your Z2B community does not just stay — they bring others. Every person who feels seen, supported and served becomes a voluntary marketer for everything you build.

The network marketing model amplifies this truth exponentially. In a traditional business, a satisfied customer tells a few friends. In a network model, a satisfied builder recruits their own team, which becomes your TSC income. The quality of your service to your G1 builders is not just a leadership obligation — it is a revenue strategy.

**The Four Moments That Create Customer Loyalty.** Moment 1: The First Contact — how you respond to a new prospect or a new builder's first question sets the tone for the entire relationship. Warmth, speed and specificity in the first response creates an immediate trust deposit. Moment 2: The First Problem — when something goes wrong (a commission error, a pipeline confusion, a technical issue), how you handle it determines whether you gain or lose the relationship. Problems resolved generously and quickly build more loyalty than smooth experiences ever do. Moment 3: The Unexpected Surprise — an unsolicited check-in message, a voice note celebrating a small win, a shared resource they did not ask for. Generosity that exceeds expectation is the most memorable form of service. Moment 4: The Recognition — publicly celebrating your team's wins is a service act. It says: I see you, I value what you have done, and I want others to know.

**The Z2B Community Standard.** Every person in your Z2B community — prospect or builder — should leave every interaction with you feeling more capable, more seen and more certain about their journey than they were before. Not because this is warm and nice — though it is. Because people who feel that way bring others. And others bring others. And the compounding of genuine service is the most powerful growth mechanism in network marketing.

[[MIRROR_MOMENT]]`,
    activity: "Review the last 5 interactions you have had with prospects or team members. For each, rate the experience you delivered from 1-5 from their perspective. Where did you score 3 or below? What would a 5 look like for that type of interaction? Write the specific improvement — not a general intention, but the exact words or action that would have made it a 5.",
    questions: [
      { q: "Customer service as a growth strategy differs from customer service as a cost centre because:", options: ["The quality standard is higher", "It is understood as a revenue tool — satisfied builders recruit teams that generate TSC, while dissatisfied ones exit and take their network with them", "It requires more staff", "It focuses on complaints rather than experiences"], answer: 1 },
      { q: "In network marketing, a satisfied builder's value exceeds a traditional satisfied customer because:", options: ["They spend more money individually", "They recruit their own team, which becomes compounding TSC income — their satisfaction multiplies through the entire tree they build", "Network marketing customers are more loyal than retail customers", "They provide better testimonials"], answer: 1 },
      { q: "Problems resolved generously and quickly build more loyalty than smooth experiences because:", options: ["Problems are more memorable than ordinary interactions", "The emotional contrast — being helped in a moment of vulnerability — creates a trust deposit that ordinary positive experiences cannot match", "Problems are expected in all businesses", "Quick resolution prevents negative reviews"], answer: 1 },
      { q: "The Unexpected Surprise as a customer service moment works because:", options: ["Surprises create social media content", "Generosity that exceeds expectation is the most memorable form of service — it demonstrates that you see the person, not just the transaction", "It is required by Z2B policy", "Surprises always generate referrals"], answer: 1 },
      { q: "The Z2B community standard means every interaction leaves people feeling:", options: ["Obligated to recruit more aggressively", "More capable, more seen and more certain about their journey — because this feeling drives voluntary growth through referrals", "Impressed by the compensation plan", "Committed to a specific recruitment target"], answer: 1 },
    ],
  },
  {
    id: 49, free: false,
    title: "Referral Systems",
    subtitle: "Building a Pipeline That Feeds Itself",
    content: `The most efficient customer acquisition system in the world is not advertising, not SEO, not social media. It is the referral — one satisfied person telling another about an experience worth having. Referrals convert at dramatically higher rates than any other acquisition channel because they arrive with pre-existing trust. The person referring has already done the credibility work for you. Your job is simply to deliver an experience that continues earning referrals.

The Z2B referral system is already built into the platform architecture: every builder has a unique referral link, every sign-up through that link is automatically attributed, and the nurture engine processes each referral without any manual action from the builder. But the referral system we are discussing in this session goes beyond the mechanics — it is the intentional cultivation of an environment where referrals happen naturally and continuously.

**The Three Sources of Z2B Referrals.** Source 1: Content Referrals — when someone shares your post, video or message with a person in their network, that is a referral. It is driven by content quality, emotional resonance and the sharer's confidence that their contact will benefit. Source 2: Conversation Referrals — when a prospect or builder mentions you to someone else in a non-digital conversation. "I've been doing this workshop — you should speak to my builder." This is driven by the quality of the experience you have provided. Source 3: Builder Referrals — when your Bronze builders recommend Z2B to their networks. This is the most powerful referral type because it is driven by personal income evidence — nothing converts more effectively than "I earned R1,500 this month from something I started with R480."

**Designing a Referral-Generating Experience.** Every interaction, every coaching conversation, every piece of content, every response to a message — design it with the question: would this person be comfortable recommending me to someone they care about after this interaction? If the answer is yes, you are building a referral machine. If the answer is sometimes, you have identified your growth area.

[[MIRROR_MOMENT]]`,
    activity: "Identify your three strongest potential referral sources in Z2B right now. For each: who are they, what specifically would motivate them to refer others to you, and what one action can you take this week to generate a referral from each of them? This is not a passive exercise — referrals are earned through deliberate relationship investment.",
    questions: [
      { q: "Referrals convert at higher rates than other acquisition channels because:", options: ["They are free to generate", "They arrive with pre-existing trust — the referring person has already done the credibility work on your behalf", "Referred customers spend more per transaction", "Referral systems are automated in Z2B"], answer: 1 },
      { q: "Content referrals are driven by:", options: ["Platform algorithms sharing your content automatically", "Content quality, emotional resonance, and the sharer's confidence that their contact will benefit", "The number of hashtags used", "Paid promotion to expand reach"], answer: 1 },
      { q: "Builder referrals are described as the most powerful because:", options: ["Builders have the largest social media followings", "They are driven by personal income evidence — 'I earned R1,500 from R480' converts better than any philosophy explanation", "Builders are trained to recruit", "They generate immediate QPB bonuses"], answer: 1 },
      { q: "Designing a referral-generating experience requires asking:", options: ["How much content should I post daily?", "Would this person be comfortable recommending me to someone they care about after this interaction?", "What is my conversion rate this month?", "How quickly can I respond to messages?"], answer: 1 },
      { q: "The Z2B referral system built into the platform handles:", options: ["All relationship building automatically", "The mechanical attribution and nurture process — but the cultivation of an environment where referrals happen naturally requires intentional relationship investment", "Content creation on behalf of builders", "Team coaching and leadership development"], answer: 1 },
    ],
  },
  {
    id: 50, free: false,
    title: "The Law of Reciprocity in Business",
    subtitle: "How Generous Givers Become Wealthy Receivers",
    content: `The law of reciprocity is one of the most consistently documented phenomena in human social behaviour. When someone gives us something — a gift, information, attention, help — we experience an internal compulsion to give something back. Not out of calculation. Out of something deeper than calculation: the social bond that generosity creates. Robert Cialdini documented this in Influence. The Bible articulates it in Proverbs 11:24: "One person gives freely, yet gains even more; another withholds unduly, but comes to poverty." The principle is ancient, verified and available to you right now.

In business, the law of reciprocity means that the person who consistently gives value — who shares useful information without expectation, who helps without invoice, who contributes before requesting — creates a relational surplus that eventually returns as commercial opportunity. Not always from the people they gave to. Sometimes from unexpected directions. But the pattern is consistent enough to be treated as a principle.

**How Generosity Operates in Z2B.** When you share a workshop insight that helps a prospect think differently — before they have signed up, before they have spent a rand — you have given them something. They feel it. Their next interaction with you is coloured by that gift. When you help a team member solve a problem you did not cause — without waiting for them to ask — you have given them something. Their loyalty deepens. When you celebrate a builder's win publicly — giving them visibility and recognition — you have given them something. Their commitment to the community strengthens.

**The Strategic Application of Generosity.** Generosity in business is not indiscriminate. It is intentional. You give most generously to those who are actively building — because generosity given to active builders multiplies through the team they are growing. You give most frequently through content — because content generosity scales infinitely at no marginal cost. You give most deeply in coaching conversations — because the depth of your service investment there compounds through everything your team members build afterward.

**The Withholding Trap.** Some builders withhold their best strategies, their most useful scripts, and their deepest insights — fearing that sharing them will diminish their own advantage. This is the scarcity reflex that the Kingdom Economics doctrine directly contradicts. Your best ideas are not a finite resource. They multiply when shared. Give your best freely. The supply regenerates.

[[MIRROR_MOMENT]]`,
    activity: "Identify one genuinely valuable thing you could give to someone in your network or team this week — without expectation of return. It could be a script, a contact, a piece of advice, a resource, a public celebration. Give it. Then notice what happens to the quality of that relationship in the following weeks. Track the return — not to calculate it, but to see the law in action.",
    questions: [
      { q: "The law of reciprocity produces returns because:", options: ["People are rational economic actors who calculate returns on gifts", "Generosity creates a social bond — an internal compulsion in the receiver to give back — deeper than conscious calculation", "It is legally required in contract law", "Reciprocity is the foundation of all commercial transactions"], answer: 1 },
      { q: "In Z2B, generosity operates through:", options: ["Sharing workshop insights before any purchase, helping team members proactively, celebrating wins publicly — each creating a relational deposit", "Offering discounts on Bronze membership", "Providing free tools to non-paying members only", "Reducing follow-up frequency to avoid pressure"], answer: 1 },
      { q: "Strategic generosity differs from indiscriminate generosity because:", options: ["Strategic generosity produces higher financial returns", "It is given most generously to active builders (multiplies through their teams), most frequently through content (scales infinitely), most deeply in coaching (compounds through what they build)", "It is calculated and transactional", "It requires approval from your upline"], answer: 1 },
      { q: "The withholding trap contradicts Kingdom Economics because:", options: ["It reduces team income", "Your best ideas are not a finite resource — they multiply when shared; scarcity thinking about knowledge is always wrong", "Withholding violates Z2B policy", "It creates legal intellectual property issues"], answer: 1 },
      { q: "Proverbs 11:24 ('One person gives freely, yet gains even more') teaches:", options: ["That generosity is a short-term tactic", "That the principle of abundant return through generous giving is ancient, documented and operates as a consistent economic law", "That wealth comes only through giving everything away", "That financial success requires spiritual perfection"], answer: 1 },
    ],
  },
  {
    id: 51, free: false,
    title: "Event Marketing for Builders",
    subtitle: "How to Use Gatherings to Grow Your Community",
    content: `A gathering is the most powerful marketing tool a Z2B builder has access to — and it requires no advertising budget, no professional production and no advanced marketing expertise. What it requires is a reason for people to come together, a space (physical or digital) for them to do so, and an host who creates an experience worth having. The builder who masters gatherings creates community density — the sense that Z2B is not just an app, but a living, breathing ecosystem of people who know each other.

Community density is one of the most powerful conversion factors in network marketing. A prospect who has attended a Z2B gathering — who has seen real people having real conversations about real transformation — converts at a dramatically higher rate than one who has only seen social media content. The gathering makes the abstract tangible.

**The 4 Types of Z2B Gatherings.** Type 1: The Online Community Session — a weekly or bi-weekly WhatsApp group audio call or Zoom session. 20-30 minutes. One builder shares a session insight. One shares a win. Two or three questions from attendees. Simple. Repeatable. Powerful. Type 2: The Prospect Introduction Session — a casual online session where existing builders invite 1-2 prospects each to hear about the EC philosophy from multiple voices. Not a pitch event — a conversation event. Type 3: The Team Recognition Event — quarterly celebration of milestones, upgrades and wins. Creates the felt experience of belonging to something that acknowledges its members. Type 4: The Physical Table — a meal, coffee session or gathering where the Z2B philosophy is discussed in a relaxed, social context. The table metaphor made literal.

**The Host Principle.** The quality of a gathering is determined by the quality of the host, not the venue or the production. A warm, prepared, genuinely interested host creates a gathering people want to return to — regardless of where it happens or how it looks. Your preparation as a host is an expression of the value you place on the people who accepted your invitation. Show up fully. The community grows from there.

[[MIRROR_MOMENT]]`,
    activity: "Plan your first or next Z2B gathering. Decide: which type of gathering, who will you invite (minimum 3 people), what the agenda will be (no longer than 45 minutes total), and what the one thing you want every attendee to leave having experienced. Set a date within the next 21 days. Put it in your calendar. Send the invitation today.",
    questions: [
      { q: "Community density describes:", options: ["The number of members in a Z2B team", "The sense that Z2B is a living ecosystem of people who know each other — the felt reality of belonging that converts prospects more effectively than content", "The frequency of social media posting", "The geographic concentration of builders in one area"], answer: 1 },
      { q: "A prospect who attends a gathering converts at a higher rate because:", options: ["They receive a special joining discount at events", "The gathering makes the abstract tangible — seeing real people having real conversations about real transformation removes uncertainty", "They are more motivated after social interaction", "Events create urgency through the group atmosphere"], answer: 1 },
      { q: "The Online Community Session works because:", options: ["Technology makes it accessible globally", "It is simple, repeatable and creates the regular rhythm of community — shared insights and wins that reinforce belonging", "It requires no preparation from the host", "Online attendance is higher than physical attendance"], answer: 1 },
      { q: "The quality of a gathering is determined primarily by:", options: ["The venue quality and production value", "The quality of the host — warmth, preparation and genuine interest in attendees creates a gathering people want to return to", "The size of the guest list", "The quality of the refreshments provided"], answer: 1 },
      { q: "The physical table gathering is described as:", options: ["The most formal type of Z2B event", "The Z2B table metaphor made literal — a meal or gathering where the philosophy is discussed in a relaxed social context", "Only appropriate for senior builders", "More effective than online gatherings for all audiences"], answer: 1 },
    ],
  },
  {
    id: 52, free: false,
    title: "Digital Marketing Fundamentals",
    subtitle: "Understanding Paid and Organic Traffic",
    content: `Digital marketing operates through two channels: organic traffic — the audience you build through consistent value creation over time — and paid traffic — the audience you purchase through advertising spend. Both have legitimate roles in a mature EC digital strategy. But the Entrepreneurial Consumer who is beginning their journey should understand the fundamental differences before investing in either.

Organic traffic is slow and compounding. A social media post today may reach 50 people. The same quality of post in 12 months, from an account with 2,000 engaged followers, may reach 20,000. The audience you build organically belongs to you — it grows through your content quality and consistency, not through a budget you may lose. Organic traffic requires time, content discipline and patience. Its return is delayed and then dramatic.

Paid traffic is fast and proportional. You spend R500, you reach a specific audience, you measure the result. You spend R5,000, you reach ten times the audience. The relationship between spend and reach is direct. But the moment you stop spending, the traffic stops. You are renting visibility, not building it. For the beginning EC with limited capital, paid traffic is rarely the right first investment — particularly when organic traffic through the Z2B Content Studio and Purple Cow strategy is available at no cost.

**The Z2B Digital Marketing Funnel.** Every piece of content you post is the top of a funnel. It drives awareness. The person sees it, becomes curious, and follows you or visits your profile. Your referral link or lead magnet is the middle of the funnel. It converts awareness into an action — a workshop sign-up. The 9-Day Nurture Engine and WhatsApp Launcher are the bottom of the funnel. They convert action into upgrade. Understanding this funnel means understanding that not every piece of content needs to sell. Awareness content serves a different function than conversion content — and both are necessary.

**The Metric That Matters Most.** For the beginning EC, the vanity metrics — followers, likes, views — are less important than one number: conversion rate. How many people who clicked your referral link actually completed a workshop session? Of those, how many upgraded to Bronze? That conversion rate, improved incrementally over time, is the metric that builds income. Not follower count.

[[MIRROR_MOMENT]]`,
    activity: "Map your current digital marketing funnel. At the top: where does your awareness content live and what platforms? Middle: where is your referral link accessible and what drives people to click it? Bottom: what happens after someone clicks? Is the 9-Day Nurture Engine active? Are you using the WhatsApp Launcher? Identify the weakest stage of your funnel and write one specific action to strengthen it.",
    questions: [
      { q: "Organic traffic is described as slow and compounding because:", options: ["Social media algorithms suppress organic content", "It builds gradually through consistency but accelerates as audience grows — the early investment eventually produces dramatic returns", "Organic content is lower quality than paid content", "Organic traffic requires less skill than paid advertising"], answer: 1 },
      { q: "Paid traffic is described as fast and proportional because:", options: ["Paid content is always higher quality", "The relationship between spend and reach is direct — but the traffic stops the moment spending stops, making it rented visibility rather than built equity", "Advertising platforms guarantee results", "Paid traffic converts better than organic traffic in all contexts"], answer: 1 },
      { q: "For the beginning EC, organic traffic is the recommended starting point because:", options: ["Paid advertising is illegal in network marketing", "Organic traffic through the Content Studio and Purple Cow strategy is available at no cost while paid traffic consumes capital before income is established", "Organic traffic always outperforms paid", "Z2B prohibits paid advertising"], answer: 1 },
      { q: "The metric that matters most for the beginning EC is:", options: ["Total follower count across all platforms", "Conversion rate — the percentage of referral link clicks that result in completed sessions and upgrades", "Daily post views and impressions", "Number of WhatsApp messages sent"], answer: 1 },
      { q: "Awareness content and conversion content serve different functions because:", options: ["They target different demographics", "The funnel requires both — awareness creates familiarity and trust while conversion content prompts specific action at the right moment", "Conversion content is more valuable and should be prioritised", "They should never appear on the same platform"], answer: 1 },
    ],
  },
  {
    id: 53, free: false,
    title: "SEO Basics for Builders",
    subtitle: "How to Be Found by People Who Are Already Looking",
    content: `Search Engine Optimisation is the practice of making your digital content findable by people who are already searching for what you offer. While paid advertising interrupts people who were not looking for you, SEO positions your content in front of people who are actively seeking answers to questions you can answer. This is the highest-quality traffic available: people already motivated by their own curiosity or need.

For a Z2B builder, SEO is relevant at two levels: personal profile optimisation (making your social media profiles findable when people search for EC content, network marketing opportunities or personal development) and content optimisation (creating content that answers the specific questions your target audience is already typing into search engines and social media search bars).

**The Keywords Your Audience Is Searching.** What questions are employed professionals searching when they feel stuck? "How to earn extra income while employed." "Network marketing that actually works." "Personal development courses for employees." "How to start a side business without quitting your job." "Entrepreneurial Consumer." Each of these is a content opportunity. A YouTube video, a blog post or a Facebook article that directly answers one of these questions positions you in front of people already looking for exactly what Z2B offers.

**The Four SEO Principles for Z2B Builders.** First: Consistency of identity across all platforms. Your name, photo and bio should be recognisable and consistent so that someone who finds you on one platform can find and verify you on others. Second: Keyword inclusion in your bios and content descriptions. Include the phrases your audience searches in your profile bio and content captions. Third: Answer questions specifically and generously. Content that directly answers a common question ranks higher and earns longer engagement than content that is general or promotional. Fourth: Link everything to your referral destination. Every piece of content, every profile, every answer — should have a pathway to your referral link for those who want to go deeper.

[[MIRROR_MOMENT]]`,
    activity: "Write your SEO bio for one platform — the single paragraph description that appears on your profile. It should include: who you are, what transformation you help people experience, two or three keywords that your ideal audience would search, and your referral link or a call to action. Optimise your chosen platform's bio with this text today.",
    questions: [
      { q: "SEO traffic is described as highest quality because:", options: ["It is cheaper than paid advertising", "It positions your content in front of people already motivated by their own curiosity or need — no interruption required", "SEO generates more traffic volume than other channels", "Search engines verify the quality of all SEO content"], answer: 1 },
      { q: "Keywords for Z2B builders are based on:", options: ["Z2B's internal marketing language", "The specific phrases your target audience is already typing when searching for solutions to the problems Z2B solves", "Trending topics on social media", "Terms recommended by the Z2B marketing team"], answer: 1 },
      { q: "Consistency of identity across platforms serves SEO by:", options: ["Creating a unified aesthetic", "Allowing people who find you on one platform to verify and find you on others — building credibility through cross-platform coherence", "Satisfying social media algorithm requirements", "Demonstrating professionalism to prospects"], answer: 1 },
      { q: "Content that directly answers a specific question performs better in SEO because:", options: ["Search engines favour educational content", "It earns longer engagement and higher relevance scores — people searching for that answer stay and consume it", "It is more shareable than general content", "Question-based content is easier to create"], answer: 1 },
      { q: "The Z2B SEO strategy prioritises:", options: ["Ranking first on Google for all searches", "Being findable by people already looking for what Z2B offers — personal development, EC philosophy, income without quitting employment", "Maximising follower count through search", "Avoiding paid advertising by ranking organically"], answer: 1 },
    ],
  },
  {
    id: 54, free: false,
    title: "Building a Basic Website",
    subtitle: "Your Digital Headquarters on Owned Land",
    content: `A website is your only fully owned piece of digital real estate. Every other platform you build on — Facebook, TikTok, Instagram, YouTube — belongs to someone else. They set the rules, control your access, and can remove your content at their discretion. A website that you own, on a domain that you registered, hosted on a server you pay for — is yours. Completely. Permanently. No algorithm can hide it. No policy change can suspend it.

For the Z2B builder, a personal website serves a specific strategic function: it is the one place on the internet where your full story, your full philosophy and your full invitation exists exactly as you intend it, without the constraints and distractions of any platform's user interface. A visitor to your website is a visitor to your world — not to a platform where your content competes with cat videos and political arguments.

**What a Z2B Builder's Website Should Contain.** Page 1: About — your EC story. Who you were before Z2B, what shifted, who you are becoming. Written in your authentic voice. With a clear invitation. Page 2: The EC Philosophy — a clear, accessible explanation of the third path. Why employment alone is not enough. Why full entrepreneurship is too risky for most. Why the Entrepreneurial Consumer model is the answer. With your referral link. Page 3: Resources — free content that serves your audience. Blog posts, video recordings, guides. Page 4: Contact — how to reach you directly.

**Building Without Technical Expertise.** You do not need to know how to code to build a professional website. Platforms like Carrd, Wix, Squarespace and WordPress enable anyone to build a clean, functional, professional website without technical expertise. Cost: R0 to R500 per month depending on features needed. Domain name: R100-R200 per year. The investment is minimal. The return — a permanent, owned, professional digital headquarters — is significant.

**The Website as Authority Signal.** A personal website communicates something that no social media profile can fully replicate: permanence and seriousness. A prospect who visits your social media profile sees content. A prospect who visits your website sees a committed person who has invested in their professional digital presence. That commitment is itself a form of credibility.

[[MIRROR_MOMENT]]`,
    activity: "Create the outline for your personal Z2B website. Write the content for each of the four pages in point form — not finished copy, just the key points you want each page to communicate. Then research one free or low-cost website builder (Carrd is recommended as the simplest starting point) and set up your basic site structure this week. Your digital headquarters deserves to exist.",
    questions: [
      { q: "A website is described as fully owned digital real estate because:", options: ["Websites are more prestigious than social media", "It is the only digital presence you control completely — no algorithm hides it, no policy change can suspend it, it belongs to you entirely", "Websites rank higher in search results than social media", "Building a website demonstrates advanced technical skills"], answer: 1 },
      { q: "A visitor to your website differs from a social media visitor because:", options: ["They spend more time on websites", "They are in your world without platform distractions — your story, your philosophy, your invitation as you intend it", "Website visitors convert better statistically", "They have stronger internet connections"], answer: 1 },
      { q: "The four pages recommended for a Z2B builder's website are:", options: ["Home, Products, Pricing, Contact", "About (EC story), EC Philosophy, Resources (free content), Contact", "Blog, Social Media, Testimonials, Join", "Mission, Vision, Values, Team"], answer: 1 },
      { q: "A website communicates authority that social media cannot replicate because:", options: ["Websites are technically superior platforms", "Permanence and seriousness — a committed person who has invested in their professional digital presence", "Websites are verified by search engines", "Professional photography is only possible on websites"], answer: 1 },
      { q: "Building a website without technical expertise is possible through:", options: ["Hiring a professional web developer exclusively", "Platforms like Carrd, Wix or WordPress that enable professional sites without coding knowledge at minimal cost", "Using Z2B's built-in website builder", "Only through advanced technical training"], answer: 1 },
    ],
  },
  {
    id: 55, free: false,
    title: "E-commerce for Entrepreneurial Consumers",
    subtitle: "How to Sell Products 24 Hours a Day",
    content: `E-commerce is the practice of selling products through digital channels — websites, social media shops, digital marketplaces. For the Entrepreneurial Consumer, e-commerce represents the most scalable income model available: once a product is listed and a payment system is configured, sales can happen at 3am on a Sunday without any active involvement from the seller. The store is open permanently. The seller is available to live.

The most relevant application of e-commerce for a Z2B builder at this stage is not physical product retail — it is digital product sales. An ebook, a course, a template, a coaching programme, a workshop recording. These products are created once, hosted digitally, and can be sold indefinitely to anyone in the world with an internet connection. No inventory. No shipping. No manufacturing costs. The margin is extraordinarily high because the only cost is creation — and creation happens once.

**The Z2B Marketplace Connection.** At Gold and Platinum tier, Z2B builders gain access to the Z2B Marketplace — a platform for selling digital products and services to the Z2B community and beyond, retaining 95% of each sale price. This is Z2B's built-in e-commerce infrastructure. The builder who has created a coaching programme, a digital guide or a resource pack has a ready-made storefront with an engaged, motivated audience.

**The Four Steps to Your First Digital Product Sale.** Step 1: Identify the knowledge product (what you know that others will pay to access). Step 2: Create the product (an ebook written over two weekends, a video course recorded on your phone). Step 3: Set up a payment mechanism (PayPal, PayFast, or the Z2B Marketplace when you reach Gold tier). Step 4: Promote the product to your existing audience through your social media, email list, and WhatsApp community. Your first sale is often to someone who already follows you — because they already trust you.

[[MIRROR_MOMENT]]`,
    activity: "Identify your potential first digital product. What knowledge do you have that could be packaged as an ebook (5-10 pages), a video guide (3-5 short recordings), or a template pack? Who specifically would buy it? At what price? Write a product concept — title, format, target audience, price point and the transformation it delivers. You now have the blueprint for your first digital product.",
    questions: [
      { q: "E-commerce is described as the most scalable income model because:", options: ["Online businesses are easier to run than physical ones", "Sales can happen at any time without active involvement — the store is permanently open while the seller is free to live", "E-commerce platforms are free to use", "Digital products always generate higher income than services"], answer: 1 },
      { q: "Digital products are preferred over physical products for beginning ECs because:", options: ["Digital products are always more valuable", "No inventory, no shipping, no manufacturing costs — the only cost is creation which happens once, producing extraordinary margins", "Digital products are easier to market", "Physical products require a business registration"], answer: 1 },
      { q: "The Z2B Marketplace benefits Gold and Platinum builders by:", options: ["Generating automatic traffic to their listings", "Providing a built-in e-commerce infrastructure with an engaged audience, retaining 95% of every sale price", "Creating digital products on their behalf", "Eliminating the need for personal marketing"], answer: 1 },
      { q: "The first sale of a digital product typically comes from:", options: ["Cold traffic from social media advertising", "Someone who already follows and trusts the creator — because existing relationship makes the purchase decision easier", "The Z2B platform's automated promotion", "Random e-commerce marketplace visitors"], answer: 1 },
      { q: "The four steps to first digital product sale are:", options: ["Research, design, manufacture, distribute", "Identify the knowledge product, create it, set up payment, promote to existing audience", "Register a business, open a bank account, create inventory, list products", "Join the Marketplace, upload products, run ads, collect payments"], answer: 1 },
    ],
  },
  {
    id: 56, free: false,
    title: "Automating Your Business Processes",
    subtitle: "Systems That Replace Repetitive Manual Tasks",
    content: `Every task you do manually that follows the same pattern every time is a task that can be automated. And every automated task is an hour of your time returned to you — to invest in the high-value, relationship-based, creative activities that only you can do. Automation is not laziness. It is the intelligent application of technology to liberate human time and attention for work that actually requires humanity.

The Entrepreneurial Consumer's relationship with automation is intentional: identify the repetitive, rule-based tasks in your Z2B building process, find or build systems that handle them, and redirect the recovered time toward higher-value activities. This is the Systems table leg in operational practice.

**What Is Already Automated in Z2B.** The 9-Day Nurture Engine — automated email sequences to every prospect who signs up through your referral link. The WhatsApp Launcher scripts — pre-written, pre-formatted, one-tap execution. The compensation calculation — your ISP, QPB and TSC are calculated automatically. The pipeline tracking — prospects move through stages based on sign-up date automatically. These systems collectively handle hours of manual work every day on your behalf. Learn them fully and use them consistently.

**What You Can Automate Beyond Z2B.** Social media scheduling: tools like Buffer, Later or Meta's native scheduler allow you to batch-create a week's worth of content and schedule it to post automatically. Email sequences: MailerLite, Mailchimp and ConvertKit all allow you to create automated sequences that send based on subscriber actions. WhatsApp Broadcast scheduling: certain tools allow pre-scheduled broadcast messages to segmented lists. Calendar scheduling: tools like Calendly eliminate the back-and-forth of scheduling coaching appointments.

**The Automation Audit.** Once per quarter, list every task you perform manually in your Z2B building process. For each, ask: Does this follow a consistent pattern? Could a tool do this for me? If yes — find the tool. The time investment of setting up automation pays back within weeks and compounds indefinitely. The builder who automates their repetitive work creates more time per day without extending their hours.

[[MIRROR_MOMENT]]`,
    activity: "List every task you perform manually in your Z2B building process this week. Beside each, write: AUTOMATE (could be done by a tool), DELEGATE (could be done by someone else), or KEEP (requires your specific attention). Then research and implement one automation this week — even a simple social media scheduler. Calculate how many hours per month this single automation returns to you.",
    questions: [
      { q: "Automation is described as intelligent rather than lazy because:", options: ["Automated systems are always more accurate than human execution", "It deliberately liberates human time and attention from rule-based tasks for work that actually requires humanity", "All successful businesses are fully automated", "Automation reduces the need for human skills"], answer: 1 },
      { q: "The Z2B processes already automated include:", options: ["Content creation and social media posting", "The 9-Day Nurture Engine, WhatsApp Launcher scripts, compensation calculation, and pipeline tracking", "Team coaching and leadership development", "All communication with prospects and builders"], answer: 1 },
      { q: "Social media scheduling tools serve automation by:", options: ["Creating content automatically using AI", "Allowing content to be batch-created and scheduled to post at optimal times without daily manual intervention", "Guaranteeing higher engagement rates", "Replacing the need for original content creation"], answer: 1 },
      { q: "The automation audit should be performed:", options: ["Only when revenue justifies the investment in tools", "Quarterly — systematically reviewing all manual tasks and implementing tool solutions for those that follow consistent patterns", "Once at the start of your Z2B journey", "Only by builders at Silver tier and above"], answer: 1 },
      { q: "The compound benefit of automation is:", options: ["A one-time reduction in workload", "Time returned indefinitely — each automated task creates recovered hours every week that compound into significant additional building capacity over months and years", "A reduction in the need for content creation", "Automatic income growth proportional to the tasks automated"], answer: 1 },
    ],
  },
  {
    id: 57, free: false,
    title: "CRM — Customer Relationship Management",
    subtitle: "How to Manage and Nurture Your Contacts at Scale",
    content: `As your Z2B network grows, the single greatest challenge becomes maintaining the quality of each individual relationship at scale. It is natural and easy to know your first 5 builders deeply. It becomes harder to maintain that depth at 20, at 50, at 200. The relationships do not become less important as the team grows — but the human bandwidth available to nurture them does not scale automatically. This is where CRM — Customer Relationship Management — becomes a strategic capability rather than a corporate tool.

CRM is simply the practice of intentionally managing information about your contacts — who they are, what they need, where they are in their journey, what your last interaction was, and what the next meaningful action with them should be. My Sales Funnel in Z2B is your first CRM — it tracks your prospects through the pipeline with date-based visibility. But as your team grows, you will benefit from extending this thinking to your builders, your inactive contacts and your warm audience.

**The Five Data Points That Matter for Every Contact.** Name and contact details (obvious but often poorly organised). Last meaningful interaction — what was discussed, what was promised, what changed. Current status — prospect, active builder, inactive builder, long-term follow-up. Key personal context — their situation, their motivation, their challenges. Next action with a date — the specific thing you will do next and when.

**Low-Tech CRM for Beginning Builders.** You do not need an expensive software system. A simple spreadsheet with these five columns, maintained consistently, creates more relationship clarity than most builders have. A free tool like Notion, Airtable or Google Sheets enables a functional CRM at no cost. The key is not the tool — it is the discipline of recording interactions promptly and reviewing the list weekly to identify who needs attention.

**The Quality-at-Scale Principle.** The builder who knows where every significant contact is in their journey, and who reaches out at the right moment with the right message, creates a experience of being deeply cared for — regardless of the size of their network. This is not manipulation. It is intentional relationship stewardship. And it converts more prospects, retains more builders and generates more referrals than any marketing technique available.

[[MIRROR_MOMENT]]`,
    activity: "Create your basic CRM today. Open a Google Sheet or Notion page. Create 5 columns: Name, Last Interaction (date and summary), Status (prospect/builder/inactive), Key Context (their situation), Next Action (what and when). Add your top 10 most important contacts. Update it weekly. This simple discipline will transform the quality of your relationship management within 30 days.",
    questions: [
      { q: "CRM becomes necessary as a team grows because:", options: ["Larger teams require more formal management structures", "Human bandwidth for relationship depth does not scale automatically — intentional systems are needed to maintain quality at scale", "Software tools are required by Z2B at certain membership levels", "Large teams generate more income and require more sophisticated management"], answer: 1 },
      { q: "My Sales Funnel in Z2B functions as a CRM by:", options: ["Automatically building relationships with all contacts", "Tracking prospects through the pipeline with date-based visibility — providing the structural framework that prevents important contacts from being forgotten", "Replacing all personal follow-up with automated messages", "Managing team compensation and earnings tracking"], answer: 1 },
      { q: "The five data points for every contact are:", options: ["Name, phone number, email, address, birthday", "Name and contact details, last meaningful interaction, current status, key personal context, next action with a date", "Referral code, tier, join date, earnings, team size", "Name, social media handles, content preferences, posting frequency, conversion rate"], answer: 1 },
      { q: "The quality-at-scale principle produces better conversions because:", options: ["Larger networks statistically produce more sales", "Knowing where every contact is in their journey enables reaching out at the right moment with the right message — creating a felt experience of deep personal care", "Automated CRM systems generate more personalised messages", "Scale creates social proof that increases individual conversion rates"], answer: 1 },
      { q: "A low-tech CRM using a spreadsheet is effective because:", options: ["Spreadsheets are as sophisticated as paid CRM tools", "The key is the discipline of recording and reviewing — not the sophistication of the tool — and a spreadsheet provides the necessary structure at no cost", "Technology should be minimised in relationship management", "Paid CRM tools are not allowed in Z2B"], answer: 1 },
    ],
  },
  {
    id: 58, free: false,
    title: "The Subscription Model",
    subtitle: "Building Recurring Revenue That Compounds Monthly",
    content: `The subscription model is the most powerful income architecture available to the Entrepreneurial Consumer — and the most consistently misunderstood. Most people think of subscriptions as something large companies use: Netflix, Spotify, gym memberships. But the subscription principle is available at any scale, for any valuable offering, and it produces the most predictable and compounding form of income available to an individual builder.

A subscription is simply an agreement to provide ongoing value in exchange for a regular recurring payment. The key word is ongoing. Subscriptions work because they align the incentive of the provider (recurring income without constant resale effort) with the genuine need of the recipient (consistent access to ongoing value). When the value genuinely continues, the subscription continues. And the income compounds: 10 subscribers become 20, become 50, and each month begins with a guaranteed income base before a single new sale is made.

**The Z2B TSC as a Subscription Model.** Your TSC income is structurally similar to a subscription: your team generates sales every month, and your TSC flows to you as a regular recurring payment based on their consistent activity. You do not resell to each team member monthly. The ongoing relationship — the team culture, the coaching, the community — is what maintains the activity. Your role is to maintain the value proposition of your leadership. This is subscription economics at the team level.

**Subscription Products for EC Builders.** A monthly coaching group: R150-R500 per member per month, providing regular sessions, accountability and community for a defined audience. A monthly resource subscription: curated tools, templates, insights or content delivered regularly to subscribers. A membership site: ongoing access to your accumulated knowledge, growing over time. The key to a successful subscription is that the value genuinely continues and grows — not just a first-month offer that deteriorates.

**The Minimum Viable Subscription.** You do not need 100 subscribers to begin. Begin with 5. Five people paying R200 per month is R1,000 in recurring income — before any other Z2B activity. Add 5 more in month 2. The compounding of small subscriber additions creates income stability that one-time product sales rarely provide.

[[MIRROR_MOMENT]]`,
    activity: "Design your minimum viable subscription product. What ongoing value could you provide to a specific audience monthly? Name it. Describe the value delivered each month. Set the price. Identify 10 people in your network who would potentially subscribe. Calculate what 5 subscribers at that price would add to your monthly income. This is your subscription business plan.",
    questions: [
      { q: "The subscription model produces the most predictable income because:", options: ["Subscribers pay in advance", "Each month begins with a guaranteed income base from existing subscribers before any new sales are made — creating compounding stability", "Subscription products require no ongoing work", "Subscribers rarely cancel"], answer: 1 },
      { q: "A subscription aligns provider and recipient incentives because:", options: ["Both parties pay the same amount", "The provider receives recurring income without constant resale effort; the recipient gets consistent access to ongoing value — when value continues, both benefit", "Subscriptions are legally binding contracts", "The model guarantees income regardless of value delivered"], answer: 1 },
      { q: "Z2B TSC is structurally similar to a subscription because:", options: ["TSC is paid monthly like a subscription fee", "Your team generates recurring sales monthly and TSC flows to you regularly based on their consistent activity — maintained by the ongoing value of your leadership", "TSC and subscriptions both have a fixed monthly fee", "Both require a minimum monthly commitment"], answer: 1 },
      { q: "The minimum viable subscription begins with:", options: ["100 subscribers to make the economics work", "5 subscribers — a small base that creates immediate compounding momentum and proves the model before scaling", "A fully developed product at full price", "Marketing approval from Z2B leadership"], answer: 1 },
      { q: "The key to a successful subscription is:", options: ["A compelling introductory offer that attracts initial subscribers", "Ongoing value that genuinely continues and grows — not a first-month offer that deteriorates into irrelevance", "A low price point that keeps churn minimal", "Automated delivery that requires no ongoing creator involvement"], answer: 1 },
    ],
  },
  {
    id: 59, free: false,
    title: "Passive Income Principles",
    subtitle: "What Real Passive Income Looks Like and What It Requires",
    content: `The phrase 'passive income' has been used so liberally in online marketing that it has almost lost its meaning. It conjures images of income arriving effortlessly while the earner sleeps on a beach. This image is not completely wrong — but it is dishonestly incomplete. Real passive income is earned twice: once through significant upfront work to build the income-generating asset, and then continuously through the asset's operation. The beach is real. But it comes after years of inland building.

The Entrepreneurial Consumer approaches passive income with clear-eyed honesty: passive income is not income that requires no work. It is income that requires no additional work per unit earned. Once the system is built, each new unit of income does not require a proportional unit of effort. That asymmetry — where effort is front-loaded and income is back-loaded — is what makes passive income worth pursuing.

**The Three Legitimate Passive Income Categories for ECs.** Category 1: Residual income from network activity — your Z2B TSC. Once your team is active and self-sustaining, commissions arrive without you personally making each sale. This is genuinely passive relative to the income generated. Category 2: Digital product income — an ebook, a course, a template created once and sold indefinitely. After creation and initial marketing, each sale requires no additional effort from you. Category 3: Investment income — dividends, rental income, interest on saved capital. This requires capital to build, but once built, it flows independently of your activity.

**What Every Passive Income Stream Has in Common.** They require an initial non-passive phase. You build the team before TSC flows. You create the product before sales happen. You accumulate the capital before investment income arrives. Anyone who promises passive income with no upfront work is selling a fiction. The Z2B workshop is honest: 9 morning sessions, 9 evening sessions, 81 paid sessions — all preparing you to build with the patience and discipline that real passive income actually requires.

[[MIRROR_MOMENT]]`,
    activity: "Map your current passive income journey. For each of the three categories: what have you already built toward it, what is the next specific action, and what is a realistic 12-month milestone? You may be at zero in all three right now — that is honest information, not failure. Zero is the starting point. Your 12-month milestone is the destination.",
    questions: [
      { q: "Real passive income requires:", options: ["No work at any stage", "Significant upfront work to build the income-generating asset, then continuous income from the asset's operation — the effort is front-loaded, the income is back-loaded", "A large initial capital investment only", "Technical expertise in financial markets"], answer: 1 },
      { q: "The distinction between passive income and no-effort income is:", options: ["Passive income requires less effort per month", "Passive income requires no additional work per unit earned — each new income unit does not require a proportional effort unit", "Passive income is generated entirely by software systems", "There is no meaningful distinction — all income requires active work"], answer: 1 },
      { q: "Z2B TSC qualifies as passive income because:", options: ["TSC is generated by the platform automatically", "Once a team is active and self-sustaining, commissions arrive without the builder personally making each individual sale", "TSC is paid regardless of team activity", "All network marketing income is classified as passive"], answer: 1 },
      { q: "Every legitimate passive income stream has in common:", options: ["High initial capital requirements", "An initial non-passive building phase — the passive element is always earned by upfront active investment of time, effort or capital", "Government or regulatory approval", "Large team or network support"], answer: 1 },
      { q: "The Z2B workshop's honesty about passive income means:", options: ["It guarantees passive income after completion", "It prepares builders with the patience and discipline real passive income requires — knowing that 99 sessions of preparation precede the passive phase", "It only covers active income strategies", "Passive income is only discussed in sessions 61-99"], answer: 1 },
    ],
  },
  {
    id: 60, free: false,
    title: "Investing for Beginners",
    subtitle: "Understanding Assets That Work While You Sleep",
    content: `Investing is the act of deploying resources today — money, time, knowledge — to acquire assets that will produce returns in the future. The Entrepreneurial Consumer's entire philosophy is built on this principle: stop consuming and start investing. Every Bronze membership you help facilitate is an investment in a relationship that may generate TSC for years. Every workshop session you complete is an investment in the knowledge asset you are building. Every post you publish is an investment in the audience asset that compounds over time.

But in this session, we focus specifically on financial investing — the deployment of money into vehicles that generate returns. Not because financial investing is more important than the other forms — but because financial literacy requires that you understand the options available to you and the principles that govern them.

**The Investment Spectrum for the Beginning EC.** At the lowest end of complexity and risk: a high-interest savings account or money market account. Your emergency fund lives here. Returns are low but guaranteed. Next: Government bonds and fixed deposits. Predictable returns, low risk, suitable for capital you do not need immediately. Next: Unit trusts and ETFs (Exchange Traded Funds). Diversified exposure to a basket of stocks. Accessible from R500/month. Appropriate for 5+ year investment horizons. Then: Property. High capital requirement but powerful leverage and rental income potential. Finally: Business investment — your Z2B tier upgrades, your digital product creation, your skills development. Often the highest return of all for the beginning EC, because you can directly influence the outcome.

**The Principle of Starting Small and Starting Now.** R200 invested monthly at 12% annual return becomes R46,000 over 10 years. The same R200 per month at 10 years, started 5 years later, produces R23,000. The difference is not the amount — it is the time. Time in the market consistently outperforms the strategy of waiting for the perfect moment to start. Begin with whatever you have. The habit of investing is more valuable than the amount invested in the early years.

[[MIRROR_MOMENT]]`,
    activity: "Identify your first investment action. It can be as simple as opening a high-interest savings account this week. Or setting up a R200/month debit order to a money market fund. Or reinvesting your next Z2B commission into a tier upgrade. Write the specific action, the amount, and the date you will execute it. Investment begins with one decision, made and acted on today.",
    questions: [
      { q: "The EC's philosophy of investing includes:", options: ["Only financial investment in stocks and property", "The deployment of money, time and knowledge into assets — including workshop sessions, social media content and team relationships as legitimate investment vehicles", "Only investments that produce immediate returns", "Investment reserved for those who have eliminated all debt first"], answer: 1 },
      { q: "The investment spectrum for beginning ECs starts with:", options: ["High-risk, high-return investments to accelerate growth", "High-interest savings accounts — low return but guaranteed, appropriate for emergency fund capital", "Property — the most stable long-term investment", "Business investment — the highest potential return"], answer: 1 },
      { q: "Business investment — Z2B tier upgrades, skills development — is described as often highest return because:", options: ["Business investments are tax-advantaged", "The beginning EC can directly influence the outcome — unlike passive financial investments where returns are market-dependent", "Business investments always outperform financial markets", "Z2B guarantees returns on tier investments"], answer: 1 },
      { q: "Starting with R200/month outperforms waiting to start with more because:", options: ["Larger amounts always produce better results eventually", "Time in the market consistently outperforms timing the market — compound growth over years produces outcomes that delayed but larger contributions cannot match", "R200/month reaches the investment minimum requirement", "Starting small reduces the psychological barrier to investing"], answer: 1 },
      { q: "The most valuable habit in the early years of investing is:", options: ["Choosing the highest-return investment vehicle", "The consistent habit of investing regardless of amount — the discipline compounds as reliably as the returns", "Maximising the amount invested monthly", "Diversifying across all available investment categories simultaneously"], answer: 1 },
    ],
  },

  // ---- PAID TIER: SESSIONS 61–99 — FULLY WRITTEN ----
  {
    id: 61, free: false,
    title: "Property as a Wealth Vehicle",
    subtitle: "How Real Estate Fits Into the Entrepreneurial Consumer's Legacy Plan",
    content: `Property is the oldest wealth vehicle in human history. For thousands of years, the ownership of land and physical structures has been one of the most reliable mechanisms for wealth preservation and transfer across generations. The Entrepreneurial Consumer's legacy plan — the fourth table leg — often includes property because property does something that most financial assets cannot: it combines income generation (rental yield), capital appreciation (increasing value over time) and physical legacy (something tangible to pass to the next generation).

You do not need to start with property. You need to start with understanding it — so that when the income from your Z2B architecture reaches the threshold that makes property investment possible, you are ready to act rather than study.

**The Three Ways Property Generates Wealth.** First: Capital Appreciation. Property in growing urban areas has historically increased in value over time. A R600,000 townhouse purchased today may be worth R900,000 in 10 years. The gain is R300,000 — on money you borrowed from a bank. Second: Rental Income. A tenant pays rent that covers your bond repayment, rates and maintenance — and ideally generates surplus cash flow. You are building equity in an asset your tenant is paying for. Third: Leverage. You can control a R600,000 asset with a R60,000 deposit (10%). No other investment vehicle allows you to control 10x your capital with a single decision.

**The Z2B Path to Property.** The journey to property ownership for the beginning EC follows a sequence: first, build the financial buffer and the Z2B income to demonstrate debt serviceability. Second, use Z2B TSC income to supplement income assessment for bond qualification. Third, begin with a single residential investment property — a small, rentable unit in a high-demand area. Fourth, use rental income and Z2B income to fund the second. The Z2B income does not just build its own architecture — it funds the property architecture beside it.

**The Honest Caution.** Property requires capital, patience and knowledge. It is not a quick win. Poorly managed property investments produce losses, legal complications and financial stress. Enter the property market when your financial foundation is stable, your income is diversified, and you have the knowledge to evaluate a property on its merits — not just its aspirational appeal.

[[MIRROR_MOMENT]]`,
    activity: "Research one residential property in your target area right now. Find the listing price, estimated rental yield, bond repayment at 10% deposit, and estimated municipal rates. Calculate: does the rental income cover the bond plus costs? What is the estimated capital appreciation over 10 years at 5% annual growth? This is your first property investment analysis.",
    questions: [
      { q: "The three ways property generates wealth are:", options: ["Purchase, improvement, resale only", "Capital appreciation, rental income and leverage — together creating a compounding wealth effect", "Mortgage tax deductions, depreciation allowances, and capital gains exemptions", "Location, location and location"], answer: 1 },
      { q: "Property leverage describes:", options: ["The ability to negotiate purchase price", "Controlling a large asset (R600,000 property) with a small deposit (R60,000) — accessing 10x your capital through bank borrowing", "The rental income return relative to purchase price", "The legal rights of property ownership"], answer: 1 },
      { q: "The Z2B path to property ownership includes:", options: ["Buying property before establishing income stability", "Building financial buffer and Z2B income first, then using Z2B TSC income to supplement bond qualification assessment", "Using property as the first investment before Z2B", "Only buying property at Platinum tier"], answer: 1 },
      { q: "Rental income in a well-structured property investment:", options: ["Must exceed the bond by at least 50%", "Covers bond repayment, rates and maintenance — the tenant builds equity in an asset the investor controls", "Is unreliable and should not be factored into investment decisions", "Is only significant in commercial property"], answer: 1 },
      { q: "The honest caution about property investment is:", options: ["All property investments generate reliable returns", "Property requires capital, patience and knowledge — enter only when financial foundation is stable, income diversified, and evaluation skills developed", "Property should be avoided by employed individuals", "Small properties are never profitable investments"], answer: 1 },
    ],
  },
  {
    id: 62, free: false,
    title: "Business Registration and Structures",
    subtitle: "When and How to Formalise Your Enterprise",
    content: `Most Entrepreneurial Consumers begin building before they formalise. This is exactly right. The discipline of waiting until everything is legally structured before earning your first rand is the discipline that kills more small enterprises before they start than any other. Build first. Earn first. Formalise when the income justifies the administrative cost and when the business structure genuinely serves the operation.

But there does come a point — and it arrives sooner than most new builders expect — when operating as an unregistered individual creates tax inefficiencies, limits your ability to open business bank accounts, reduces your credibility with certain partners and clients, and leaves you personally exposed to liability. Understanding the options available in South Africa and Africa more broadly is the beginning of making an informed formalisation decision.

**The Four Common Business Structures.** Structure 1: Sole Proprietor. You trade in your own name. Simplest to operate. No registration required beyond tax registration. Personal liability unlimited — your personal assets are exposed to business debts. Appropriate for very early stage with minimal financial risk. Structure 2: Closed Corporation (CC). Being phased out in South Africa but many still exist. Provides limited liability. Requires CIPC registration. Structure 3: Private Company (Pty Ltd). The most common formal structure. Limits personal liability to your shareholding. Provides credibility. Can open business bank accounts. CIPC registration required. Annual compliance obligations. Structure 4: Non-Profit Organisation (NPO) or Trust. Relevant for builders whose legacy work involves community impact, faith-based organisations or educational programmes.

**The Z2B Builder's Formalisation Trigger.** Consider registering when: your monthly Z2B and business income exceeds R10,000 consistently, you are working with corporate clients or institutions that require invoices from a registered entity, you want to open a dedicated business bank account, or your tax situation would benefit from deducting business expenses. The cost of CIPC registration in South Africa is under R200. The administrative overhead of a Pty Ltd is manageable from month one.

[[MIRROR_MOMENT]]`,
    activity: "Research the CIPC registration process for a Private Company (Pty Ltd) in your country. Find the exact cost, the documents required, and the approximate timeline. Then decide: am I at the trigger point where formalisation serves my business? If yes, initiate the process this week. If not, write the specific milestone that will trigger your formalisation decision.",
    questions: [
      { q: "The advice to build and earn before formalising is based on:", options: ["Legal requirements that prevent pre-registration trading", "The reality that waiting for perfect legal structure before earning kills enterprises before they start", "Tax regulations that only apply to registered businesses", "A Z2B policy recommendation"], answer: 1 },
      { q: "A Pty Ltd (Private Company) provides value to the EC builder by:", options: ["Eliminating all business tax obligations", "Limiting personal liability, enabling business bank accounts, and providing credibility with institutional partners and clients", "Guaranteeing business success", "Reducing SARS tax assessments automatically"], answer: 1 },
      { q: "Sole proprietor trading is described as appropriate for:", options: ["All stages of business development", "Very early stage with minimal financial risk — when the simplicity of no registration outweighs the risk of unlimited personal liability", "The most profitable businesses", "International trading only"], answer: 1 },
      { q: "The Z2B builder's formalisation trigger typically occurs when:", options: ["Joining Z2B at any tier", "Monthly income exceeds R10,000 consistently, corporate clients require registered invoices, or tax efficiency requires business expense deductions", "Completing Session 62 of the workshop", "The team reaches 10 members"], answer: 1 },
      { q: "The most significant risk of remaining an unregistered sole proprietor as income grows is:", options: ["Higher tax rates for unregistered traders", "Unlimited personal liability — business debts and legal claims expose personal assets including property and savings", "Inability to use social media for business", "Losing Z2B membership eligibility"], answer: 1 },
    ],
  },
  {
    id: 63, free: false,
    title: "Tax Basics for Builders",
    subtitle: "What You Don't Know About Tax Is Costing You Money",
    content: `The two most expensive things in the Entrepreneurial Consumer's financial life are ignorance about money and ignorance about tax. The first we address throughout this workshop. The second requires its own focused session — because what you do not know about tax is, right now, costing you money that you have legally earned the right to keep.

Tax is not a moral obligation to pay as much as possible. It is a legal obligation to pay exactly what you owe — no more and no less. The person who over-pays tax through ignorance is not more virtuous than the person who uses every legal deduction available. They are simply less informed. And information, in tax, translates directly to rands in your pocket.

**What Z2B Builders Should Know About Their Tax Obligations.** All income earned — including Z2B ISP, QPB and TSC commissions — is taxable income in South Africa (and most jurisdictions). It must be declared to SARS in your annual tax return. If you are registered as an individual taxpayer, it is added to your employment income and taxed at your marginal rate. If you are trading through a company, your business income is taxed at the corporate rate (28% in South Africa as of current rates). Understanding which structure is more tax efficient for your level of income is worth a conversation with a tax professional.

**The Legal Deductions Available to Builders.** Every expense incurred in generating your Z2B income is potentially tax-deductible. This includes: your Z2B membership fees and tier upgrades (business investment), your smartphone contract or data costs proportional to business use, your home office if used exclusively and regularly for business, your content creation tools, your internet connectivity, transport to business-related events, and professional development costs including workshop fees. These deductions reduce your taxable income — and therefore your tax liability.

**The SARS e-Filing Habit.** Every builder should be registered on SARS eFiling, submit their return on time every year, and maintain records of all income and deductible expenses. Receipts. Bank statements. WhatsApp records of business transactions. The habit of record-keeping is not bureaucratic — it is the foundation of legal tax optimisation and the defence against any future audit.

[[MIRROR_MOMENT]]`,
    activity: "Register on SARS eFiling if you have not already. Review your last 12 months of Z2B-related income and expenses. List every potential deductible expense. Calculate your approximate taxable Z2B income after deductions. If this is your first tax return including business income, book a 30-minute consultation with a tax professional — the cost is deductible and the knowledge compounds annually.",
    questions: [
      { q: "Tax obligation for the EC means:", options: ["Paying as much tax as possible to demonstrate patriotism", "Paying exactly what is legally owed — no more through ignorance, no less through evasion", "Minimising all tax payments through any available means", "Only declaring income from formal employment"], answer: 1 },
      { q: "Z2B ISP, QPB and TSC commissions are:", options: ["Tax-free as network marketing income", "Taxable income that must be declared to SARS in your annual tax return — added to employment income and taxed at marginal rate", "Only taxable above R100,000 annual income", "Subject to special flat-rate network marketing tax"], answer: 1 },
      { q: "Legal tax deductions for Z2B builders include:", options: ["Personal grocery expenses and clothing", "Z2B membership costs, smartphone and data proportional to business use, home office, content tools, business transport and professional development", "All living expenses incurred while earning Z2B income", "Deductions are not available to individual sole proprietors"], answer: 1 },
      { q: "The SARS eFiling habit is described as:", options: ["Bureaucratic overhead with no practical benefit", "The foundation of legal tax optimisation and audit defence — record-keeping translates directly into rands legally kept", "Only necessary when audited by SARS", "Optional for income below the tax threshold"], answer: 1 },
      { q: "A tax professional consultation for builders is worth the cost because:", options: ["It is mandatory for network marketing income", "The knowledge compounds annually — legal deductions discovered once continue saving tax every year, far exceeding the once-off consultation fee", "SARS requires proof of professional advice", "It reduces the probability of being audited"], answer: 1 },
    ],
  },
  {
    id: 64, free: false,
    title: "Banking for Business",
    subtitle: "Separating Personal and Business Finances From Day One",
    content: `One of the most consequential and most easily avoided financial mistakes a beginning entrepreneur makes is mixing personal and business finances. It seems harmless — especially when the business is small and the income is modest. But the cost of mixing compounds over time: tax confusion, inability to accurately measure business profitability, vulnerability to lifestyle inflation, credibility loss with clients and institutions, and eventual legal liability complications.

The solution is simple, immediate and low-cost: open a separate account for your business income and expenses on the day you decide to treat your Z2B building as a real business. Not when the income is significant. Not when you formalise the company. Today. From this moment forward, every Z2B commission goes into that account and every Z2B expense comes from it.

**The Four Banking Structures for the EC Builder.** Level 1: A personal savings account dedicated exclusively to business — not a business account, but personally separated. Cost: nothing. Available immediately. Suitable for very early stage. Level 2: A business cheque account in your own name as a sole proprietor. Slightly more credibility than a personal account. Available without company registration. Level 3: A business account in your company name (Pty Ltd). Requires company registration. Provides full credibility and legal separation. Level 4: A business account with multiple features — merchant payment acceptance, multi-signatory access, business credit facilities. Appropriate when the business generates significant monthly revenue.

**The P&L Habit from Day One.** A Profit and Loss statement is simply income minus expenses equals profit. When your business income is in a separate account, this calculation takes 5 minutes per month. Income: total commissions received. Expenses: data costs, phone, tools, workshop fees, transport. Profit: what the business actually generated. This monthly P&L is your business intelligence — it shows you whether Z2B is growing, whether your costs are proportional, and what your actual monthly business income is independent of your salary.

[[MIRROR_MOMENT]]`,
    activity: "Open a dedicated account for your Z2B business income today — even if it is just a personal savings account you label 'Z2B Business'. Transfer your most recent commission into it. Set up a simple monthly P&L template: one column for income, one for expenses, one for profit. This is your business financial infrastructure. It starts with this one account, today.",
    questions: [
      { q: "Mixing personal and business finances is described as compounding because:", options: ["It generates compound interest losses", "The consequences — tax confusion, profitability blindness, lifestyle inflation, credibility loss — accumulate and interact over time", "It is punished with compound interest penalties by SARS", "Banking fees compound on mixed accounts"], answer: 1 },
      { q: "A dedicated business account should be opened:", options: ["When monthly business income exceeds R5,000", "On the day you decide to treat Z2B as a real business — regardless of income level, because the habit is more important than the amount", "After formal company registration", "When requested by SARS or a financial institution"], answer: 1 },
      { q: "The monthly P&L habit provides:", options: ["Investment recommendations based on business performance", "Business intelligence — whether the business is growing, whether costs are proportional, and what actual monthly profit is independent of employment income", "Automatic tax submission to SARS", "A requirement for Z2B commission payment"], answer: 1 },
      { q: "A business account in a company name (Pty Ltd) provides beyond a personal account:", options: ["Higher interest rates on savings", "Full credibility and legal separation — the company is distinct from the individual for banking, liability and tax purposes", "Access to international transfers", "Automatic bookkeeping services"], answer: 1 },
      { q: "The most important principle of business banking for beginning ECs is:", options: ["Maximising interest on business savings", "Consistent separation — every commission into the business account, every business expense from it, creating accurate financial visibility from day one", "Minimising banking fees through consolidation", "Maintaining a minimum monthly balance to avoid fees"], answer: 1 },
    ],
  },
  {
    id: 65, free: false,
    title: "Contracts and Agreements",
    subtitle: "Protecting Yourself in All Business Relationships",
    content: `Every business relationship you enter without a written agreement is a relationship governed by assumption. You assume they mean what you think they mean. They assume you will do what they think you agreed to do. When both parties' assumptions align, everything is fine. When they diverge — and they will, eventually — the absence of a written agreement means the dispute is resolved by whoever has the better memory, the louder voice, or the more expensive lawyer.

The Entrepreneurial Consumer does not wait until they have been burned by a handshake deal to understand the value of written agreements. They develop the habit of documenting expectations before they become obligations.

**What Every Business Agreement Should Include.** Parties: who is involved — full names, contact details, identity numbers or company registration. Scope: what specifically is being done, delivered or provided. Price and payment terms: exact amount, payment schedule, method of payment, what happens if payment is late. Duration: when does the agreement start, when does it end, how is it terminated? Dispute resolution: what happens if there is a disagreement — mediation, arbitration, jurisdiction? Signatures: both parties, dated.

**The Agreements Z2B Builders Need.** Coaching agreements: if you offer coaching services, a written agreement protects both you and your client. Partnership agreements: if you collaborate with another builder or entrepreneur on a joint venture, document the revenue split, responsibilities and exit terms before a rand is earned. Service agreements: if you provide digital product creation, website building or marketing services, protect yourself with a written scope of work and payment schedule. Referral agreements: if you refer business to others in exchange for a commission, document this explicitly.

**Simple Beats Sophisticated.** A one-page written agreement, signed by both parties, is legally enforceable in most jurisdictions. You do not need a lawyer for every agreement — though significant transactions warrant professional review. A clear, honest document that both parties read and sign demonstrates mutual understanding and creates a reference point if memory differs later.

[[MIRROR_MOMENT]]`,
    activity: "Write a simple one-page coaching or service agreement template that you could use for your Z2B coaching or any business service you provide. Include: parties, scope of service, price and payment terms, duration, and what happens if either party wants to end the agreement. This template, reviewed by a professional once, can be used for multiple agreements going forward.",
    questions: [
      { q: "Business relationships without written agreements are governed by:", options: ["Standard industry practice", "Assumption — and when assumptions diverge, disputes are resolved by whoever has better memory, louder voice, or more expensive legal representation", "Verbal contract law which provides full protection", "Z2B's standard terms and conditions"], answer: 1 },
      { q: "Every business agreement must include:", options: ["Only the price and payment terms", "Parties, scope, price and payment terms, duration, dispute resolution, and signatures — all creating shared reference for expected behaviour", "A lawyer's review and stamp of approval", "Company registration numbers from both parties"], answer: 1 },
      { q: "Z2B builders specifically need written agreements for:", options: ["All WhatsApp communications", "Coaching services, joint ventures, digital product work, and referral fee arrangements — wherever financial obligations and expectations exist", "Social media content creation only", "Team building activities only"], answer: 1 },
      { q: "A simple one-page agreement is:", options: ["Legally insufficient without professional preparation", "Legally enforceable in most jurisdictions — clarity and mutual signatures matter more than length or complexity", "Only appropriate for small transactions under R1,000", "Less binding than a verbal commitment"], answer: 1 },
      { q: "The habit of written agreements demonstrates:", options: ["Distrust of business partners", "Mutual understanding and professionalism — creating a shared reference point that protects both parties and demonstrates respect for the relationship", "Legal expertise and sophistication", "Inflexibility in business relationships"], answer: 1 },
    ],
  },
  {
    id: 66, free: false,
    title: "Intellectual Property Basics",
    subtitle: "Owning the Value You Create",
    content: `Intellectual property is the legal recognition that ideas, creative works, inventions and distinctive signs have economic value that belongs to their creator. For the Entrepreneurial Consumer, intellectual property is not an abstract legal concept — it is the category of asset that protects the most valuable things you build: your curriculum, your brand, your content, your frameworks, your coaching methodology.

Without intellectual property awareness, you can invest years building something valuable and find that it can be copied, replicated or used by others without compensation to you. With intellectual property awareness, you create legal frameworks that protect your competitive advantage and your economic right to benefit from what you have created.

**The Four Types of Intellectual Property Relevant to EC Builders.** Copyright: protects original creative works automatically from the moment of creation — your written content, your video recordings, your workshop curriculum, your social media posts. You do not need to register copyright. You need to document when your work was created. Trademark: protects your brand name, logo and distinctive identifiers. The Z2B brand, your personal brand name, your coaching practice name — these can be registered as trademarks to prevent others from trading on your reputation. Design: protects the aesthetic appearance of products. Trade Secrets: confidential business information that gives you competitive advantage — your proprietary coaching methodology, your funnel strategy, your specific scripts.

**Practical IP Protection for Z2B Builders.** Watermark your content with your name and website. Include copyright notices on all written materials. Keep records of creation dates — email yourself drafts, use dated cloud storage. For your most valuable frameworks and curricula, consult an IP attorney about trademark or formal copyright registration. When collaborating with others, include IP ownership clauses in your written agreements.

**The Z2B IP Example.** The Entrepreneurial Consumer philosophy, the 4 Table Legs framework, the #Reka_Obesa_Okatuka expression, Coach Manlaw — these are Z2B's intellectual property. They are protected by copyright and can be trademarked. This IP is part of why the Z2B platform is valued at R2.8M-R6.5M — not just the code and the content, but the distinctive frameworks that no competitor can legally replicate.

[[MIRROR_MOMENT]]`,
    activity: "Identify your intellectual property assets right now. List: every piece of content you have created, every framework or methodology you have developed, your brand name and any distinctive phrases you use. For each: is it documented with a creation date? Is it watermarked or marked with copyright notice? Identify one IP asset that deserves more formal protection and research the first step toward protecting it.",
    questions: [
      { q: "Copyright protects your work:", options: ["Only if formally registered with the government", "Automatically from the moment of creation — no registration required, though documentation of creation date is important for enforcement", "Only for works of significant commercial value", "For 5 years after creation by default"], answer: 1 },
      { q: "A trademark protects:", options: ["All intellectual property of a business automatically", "Your brand name, logo and distinctive identifiers — preventing others from trading on your reputation", "The content you publish on social media", "Physical products you manufacture"], answer: 1 },
      { q: "Practical IP protection for EC builders includes:", options: ["Paying expensive attorneys to protect all content", "Watermarking content, including copyright notices, keeping dated creation records, and adding IP ownership clauses to collaboration agreements", "Avoiding sharing content publicly until formally protected", "Only protecting content that generates significant income"], answer: 1 },
      { q: "Z2B's intellectual property value demonstrates:", options: ["That legal protection is only for large corporations", "That distinctive frameworks and philosophies — not just code — create defensible economic value that competitors cannot legally replicate", "That IP registration guarantees commercial success", "That Z2B's platform value is primarily software-based"], answer: 1 },
      { q: "The most important immediate IP protection action for a beginning EC is:", options: ["Registering all trademarks immediately", "Documenting creation dates of all content and materials — the foundation of any future copyright enforcement", "Hiring a full-time IP attorney", "Avoiding all public sharing until protection is established"], answer: 1 },
    ],
  },
  {
    id: 67, free: false,
    title: "Building a Board of Advisors",
    subtitle: "How to Access Wisdom You Don't Yet Have",
    content: `Every stage of building requires wisdom you do not yet possess. At the beginning, you do not know what you do not know — and this is the most dangerous position. The person who believes they have enough information to navigate the journey alone will learn expensively. The person who systematically seeks out those who have already made the mistakes they are about to make will learn efficiently.

A Board of Advisors is not a formal governance structure. It is a deliberately cultivated network of people whose wisdom you access intentionally — mentors, peers, specialists and challengers who each bring a dimension of insight your own experience cannot yet generate.

**The Four Advisor Archetypes You Need.** The Experience Advisor: someone who has built what you are building — a successful network marketer, a platform builder, a community leader. They have the pattern recognition that comes from years of practice. Their most valuable contribution is telling you which problems are temporary and which are structural. The Specialist Advisor: a tax professional, a lawyer, a financial planner, a technology expert. They possess specific technical knowledge in areas where ignorance is expensive. The Challenger Advisor: someone who will tell you what you do not want to hear — who will question your assumptions, challenge your strategy and point out your blind spots. The most uncomfortable advisor is often the most valuable. The Peer Advisor: someone on a similar journey, at a similar stage. Their knowledge is the freshest and most contextually relevant. Peer advisors learn alongside you.

**How to Build Your Board.** You do not ask someone to be your advisor — you earn that relationship through demonstrated seriousness. You show up. You do the work. You come to conversations prepared with specific questions, not vague requests for general guidance. You implement what you are advised and report back. This demonstrates respect for their time and creates a relationship dynamic where continued advice is given willingly.

[[MIRROR_MOMENT]]`,
    activity: "Name one person for each of the four advisor archetypes in your current life or network. They do not need to know they are on your 'board' yet. Write their name, what specific wisdom they possess that you need, and one specific question you could ask them this week that would advance your EC journey. Then reach out to at least one of them this week.",
    questions: [
      { q: "A Board of Advisors is described as:", options: ["A formal governance requirement for registered companies", "A deliberately cultivated network of people whose diverse wisdom you access intentionally to compensate for your own experience gaps", "Only appropriate for large organisations", "A group of investors who provide capital"], answer: 1 },
      { q: "The Challenger Advisor is described as the most valuable because:", options: ["They have the most business experience", "They tell you what you do not want to hear — questioning assumptions and pointing out blind spots that your own confidence prevents you from seeing", "They are the most available and accessible", "They have the strongest personal relationship with you"], answer: 1 },
      { q: "An advisor relationship is earned by:", options: ["Paying a consulting fee", "Showing up, doing the work, coming with specific questions, implementing advice and reporting back — demonstrating respect that creates willingness to continue advising", "Asking someone formally to be your mentor", "Having a shared personal history with the advisor"], answer: 1 },
      { q: "The Experience Advisor's most valuable contribution is:", options: ["Sharing their network of contacts", "Pattern recognition — telling you which problems are temporary and which are structural, based on having navigated the same journey", "Providing capital investment", "Technical skills in specific domains"], answer: 1 },
      { q: "Coming to advisor conversations with specific questions rather than vague requests:", options: ["Is considered inappropriate with senior advisors", "Demonstrates preparation and respect for the advisor's time — converting the interaction from mentorship request into a productive knowledge exchange", "Limits the breadth of advice available", "Is only necessary in formal advisory relationships"], answer: 1 },
    ],
  },
  {
    id: 68, free: false,
    title: "Mentorship — Finding and Keeping Mentors",
    subtitle: "The Fastest Path to Avoiding Expensive Mistakes",
    content: `A mentor is someone who has walked a road you are about to walk — and who is willing to share the map. The mentorship relationship is the most efficient learning mechanism available to a human being: direct, personalised knowledge transfer from someone who has already paid the price of the lessons they are sharing. Every mistake your mentor made that they are willing to share with you is a mistake you can avoid paying for with your own resources, your own time and your own emotional cost.

The challenge is that genuine mentors are rare, in high demand, and uninterested in those who approach them without genuine seriousness. Most requests for mentorship are actually requests for shortcuts: "tell me what to do so I can do it without going through the discomfort of figuring it out myself." A genuine mentor can detect this immediately. They invest their wisdom in people who demonstrate they are willing to do the work.

**How to Find a Mentor Worth Having.** Find them through the work, not through cold outreach. The builder who is doing excellent work will naturally come to the attention of those further along the path. Engage publicly with the content and thinking of people you respect — adding genuine value to conversations, not just liking posts. When the time comes to make a direct connection, you arrive not as a stranger but as someone they have already noticed. Then ask for something small and specific: "I have been applying your principle about [specific topic] and ran into this specific challenge. Would you be willing to share how you navigated this?" That question is the beginning of a mentorship relationship worth having.

**How to Keep a Mentor.** Implement what they say. Report back with specific results. Celebrate their contribution when their advice produces outcomes. Send them content that is relevant to their interests — not to impress, but because the relationship should be mutually enriching. Protect their time. Never waste the attention they give you.

[[MIRROR_MOMENT]]`,
    activity: "Identify one person in your field — in Z2B, in business, in faith-based leadership — whose journey you admire and whose wisdom would specifically advance yours. Research their public content, their history, their principles. Identify one specific challenge you are currently facing that their experience would illuminate. Then make one specific, humble and genuinely valuable first contact this week.",
    questions: [
      { q: "The mentorship relationship is the most efficient learning mechanism because:", options: ["Mentors provide free consulting services", "It transfers direct personalised knowledge from someone who has already paid the price of the lessons they share — avoiding you paying the same price", "Mentors guarantee success for their mentees", "Mentorship is faster than all formal education"], answer: 1 },
      { q: "Genuine mentors are difficult to access because:", options: ["They charge high fees for their time", "They are rare, in demand, and skilled at distinguishing people seeking shortcuts from those willing to do genuine work", "They only mentor people from their personal networks", "They prefer formal mentorship programmes over informal relationships"], answer: 1 },
      { q: "The most effective way to find a valuable mentor is:", options: ["Sending a detailed email explaining why you need mentorship", "Finding them through the work — being noticed through genuine valuable engagement with their ideas before making direct contact", "Attending networking events and introducing yourself", "Paying for access through masterminds or programmes"], answer: 1 },
      { q: "Keeping a mentor requires:", options: ["Regular scheduled calls and formal reports", "Implementation, specific results reporting, celebrating their contribution, protecting their time, and adding value to the relationship — not just receiving", "Exclusive loyalty that prevents seeking other advisors", "Achieving specific milestones they have set for you"], answer: 1 },
      { q: "Rev Mokoro Manana as a Z2B mentor provides:", options: ["Guaranteed income for all who follow his advice", "Pattern recognition from building the platform and philosophy — the direct experience of navigating every stage of the Z2B journey", "Daily personal coaching to all Z2B members", "A formal mentorship certification programme"], answer: 1 },
    ],
  },
  {
    id: 69, free: false,
    title: "Faith and Business — The Kingdom Economic Mandate",
    subtitle: "Why Serving People Is the Foundation of Sustainable Wealth",
    content: `The Kingdom Economic Mandate is the foundational principle that governs everything Z2B is built on: wealth is the natural consequence of solving problems for people at scale, serving communities with excellence, and operating with integrity across every transaction. Not wealth as an end in itself — but wealth as the fruit of faithfulness, generosity and stewardship in the economic domain.

Jesus said in Matthew 25:14-30 — the Parable of the Talents — that the master gave talents to three servants according to their abilities. Two multiplied what they were given. One buried it. The master's response was unambiguous: those who multiplied were given more; the one who buried his talent had even that taken away. The message is not subtle: stewardship of economic resources — multiplication, not hoarding — is a Kingdom obligation.

**The Three Principles of Kingdom Economics in Business.** Principle 1: Service Before Sale. The Kingdom Economic mandate is to serve first and to serve excellently — trusting that the financial return is the natural consequence of genuine value delivered. The Z2B workshop is free for 9 sessions not as a marketing tactic but as a service principle: give value before asking for commitment. Principle 2: Abundance Over Scarcity. The Kingdom operates on multiplication logic, not zero-sum competition. Your competitor's success does not diminish your opportunity. Your team member's growth amplifies your income. The abundance mindset is not positive thinking — it is economic theology. Principle 3: Stewardship Over Ownership. Everything you build is held in trust. Your skills, your income, your team, your platform — entrusted to you for stewardship, not for hoarding. The question is not "how much can I accumulate?" but "how much can I multiply and distribute?"

**Your Business as Ministry.** The Entrepreneurial Consumer who builds Z2B with Kingdom principles is not just building an income stream. They are serving employed people who feel trapped. They are offering a third path to people who believe only two exist. They are building financial dignity for families. They are creating legacy. This is ministry. And ministry, conducted with excellence and integrity, has always attracted the resources it needs to continue.

[[MIRROR_MOMENT]]`,
    activity: "Write a Kingdom purpose statement for your Z2B business. Complete: 'I am building this because God has called me to serve [specific audience] by providing [specific transformation] so that [ultimate legacy impact]. My business is not just income — it is ministry.' Read it aloud. Post it where you will see it daily. This statement is your north star when results are slow and doubt is loud.",
    questions: [
      { q: "The Kingdom Economic Mandate teaches that wealth:", options: ["Is a sign of God's favour on individuals regardless of how it is earned", "Is the natural consequence of serving people at scale with integrity and excellence — wealth as fruit of faithfulness, not wealth as an end", "Should be avoided by people of faith", "Is only appropriate for those called to full-time ministry"], answer: 1 },
      { q: "The Parable of the Talents teaches:", options: ["That wealth is distributed unequally by divine design", "That stewardship — multiplication of what you have been given — is a Kingdom obligation, while hoarding is condemned regardless of motive", "That business talent is a spiritual gift given to few", "That financial risk should always be avoided"], answer: 1 },
      { q: "Service before sale in Z2B is demonstrated by:", options: ["The Z2B marketing strategy", "Nine free workshop sessions — giving genuine transformational value before any financial commitment is requested", "The free Z2B mobile app", "Free coaching available to all members"], answer: 1 },
      { q: "The abundance mindset in Kingdom Economics is described as:", options: ["Positive thinking that ignores business reality", "Economic theology — the multiplication logic of the Kingdom means competitors' success does not diminish yours and team growth amplifies your income", "A belief that resources are always sufficient regardless of effort", "A marketing approach for attracting more customers"], answer: 1 },
      { q: "Your Z2B business as ministry means:", options: ["Converting all customers to a particular faith tradition", "Serving trapped employees with a third path, building financial dignity for families, creating legacy — conducted with the excellence and integrity that ministry requires", "Tithing a percentage of all Z2B income to a church", "Only building with people who share your faith background"], answer: 1 },
    ],
  },
  {
    id: 70, free: false,
    title: "Stewardship Principles",
    subtitle: "Why How You Handle Small Things Determines Your Access to Large Things",
    content: `Luke 16:10 — "Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much." This is not a spiritual platitude. It is a principle of human nature and economic reality, documented across thousands of years of observed behaviour. The way you handle small things — small amounts of money, small responsibilities, small opportunities — is the most accurate predictor of how you will handle large ones.

This principle operates in every domain of the EC journey. The builder who handles their R480 Bronze investment with care — completing every workshop session, running the ratio consistently, coaching their team faithfully — is demonstrating the character that will be trusted with Silver, Gold and Platinum. The builder who takes R480 and does nothing with it is demonstrating something about their relationship with opportunity that no amount of inspiration will change.

**The Five Stewardship Tests in Z2B.** Time stewardship: do you use the time you have committed to building Z2B for that purpose? Or does it leak into consumption and distraction? Financial stewardship: do you direct your Z2B earnings toward the next investment — the Silver upgrade, the emergency fund, the financial buffer — or does the money evaporate into lifestyle before it can compound? Knowledge stewardship: do you apply what you learn in each session, or do you accumulate knowledge without action? Relationship stewardship: do you handle the people in your team — the prospects, the builders, the community — with the same quality of attention you would give if you knew they were being observed? Vision stewardship: do you maintain the long-term vision when short-term results are disappointing?

**The Upgrade Principle.** Access to larger things — higher tier commissions, larger teams, greater platform opportunities — is not given on the basis of ambition. It is given on the basis of demonstrated stewardship of what was previously given. The builder who has been faithful with Bronze is trusted with Silver. The builder who has built well at Silver is given access to the depth of Platinum. The upgrade is not a reward for desire — it is a recognition of proven stewardship.

[[MIRROR_MOMENT]]`,
    activity: "Conduct an honest stewardship audit across the five Z2B stewardship tests. Rate yourself 1-5 in each: time, financial, knowledge, relationship and vision stewardship. Where are you scoring 3 or below? Write one specific practice you will implement this week to raise each low-scoring area by one point. Stewardship is not a feeling — it is a set of specific, observable practices.",
    questions: [
      { q: "The stewardship principle teaches that small things are important because:", options: ["Small amounts of money compound into large amounts", "How you handle small things is the most accurate predictor of how you will handle large ones — character is consistent across scale", "Small responsibilities build confidence for large ones", "Z2B starts with small teams that grow large"], answer: 1 },
      { q: "Time stewardship in Z2B means:", options: ["Working as many hours as possible on building activities", "Using the time committed to building Z2B for that purpose — not allowing it to leak into consumption and distraction", "Completing the workshop as quickly as possible", "Investing only the minimum time required to maintain income"], answer: 1 },
      { q: "The upgrade principle in Z2B is based on:", options: ["Financial capacity to pay higher tier costs", "Demonstrated stewardship of the current tier — faithfulness with Bronze creates the track record that access to Silver is built on", "Time spent as a member", "Team size reached at each level"], answer: 1 },
      { q: "Knowledge stewardship means:", options: ["Accumulating as much workshop content as possible", "Applying what you learn in each session — knowledge without action is not stewardship, it is consumption", "Sharing knowledge with others immediately", "Completing sessions as quickly as possible"], answer: 1 },
      { q: "The Luke 16:10 principle operates in business because:", options: ["It is a divine guarantee of financial success for people of faith", "Character consistency across scale is observable and documented — those trusted with small things demonstrate the integrity that earns access to larger responsibilities", "God directly intervenes in the finances of faithful stewards", "Business partners always test small transactions before large ones"], answer: 1 },
    ],
  },
  {
    id: 71, free: false,
    title: "The Tithe Principle in Business",
    subtitle: "How Generosity Creates Flow in Your Economic Ecosystem",
    content: `The tithe is one of the oldest economic principles in recorded human history. Across cultures, faiths and economic systems, the practice of giving a first portion of income — before needs are met, not from surplus — has been associated with the psychological and spiritual discipline that enables the larger wealth-building practices to take root. Whether you hold a theological interpretation of the tithe or not, the practice teaches something profound about the relationship between generosity, flow and abundance.

In Malachi 3:10, God says "Bring the whole tithe into the storehouse... and test me in this... if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it." This is the only place in the Bible where God invites a test. The test is generosity. The promised result is overflow.

**The Business Application of Tithe Thinking.** In business, the tithe principle translates to a first-fruits mindset: directing a portion of your income — before it is allocated to expenses, savings or lifestyle — to something beyond yourself. This might be a literal tithe to your church or faith community. It might be a portion directed to a community cause. It might be a percentage invested in someone else's education or development. The specific recipient matters less than the practice: giving first, from income, before the money has been claimed by anything else.

**Why Generosity Creates Economic Flow.** The person who gives generously develops a specific relationship with money: they are not afraid of money leaving. They do not hold it tightly. They do not make decisions from scarcity. And the person who does not make decisions from scarcity makes better investment decisions, takes better-calculated risks, and attracts better partnerships — because their energy in every transaction is abundant rather than desperate. Generosity is both a spiritual practice and a psychological medicine.

**The Z2B Team Tithe.** Consider directing a portion of your Z2B income to develop a team member who cannot yet afford to upgrade. A sponsored upgrade. A coaching investment. A resource gift. This is team tithe — and it builds the kind of loyalty and gratitude that returns through the TSC your team generates for years.

[[MIRROR_MOMENT]]`,
    activity: "Decide on your personal giving practice — your first fruits allocation. What percentage will you give first, before any other allocation? To whom? Starting with which payment? Write the specific commitment. Then decide on one Z2B team tithe action: one person in your team you will invest in beyond what is required. Name them, name the investment, and set the date.",
    questions: [
      { q: "The tithe principle teaches about generosity:", options: ["That 10% is the specific required percentage for all believers", "That giving first — before needs are met, not from surplus — develops the psychology that enables larger wealth-building practices", "That generosity is only possible after financial security is established", "That tithing to church guarantees business success"], answer: 1 },
      { q: "In Malachi 3:10, God invites a test of:", options: ["Prayer and fasting", "Generosity — the only place in Scripture where God explicitly invites being tested, with overflow as the promised result", "Faithful work and diligence", "Community service and volunteering"], answer: 1 },
      { q: "The business application of tithe thinking is a first-fruits mindset that:", options: ["Requires giving 10% of all income to religious organisations", "Directs a portion of income before it is claimed by expenses — developing an abundant rather than scarce relationship with money", "Only applies to believers in the tithe doctrine", "Is primarily a tax reduction strategy"], answer: 1 },
      { q: "Generosity creates economic flow because:", options: ["It satisfies religious requirements that unlock blessings", "The non-fearful relationship with money that generosity develops produces better investment decisions, calculated risk-taking, and better partnerships", "Generous people are more popular and therefore more successful", "Giving reduces financial pressure by lowering taxable income"], answer: 1 },
      { q: "The Z2B team tithe concept involves:", options: ["Directing a percentage of all income to Z2B corporate", "Investing in a team member beyond what is required — a sponsored upgrade, coaching gift, or resource investment that builds loyalty compounding through TSC", "Equally distributing income among all team members", "Paying Z2B membership fees for new recruits"], answer: 1 },
    ],
  },
  {
    id: 72, free: false,
    title: "Prayer and Business Strategy",
    subtitle: "Integrating Spiritual Disciplines Into Practical Planning",
    content: `The integration of prayer and business strategy is not a concession to religious sentiment over rational planning. It is a recognition that the Entrepreneurial Consumer who approaches their building journey with spiritual discipline accesses a dimension of clarity, resilience and direction that purely analytical planning cannot provide. Prayer is not a substitute for strategy. It is the practice that informs and refines strategy — that brings the builder into alignment with something larger than their own analysis.

Rev Mokoro Manana did not build Z2B from a business school curriculum. He built it from a Kingdom assignment — a conviction that ordinary employed people deserve access to the third path, and that the combination of Z2B's philosophy, technology and community could deliver it. That conviction sustained the building through seasons when the metrics did not yet reflect the vision. Prayer was the practice that maintained the vision when circumstances challenged it.

**How Prayer Functions in Business Practice.** Clarity: regular prayer creates quiet space away from the noise of metrics, social media and market pressure — in which clear strategic direction can be heard. Builders who pray before major decisions report a consistent experience: the decision that seemed unclear becomes obvious in the stillness. Correction: prayer is a humbling practice. It reminds the builder that their plans are subject to revision, that their limitations are real, and that wisdom is received rather than manufactured. This humility prevents the overconfidence that causes strategic errors. Resilience: the builder who prays during a slow month experiences that slow month differently from the one who does not. The slow month is contextualised within a larger narrative. The disappointment is held by faith rather than amplified by anxiety.

**Practical Integration.** Pray before major decisions — new tier investments, partnership choices, significant content creation. Pray for specific people in your pipeline — not as a marketing practice but as a genuine act of care for their situation. Pray with your team. Acknowledge God's role in what has been built. And build accordingly — with integrity, generosity and faithfulness that reflects the source you are acknowledging.

[[MIRROR_MOMENT]]`,
    activity: "Create a simple prayer practice for your Z2B building journey. It can be 5 minutes. It can be a single daily commitment. Write the specific time you will pray, what you will pray about (your vision, your team, specific decisions, people in your pipeline), and one declaration of faith about your Z2B journey that you will speak aloud daily. The practice is the discipline. The discipline compounds.",
    questions: [
      { q: "Prayer in business is described as:", options: ["A substitute for rational planning and strategic analysis", "A practice that informs and refines strategy — bringing clarity, humility and resilience that purely analytical planning cannot provide", "Only relevant for full-time ministers and pastors", "A marketing differentiation strategy for faith-based businesses"], answer: 1 },
      { q: "The Z2B origin story demonstrates the role of prayer by:", options: ["Showing that prayer guarantees business success", "Rev Mokoro's Kingdom assignment conviction sustaining the build through seasons where metrics did not yet reflect vision — prayer maintained direction when circumstances challenged it", "Proving that all successful businesses are built on prayer", "Demonstrating that spiritual discipline replaces business skill"], answer: 1 },
      { q: "Prayer develops resilience in business because:", options: ["It guarantees protection from business challenges", "It contextualises slow periods within a larger narrative — disappointment is held by faith rather than amplified by anxiety", "God removes obstacles from the paths of praying builders", "Prayer creates emotional detachment from business outcomes"], answer: 1 },
      { q: "The humility that prayer develops prevents:", options: ["Timid decision-making and excessive caution", "Overconfidence — the strategic errors that come from believing your plans are beyond revision and your analysis is infallible", "Generous behaviour that reduces profitability", "Slow growth due to excessive spiritual focus"], answer: 1 },
      { q: "Praying for specific people in your pipeline is described as:", options: ["A marketing technique to increase conversion rates", "A genuine act of care for their specific situation — transforming the relationship from commercial to covenantal", "Only appropriate for people who are already believers", "A privacy violation that should be avoided"], answer: 1 },
    ],
  },
  {
    id: 73, free: false,
    title: "Character Development for Leaders",
    subtitle: "Why Who You Are Determines How Far You Go",
    content: `Skill will take you to a level. Character will determine whether you stay there. In every domain of human achievement — business, ministry, leadership, athletics — the pattern is consistent: talented people with weak character reach a ceiling sooner than those whose character matches their ability. The ceiling is not skill-imposed. It is character-imposed. And the ceiling drops dramatically when character failures compound.

Character is not personality. Personality is how you naturally present. Character is who you are when nobody is watching, when the stakes are high, when the pressure is significant and when the shortcuts are available. Character is the consistency between what you say and what you do, between how you treat people who can help you and how you treat people who cannot, between your public commitments and your private actions.

**The Five Character Qualities That Determine Leadership Ceiling.** Integrity: the exact alignment of your words and your actions. When you say you will do something, you do it. Your word is your bond — not your intention. Consistency: showing up with the same quality of effort and attention regardless of who is watching. Your G1 builder who you know is not performing gets the same coaching attention as the one who is your top recruiter. Humility: the willingness to be wrong, to receive correction, to acknowledge what you do not know. The humble leader learns from every source. The proud leader is limited to what they already know. Courage: the willingness to make the right decision when it is uncomfortable — to have the hard conversation, to correct lovingly, to say no when yes is easier. Generosity: the consistent orientation toward giving — time, attention, knowledge, resources — before calculating the return.

**Character Builds in the Small Moments.** You do not become a person of integrity by making a dramatic public commitment to honesty. You become it by telling the truth in the small moments — the easy lie, the minor exaggeration, the convenient omission. Character is the accumulated deposit of thousands of small choices, compounding invisibly until it becomes the person you are.

[[MIRROR_MOMENT]]`,
    activity: "Identify the one character quality from the five listed that is your greatest current limitation. Be honest. Write a specific, recent situation where this quality was tested and you came up short. Then write what the version of you with full integrity, consistency, humility, courage or generosity would have done instead. That gap is your character development work.",
    questions: [
      { q: "The leadership ceiling imposed by character is:", options: ["Determined by formal qualifications and experience", "The point where character weaknesses prevent further growth — regardless of skill level, character determines whether you stay at the level skill brought you to", "Set by market conditions and business environment", "Different for every leadership context and culture"], answer: 1 },
      { q: "Character differs from personality because:", options: ["Character is fixed; personality can change", "Personality is natural presentation; character is who you are under pressure with no audience — the consistency between public commitment and private action", "Personality is more important for leadership than character", "Character is only relevant in religious contexts"], answer: 1 },
      { q: "Integrity as a character quality means:", options: ["Believing in your own values and principles", "The exact alignment of words and actions — when you say you will do something, you do it, without exception or rationalisation", "Being honest when confronted directly", "Having strong moral beliefs"], answer: 1 },
      { q: "Character is built through:", options: ["One dramatic public commitment to improvement", "The accumulated deposit of thousands of small choices — the easy lie resisted, the minor exaggeration avoided, the private consistency maintained", "Regular attendance at leadership training programmes", "Public declaration of values and principles"], answer: 1 },
      { q: "The consistent treatment of underperforming team members demonstrates:", options: ["Patience that may be misinterpreted as weakness", "Character — the quality of coaching attention you give when there is no immediate reward reveals whether your leadership is character-based or performance-based", "Poor management of team resources", "Excessive time investment in low-return relationships"], answer: 1 },
    ],
  },
  {
    id: 74, free: false,
    title: "Resilience Training for Builders",
    subtitle: "How to Handle Setbacks Without Losing Momentum",
    content: `Setbacks are not failures. They are fees. Every building journey — without exception — includes months where the ratio does not convert at 15%, where team members go inactive, where a carefully planned launch produces silence, where a testimonial you expected to close a prospect falls flat. The builder who does not have a resilience practice will treat each of these fees as disqualifying evidence that they are not cut out for this. The builder with resilience will treat them as tuition — expensive, uncomfortable and ultimately educational.

The psychological research on resilience consistently finds one distinguishing factor between people who recover from setbacks and those who do not: the narrative they construct about the setback. The setback itself is neutral. The interpretation — temporary or permanent, specific or pervasive, external or self-defining — determines the recovery.

**The Z2B Resilience Framework.** When results are disappointing, ask four questions in sequence. Question 1: Is this a data point or a pattern? One slow week is data. Six slow weeks is a pattern. They require different responses. Do not make permanent decisions based on temporary data. Question 2: What is specifically causing this? Name the cause precisely. Vague attribution — "nothing is working" — produces vague solutions. Specific attribution — "my WhatsApp follow-up dropped from Day 9 to Day 3 last month" — produces specific corrections. Question 3: What is within my control? Resilience focuses energy on controllable variables. The algorithm change is not controllable. Your posting frequency is. Question 4: What is the next single action? Not a strategy overhaul. Not a motivation retreat. One specific action, taken today, that represents moving forward rather than staying still.

**The Morning Sessions as Resilience Infrastructure.** This is why morning sessions exist. On the days when results are disappointing and motivation is absent, the morning session is the one non-negotiable act of identity maintenance. It says: I am still an Entrepreneurial Consumer, regardless of yesterday's pipeline performance. That identity statement, made daily through the discipline of showing up for the session, is the foundation of resilience.

[[MIRROR_MOMENT]]`,
    activity: "Identify your most recent Z2B setback. Apply the four resilience questions to it specifically. Write your answers: Is it a data point or a pattern? What specifically caused it? What within that cause is within your control? What is the one next action? Execute that one action today. Resilience is built in the act of moving after stillness — not in the planning of movement.",
    questions: [
      { q: "Setbacks are described as fees rather than failures because:", options: ["Fees are smaller than failures", "They are the cost of building — every journey includes them, and their educational value exceeds their immediate cost when processed correctly", "Failures carry moral weight that fees do not", "Z2B guarantees freedom from failure at higher tiers"], answer: 1 },
      { q: "The distinguishing resilience factor in psychological research is:", options: ["Natural emotional stability and optimism", "The narrative constructed about the setback — whether it is interpreted as temporary or permanent, specific or pervasive, external or self-defining", "Previous success experience that provides confidence reserves", "Support network quality and availability"], answer: 1 },
      { q: "The difference between a data point and a pattern requires:", options: ["At least 6 months of evidence", "Careful assessment — one slow week is data requiring observation, six slow weeks is a pattern requiring strategic response, and they require different actions", "A team review and vote on the classification", "External confirmation from a senior Z2B builder"], answer: 1 },
      { q: "Resilience focuses on controllable variables because:", options: ["Only controllable variables produce results", "Energy directed at uncontrollable factors (algorithm changes, prospect decisions) produces only anxiety while energy directed at controllable factors (posting frequency, follow-up quality) produces change", "Uncontrollable factors are always the true cause of setbacks", "Z2B's success depends entirely on builder-controlled variables"], answer: 1 },
      { q: "Morning sessions are described as resilience infrastructure because:", options: ["They produce immediate income when results are slow", "They provide a daily non-negotiable identity maintenance act — 'I am still an EC regardless of yesterday's results' — that sustains forward movement through motivationally empty seasons", "They contain specific content about handling setbacks", "They are the most important income-generating activity"], answer: 1 },
    ],
  },
  {
    id: 75, free: false,
    title: "Managing Failure",
    subtitle: "Why Every Successful Builder Has a Catalogue of Failures",
    content: `Show me a successful builder and I will show you someone with a catalogue of failures they never let define them. The catalogue is not the exception — it is the prerequisite. The person who has failed at network marketing before knows exactly which mistakes not to make this time. The person who has launched content that got no engagement knows which topics and formats their audience does not respond to. The person who has lost a partnership to a handshake deal knows the value of written agreements. Every failure is a closed question — and closed questions are the raw material of wisdom.

The challenge is not the failure itself. The challenge is the story we tell about the failure. Most people narrate failure as evidence — "this confirms that I am not good at this" — rather than as information — "this teaches me something specific that I can apply." The evidence narration is catastrophic. The information narration is developmental.

**The Three Failure Response Modes.** Mode 1: Shame and Retreat. The builder concludes that the failure reflects something permanently true about their capability. They withdraw from the field. This is the most common and the most expensive response. Mode 2: Blame and Rationalise. The builder attributes the failure entirely to external factors — the timing, the economy, the people, the platform. This response protects the ego but prevents learning. Mode 3: Learn and Iterate. The builder extracts the specific lesson, applies it to the next attempt, and treats the failure as a R&D investment that has now produced usable data. This is the only mode that produces eventual success.

**The Failure Inventory.** Every six months, successful builders conduct a failure inventory: what attempts did I make that did not produce the intended results? What specifically did I learn from each? How has my approach changed as a result? This inventory is not self-flagellation — it is curriculum review. The failures are the curriculum of your EC education. Without them, the learning is theoretical. With them, the learning is earned.

[[MIRROR_MOMENT]]`,
    activity: "Conduct your personal failure inventory for the last 6 months of your Z2B journey. List every attempt that did not produce the intended result — every post that did not convert, every prospect who did not upgrade, every team member who went inactive. For each, write one specific learning. Then write one way your approach has changed because of what these failures taught you. This is your most valuable business education.",
    questions: [
      { q: "Every successful builder's catalogue of failures is described as:", options: ["An embarrassing history to be kept private", "A prerequisite to success — not the exception but the evidence of the attempts required to develop the wisdom that produces results", "A series of mistakes that should have been avoided", "Only significant in competitive business environments"], answer: 1 },
      { q: "The evidence narration of failure ('this confirms I am not capable') is catastrophic because:", options: ["It generates public sympathy", "It prevents the learning that the failure contains — permanently closing the question that the failure was trying to answer", "It is publicly visible on social media", "It reduces team motivation and recruitment"], answer: 1 },
      { q: "The three failure response modes in order from worst to best are:", options: ["Blame and rationalise, shame and retreat, learn and iterate", "Shame and retreat, blame and rationalise, learn and iterate", "Learn and iterate, shame and retreat, blame and rationalise", "Learn and iterate, blame and rationalise, shame and retreat"], answer: 1 },
      { q: "The failure inventory is conducted every six months because:", options: ["Z2B requires quarterly performance reviews", "Regular extraction of specific lessons from failed attempts converts failures from emotional experiences into curriculum — preventing the same lessons from being paid for twice", "Six months is the standard business review period", "Failures must be reported to team leaders at six-month intervals"], answer: 1 },
      { q: "Treating failures as R&D investments means:", options: ["Writing them off as tax deductions", "Recognising that failed attempts generate data that has value for future attempts — the cost is tuition, not loss", "Celebrating failure publicly to demonstrate resilience", "Reducing the size of future attempts to minimise R&D costs"], answer: 1 },
    ],
  },
  {
    id: 76, free: false,
    title: "The Power of Community Accountability",
    subtitle: "Why You Need People Who Will Tell You the Truth",
    content: `The most comfortable environment is the one where nobody challenges you. Where your decisions are affirmed, your strategies go unchallenged and your blind spots remain comfortably unseen. This environment is also the most dangerous for your long-term development. The builder who surrounds themselves only with affirmers will eventually make an avoidable mistake — because nobody loved them enough to tell them the truth before the mistake became expensive.

Accountability is not criticism. It is the gift of being held to your own stated commitments by someone who cares enough about your destination to risk the discomfort of the conversation. The friend who says "you told me you were going to post four times a day — I notice you have posted twice this week" is serving your vision, not attacking your character.

**The Four Accountability Structures Available to Z2B Builders.** Structure 1: The Accountability Partner — a single peer builder at a similar stage. Weekly check-in, specific commitments exchanged, specific results reviewed. Simple. Effective. Structure 2: The Team Accountability Call — a regular group call where builders share their numbers, their wins and their specific challenges. Peer visibility creates productive pressure. Structure 3: The Upline Relationship — your sponsor holds a unique accountability position. They have a financial stake in your success (TSC), a relational investment in your journey, and usually more experience to draw on. Structure 4: The Personal Standard — ultimately, the highest accountability is the standard you set for yourself and the honesty with which you measure yourself against it.

**Accountability Without Condemnation.** Effective accountability is not about shame. It is about standards. The accountability partner who makes you feel bad about missing your target has failed at accountability. The partner who helps you understand why the target was missed and what specifically will be different next week has succeeded. Accountability is always forward-facing — not dwelling on the miss, but planning the correction.

[[MIRROR_MOMENT]]`,
    activity: "Identify your current accountability structure. Do you have an accountability partner? Do you participate in team calls? Is your upline relationship active? Rate each structure's effectiveness from 1-5. If you rated any below 3, write one specific action to strengthen it. Then reach out to one person today and propose a simple weekly accountability agreement: two specific commitments each, reviewed every Monday.",
    questions: [
      { q: "The most comfortable environment is described as the most dangerous because:", options: ["Comfort leads to overconfidence", "No challenge means no accountability, no truth-telling, and no early warning for mistakes that eventually become expensive without correction", "Comfortable environments attract poor quality partners", "Comfort is associated with low income in network marketing"], answer: 1 },
      { q: "Accountability differs from criticism because:", options: ["Accountability is only positive while criticism is only negative", "Accountability holds you to your own stated commitments from a position of care for your destination — criticism comments on character without forward-facing purpose", "Criticism comes from superiors while accountability comes from peers", "Accountability requires a formal agreement while criticism is spontaneous"], answer: 1 },
      { q: "The upline relationship as accountability has a unique feature:", options: ["Your upline can impose consequences for non-performance", "Your sponsor has a financial stake in your success (TSC), a relational investment and usually more experience — creating aligned motivation to tell you the truth", "Upline relationships are the most powerful of the four structures", "Upline accountability is required by Z2B policy"], answer: 1 },
      { q: "Effective accountability is always:", options: ["Focused on identifying who is responsible for failures", "Forward-facing — understanding why the target was missed and what specifically will be different next week, not dwelling on the miss", "Conducted in private to protect the builder's dignity", "Only appropriate when results are consistently poor"], answer: 1 },
      { q: "The personal standard as the highest accountability form means:", options: ["External accountability is unnecessary for disciplined builders", "Ultimately, the consistency between your stated commitments and your private actions — the measure you apply to yourself honestly — determines your growth ceiling", "Only senior builders have developed sufficient self-accountability", "Personal standards are sufficient without any external accountability structures"], answer: 1 },
    ],
  },
  {
    id: 77, free: false,
    title: "Reading and Learning as Economic Habits",
    subtitle: "How Continuous Learning Creates Compound Knowledge",
    content: `The person who stops learning has stopped growing. And the person who stops growing has already begun declining — because the world around them is not standing still. The markets shift, the platforms evolve, the strategies that worked last year require updating, and the knowledge that was current three years ago has been partially superseded. In the information economy, the half-life of specific knowledge is shrinking. What has not shrunk is the value of the learning habit itself.

The Entrepreneurial Consumer treats reading and learning not as a leisure activity or an academic obligation — but as an economic activity. Every book on human psychology makes you a better communicator. Every article on digital marketing makes your content more effective. Every study of successful business models generates ideas applicable to your own. Learning compounds: each new insight connects to previous knowledge, creating frameworks that are more powerful than any individual piece of information.

**The Z2B Learning Ecosystem.** The workshop you are completing right now is the foundation. But the learning ecosystem extends beyond Z2B: books that shaped the EC philosophy (every session has embedded principles from the greatest economic and psychological thinkers of the last century), podcasts by builders at the stages you are moving toward, communities of Entrepreneurial Consumers exchanging real-time experience. The learner who reads one book per month for 12 months — 12 carefully chosen books on business, psychology, economics and leadership — will have a knowledge base that most employed professionals never develop.

**The Implementation Requirement.** Knowledge without implementation is accumulation. Accumulation is comfort, not compound interest. For every book, course or session completed, identify one principle and one specific action to take within 48 hours. This practice converts information into experience and experience into wisdom. Wisdom — accumulated over years of reading, implementing and reflecting — is the most durable economic asset you can build.

[[MIRROR_MOMENT]]`,
    activity: "Commit to a 12-month reading plan. Identify 12 books — one per month — that directly advance your EC journey. Your categories should include: mindset (2 books), business (3 books), marketing and sales (2 books), leadership (2 books), personal finance (2 books), and faith in business (1 book). Write your list. Order or borrow the first book this week. The reading plan is your private university — and tuition is the cost of the books.",
    questions: [
      { q: "Treating reading and learning as an economic activity means:", options: ["Spending large amounts on expensive courses and programmes", "Recognising that each new insight generates ideas and frameworks that compound into competitive advantage — learning has a measurable economic return", "Reading only books directly relevant to income generation", "Tracking return on investment for every book purchased"], answer: 1 },
      { q: "The Z2B workshop is described as the foundation of the learning ecosystem because:", options: ["It contains all knowledge required for business success", "It provides the core EC philosophy and principles — but the learning ecosystem extends beyond it through books, podcasts and communities at the stages ahead", "All Z2B learning requirements are contained within the 99 sessions", "The workshop is more comprehensive than any book on the subject"], answer: 1 },
      { q: "The implementation requirement converts knowledge into:", options: ["More knowledge through deeper understanding", "Experience — and accumulated experience, reflected on consistently, becomes wisdom: the most durable economic asset", "Income through direct application", "Credibility with team members and prospects"], answer: 1 },
      { q: "Reading one carefully chosen book per month for 12 months develops:", options: ["A library of impressive titles for social media content", "A knowledge base most employed professionals never develop — compound knowledge that generates frameworks more powerful than any individual piece of information", "A certification that improves career prospects", "Content for 12 months of social media posting"], answer: 1 },
      { q: "Knowledge without implementation is described as:", options: ["Preparation for future opportunities", "Accumulation — comfortable but not compounding, because it never converts into experience and wisdom through application", "The appropriate approach before skills are sufficiently developed", "An acceptable approach during the research phase of building"], answer: 1 },
    ],
  },
  {
    id: 78, free: false,
    title: "Public Speaking for Builders",
    subtitle: "How to Communicate Your Vision to Groups",
    content: `The ability to stand before a group of people — physically or digitally — and communicate a vision with clarity and conviction is one of the highest-value skills available to an Entrepreneurial Consumer. It multiplies your reach beyond the 1:1 conversations that built your foundation. It establishes your authority with entire audiences in a single session. It creates social proof at scale — a room full of people nodding creates a different kind of trust than a testimonial on a screen.

Most people fear public speaking more than death. The fear is not rational — but it is real. And the way to dissolve it is not through preparation of the speech but through repetition of the experience. The builder who speaks publicly once per month will be transformed in their communication confidence within a year. The builder who speaks ten times in a month will be transformed in weeks.

**The Structure of an Effective Z2B Presentation.** Opening: begin with a question your audience is already asking internally. "How many of you feel like you are working your hardest and still not getting ahead financially?" This anchors the presentation in their reality, not your agenda. Problem: name the problem precisely. The two-option trap — employment or full entrepreneurship — and why both feel inadequate. Third Path: introduce the Entrepreneurial Consumer concept. Not the compensation plan — the identity and the philosophy. Evidence: your personal story and one specific example from your team. Call to Action: low-pressure, specific, immediate. "The free workshop is available tonight. Here is the link."

**Digital Speaking Opportunities.** You do not need a stage. You need a camera and a speaking commitment. Live social media broadcasts, webinars, WhatsApp audio group sessions — all of these are public speaking opportunities. Each one builds comfort, skill and reach. Begin with your team — the WhatsApp group audio call. Then move to a small live broadcast. Then a larger event. The progression is organic if the commitment is consistent.

[[MIRROR_MOMENT]]`,
    activity: "Prepare a 5-minute Z2B presentation using the structure above: Opening question, Problem statement, Third Path introduction, one piece of evidence (your story or a team story), and CTA. Deliver it — to your family, to a mirror, to your phone camera. Then deliver it again. The preparation is not the script — it is the rehearsal. Commit to delivering this presentation to a small live audience within the next 14 days.",
    questions: [
      { q: "Public speaking multiplies impact beyond 1:1 conversations because:", options: ["Groups are more easily persuaded than individuals", "It reaches entire audiences with a single session, establishing authority and creating social proof at scale that individual conversations cannot match", "Public speaking is required for promotion to higher Z2B tiers", "Groups retain information better than individuals in 1:1 settings"], answer: 1 },
      { q: "Camera fear dissolves through:", options: ["Extensive preparation of a perfect speech", "Repetition of the experience — the builder who speaks publicly regularly transforms their confidence within weeks, not through preparation but through exposure", "Watching videos of skilled public speakers", "Professional speaking coaching and training"], answer: 1 },
      { q: "An effective Z2B presentation begins with:", options: ["The compensation plan and income potential", "A question the audience is already asking internally — anchoring in their reality, not the presenter's agenda", "An introduction of your credentials and background", "The Z2B founding story and mission statement"], answer: 1 },
      { q: "Digital speaking opportunities include:", options: ["Only formal webinar platforms with professional production", "Live social media broadcasts, WhatsApp audio sessions, team calls — accessible starting points that build skill and confidence progressively", "Only paid advertising platforms that reach large audiences", "Platforms that require a minimum following before going live"], answer: 1 },
      { q: "The CTA at the end of a Z2B presentation should be:", options: ["Urgent — closing the opportunity before they leave the room", "Low-pressure and specific — directing to the free workshop with no further commitment required immediately", "Focused on the compensation plan and income projections", "An invitation to join at the highest tier they can afford"], answer: 1 },
    ],
  },
  {
    id: 79, free: false,
    title: "Writing as a Business Skill",
    subtitle: "How Written Communication Opens Economic Doors",
    content: `The ability to write with clarity, precision and impact is one of the most transferable economic skills available to the Entrepreneurial Consumer. It underpins your social media content, your WhatsApp messages, your email sequences, your proposals, your agreements, your website copy and your workshop curriculum. Writing is not a specialist skill for journalists and authors — it is the fundamental human communication technology that everything else is built on.

The builder who writes well has a compounding advantage: every piece of content they produce is more clear, more persuasive and more lasting than the equivalent from a less skilled writer. Over time, this accumulates into a body of work — content, curriculum, published material — that establishes them as a thought leader in their field. And thought leadership is the most defensible form of business positioning available.

**The Three Writing Skills Every EC Builder Needs.** Clarity: writing what you mean in the fewest words possible without losing meaning. Clarity respects the reader's time. It demonstrates confidence in your own thinking. Vague writing is usually a sign of vague thinking. When your writing is clear, your thinking is clear. Precision: choosing words for their specific meaning, not their approximate meaning. "I have facilitated 12 Bronze upgrades this month" is more precise than "I have been doing well recently." Precision builds credibility. Persuasion: constructing a logical, emotionally resonant case for a position or action. The combination of evidence, emotion and a clear call to action is the architecture of persuasive writing. Every invitation you write, every testimonial you share, every post you publish should have these three elements present.

**Writing as a Daily Practice.** Writing improves through writing. One daily piece of content — however short — is writing practice. The morning session reflection, written in three sentences. The pipeline note on a prospect. The team message that celebrates a win. Every written communication is an opportunity to practice clarity, precision and persuasion. The builder who treats writing as practice compounds their skill while generating content that serves their business.

[[MIRROR_MOMENT]]`,
    activity: "Write the same idea three times, getting more precise and persuasive with each version. Start with: 'Z2B has helped me.' Version 2: add specificity about what changed. Version 3: add the before state, the after state, the specific mechanism, and the invitation. Read all three aloud. Notice how the quality of persuasion increases with each version. This is the writing skill practice that compounds into thought leadership.",
    questions: [
      { q: "Writing is described as a compounding business skill because:", options: ["Writers earn more than non-writers", "Each piece of well-written content accumulates into a body of work that establishes thought leadership — an advantage that grows over time unlike skills that plateau", "Writing produces immediate income", "Written content lasts longer than video content"], answer: 1 },
      { q: "Clarity in writing demonstrates:", options: ["A limited vocabulary", "Confidence in your own thinking — vague writing is usually evidence of vague thinking, while clear writing shows you understand what you are communicating", "Academic writing training", "A casual approach to communication"], answer: 1 },
      { q: "Precision in writing builds credibility because:", options: ["Precise language sounds more impressive", "Specific facts and numbers replace vague assertions — 'I facilitated 12 Bronze upgrades' is verifiable and builds trust while 'I have been doing well' is unverifiable and unconvincing", "Precision demonstrates technical expertise", "Precise writing is harder to challenge or question"], answer: 1 },
      { q: "Persuasive writing requires:", options: ["Emotional manipulation and urgency", "The combination of evidence, emotional resonance and a clear call to action — logical, felt and directed toward a specific next step", "Advanced copywriting training", "A large vocabulary and complex sentence structures"], answer: 1 },
      { q: "Daily writing practice improves the skill because:", options: ["Daily practice is required by writing teachers", "Writing improves through writing — each piece, however short, builds the clarity, precision and persuasion that compounds into content quality and thought leadership over months and years", "Daily practice prevents writer's block", "Writing daily generates enough content for consistent posting"], answer: 1 },
    ],
  },
  {
    id: 80, free: false,
    title: "Negotiation Fundamentals",
    subtitle: "How to Create Win-Win Outcomes in Every Business Interaction",
    content: `Negotiation is not a battle. The builder who approaches every negotiation as a contest — where one party wins and the other loses — will consistently produce outcomes that damage relationships, close future opportunities and leave value on the table. The Entrepreneurial Consumer approaches negotiation as a collaborative problem-solving exercise: two parties with different starting positions seeking the arrangement that serves both of them best.

This perspective shift — from contest to collaboration — is not naive. It is strategic. The party that signals willingness to find mutually beneficial solutions almost always arrives at better long-term outcomes than the party that maximises their position in every individual transaction. Business relationships are long. Every negotiation affects the quality of the next one.

**The Negotiation Principles for EC Builders.** Principle 1: Understand their position before stating yours. Ask questions that reveal what the other party truly needs — not what they are initially asking for. Often what people ask for and what they need are different. The person who asks for a lower price might actually need better payment terms. The person who wants a shorter contract might actually need an exit clause. Understanding the real need gives you options that a pure price contest does not. Principle 2: Know your own worth before you negotiate. Undervalued self-assessment leads to unnecessary concession. Before entering any negotiation, know what you are offering, what it is worth and what your minimum acceptable outcome is. Principle 3: Be willing to walk away. The person who cannot walk away from a deal has no negotiating position. The willingness to walk away is not a threat — it is information. It tells the other party that you know your value and are not desperate for their yes. Principle 4: Always leave something for the other party. A deal in which the other party feels they lost something is a deal they will find a way to undo, renegotiate or abandon.

[[MIRROR_MOMENT]]`,
    activity: "Identify one current or upcoming negotiation in your life or Z2B building — a pricing discussion, a partnership conversation, a coaching agreement. Apply the four principles: what does the other party truly need (not just what they are asking for)? What is your worth and your minimum acceptable outcome? What is your walk-away point? What can you offer that leaves them feeling they won something? Write your negotiation plan before the conversation happens.",
    questions: [
      { q: "The collaborative approach to negotiation produces better long-term outcomes because:", options: ["Collaboration always produces higher financial returns than competition", "Business relationships are long — every negotiation affects the quality of the next one, and parties who feel respected return for more", "Collaborative negotiations are faster and less stressful", "Competition in negotiation damages the Z2B community standards"], answer: 1 },
      { q: "Understanding the other party's real need before stating your position:", options: ["Is a manipulation tactic", "Reveals options that a pure positional contest misses — the real need and the stated ask are often different, creating creative solutions that serve both parties", "Weakens your negotiating position by revealing your flexibility", "Is only relevant in large business negotiations"], answer: 1 },
      { q: "Willingness to walk away from a deal is described as:", options: ["An aggressive negotiation tactic", "Information — it tells the other party you know your value and are not desperate for their yes, which paradoxically improves your negotiating position", "Only available to people with multiple alternatives", "Evidence of poor relationship management"], answer: 1 },
      { q: "Leaving something for the other party in a negotiation:", options: ["Reduces your own outcome unnecessarily", "Prevents them from feeling they lost and wanting to undo, renegotiate or abandon the agreement — producing a durable deal rather than a won battle", "Is only necessary in ongoing relationships", "Is a sign of weak negotiating skill"], answer: 1 },
      { q: "The minimum acceptable outcome in a negotiation serves as:", options: ["A signal that you have low confidence in your offering", "Your walk-away reference point — the line that defines when walking away serves you better than accepting the current terms", "A compromise position to offer early in the negotiation", "A figure that should be shared with the other party to demonstrate reasonableness"], answer: 1 },
    ],
  },
  {
    id: 81, free: false,
    title: "Advanced Team Leadership",
    subtitle: "Taking Your Organisation From Momentum to Movement",
    content: `Momentum is when your team is moving. Movement is when your team is moving with direction, conviction and compounding force that pulls others toward it. Most Z2B builders who build a team achieve momentum. Fewer achieve movement. The difference is not size — small teams can have extraordinary movement. The difference is culture.

Culture is the invisible operating system of your team. It determines how people behave when you are not watching, what decisions they make when the policy does not cover the situation, and whether they stay when results are slow. Culture cannot be installed with a team meeting. It grows from the consistent demonstration of values by the leader — over time, through repeated specific choices.

**The Three Marks of a Team With Movement.** First: Shared Language. The team uses common expressions, common frameworks, common references that create an in-group identity. Entrepreneurial Consumer. Purple Cow. The third path. The four table legs. #Reka_Obesa_Okatuka. When your team uses this language naturally — in conversation, in content, in recruiting — they are not just repeating phrases. They are demonstrating that the culture is internalised. Second: Self-Replication. The team's culture reproduces without requiring your direct involvement. New builders who join are oriented by existing builders, not just by the upline. The values are transferred person-to-person, not just top-down. Third: Shared Mission. The team sees itself as part of something larger than income. They are offering people a third path. They are building tables. They are serving the Kingdom mandate. When a team has a shared mission bigger than the compensation plan, they persist through the months when the compensation is not yet justifying the effort.

**The Leader's Role at the Movement Stage.** You are no longer the engine. You are the architect. Your job is to protect the culture — to recognise and reward behaviours that embody the values, and to correct swiftly and lovingly when behaviours contradict them. Every compromise of values for short-term results is a withdrawal from the culture account that makes movement possible.

[[MIRROR_MOMENT]]`,
    activity: "Evaluate your team's movement indicators. On a scale of 1-5: Does your team use the Z2B shared language naturally? Does the culture self-replicate without your direct involvement? Does the team share a mission larger than income? Your lowest score is your current ceiling. Write one specific leadership action this week that addresses your lowest-scoring movement indicator.",
    questions: [
      { q: "Movement differs from momentum because:", options: ["Movement is faster than momentum", "Movement includes direction, conviction and culture that compounding force pulls others toward — momentum is simply activity, movement is culture-led purpose", "Movement requires a larger team than momentum", "Momentum is short-term while movement is long-term"], answer: 1 },
      { q: "Culture as the team's invisible operating system determines:", options: ["The official rules and policies that govern behaviour", "How people behave when not watched, what decisions they make when policy is absent, and whether they stay when results are slow", "The team's compensation structure and income potential", "The quality of training resources available to builders"], answer: 1 },
      { q: "Shared language in a movement-stage team signals:", options: ["That the team has received sufficient training", "Cultural internalisation — when builders use the EC, Purple Cow and table language naturally, the philosophy is in the culture, not just the curriculum", "That the leader has communicated effectively", "Compliance with Z2B's required terminology"], answer: 1 },
      { q: "Self-replication of culture is achieved when:", options: ["The leader trains every new builder personally", "New builders are oriented by existing builders — values transfer person-to-person, not just top-down, removing the bottleneck of leader availability", "The team reaches a specific size threshold", "A formal buddy system is implemented by leadership"], answer: 1 },
      { q: "The leader's role at the movement stage shifts to:", options: ["Being the team's primary recruiter and top sales performer", "Architect — protecting the culture by recognising behaviours that embody values and correcting swiftly when behaviours contradict them, without compromise for short-term results", "Managing daily team operations and pipeline performance", "Providing all training content and coaching sessions personally"], answer: 1 },
    ],
  },
  {
    id: 82, free: false,
    title: "Scaling Your Network Marketing Business",
    subtitle: "Systems for Growing Beyond Your Personal Reach",
    content: `Scaling is the transition from a business that runs on your personal capacity to one that runs on systems, culture and duplication. The unscaled business grows only as fast as you can personally grow it. The scaled business grows as fast as the system can replicate. For network marketing, the scaling threshold is crossed when your team's activity exceeds your personal activity as the primary driver of growth.

Every scaling strategy has the same prerequisite: the activity being scaled must be working before it is multiplied. Scaling a broken system produces broken results faster and at greater cost. Scale what works. Fix what does not before you multiply it.

**The Four Scaling Mechanisms in Z2B.** Mechanism 1: Geographic Expansion. Your personal network is geographically clustered. Your team members' networks are in different locations. As your team grows, you naturally reach communities and markets you could never personally access. This is geographic scaling through duplication. Mechanism 2: Tier Depth Scaling. Each tier upgrade unlocks deeper TSC generations. At Bronze you see to G3. At Silver, G6. At Platinum, G10. Every upgrade is a scaling of your income depth without requiring more personal activity. Mechanism 3: Content Scaling. As your content library grows, earlier content continues attracting sign-ups. A TikTok posted 8 months ago still drives referral link clicks today. Content scales because it persists. Mechanism 4: System Scaling. The 9-Day Nurture Engine and pipeline automation handle an unlimited number of prospects simultaneously. The system does not slow down as the volume increases.

**The Scaling Mindset Shift.** Scaling requires letting go of control. The builder who needs to be personally involved in every prospect conversation, every new builder onboarding and every team decision will not scale past their personal attention bandwidth. Delegation, trust and system-reliance are not signs of disengagement — they are the prerequisites of scale.

[[MIRROR_MOMENT]]`,
    activity: "Identify your current scaling constraint — the single bottleneck that limits your Z2B growth beyond your personal reach. Is it geographic (you have not yet activated your team's networks in other areas)? Tier depth (you are still at Bronze TSC depth)? Content volume (you have few pieces of evergreen content)? System reliance (you are manually doing what the systems should handle)? Write your specific scaling action for the bottleneck identified.",
    questions: [
      { q: "The scaling threshold in network marketing is crossed when:", options: ["The team reaches 100 members", "The team's activity exceeds the leader's personal activity as the primary growth driver — the system and culture are running independently", "Revenue exceeds the leader's salary", "The leader reaches Platinum tier"], answer: 1 },
      { q: "The prerequisite of scaling any activity is:", options: ["Having sufficient capital to fund the scale", "That the activity being scaled must already be working — scaling broken systems produces broken results faster and at greater cost", "Reaching Silver tier or above", "Having a team of at least 12 active builders"], answer: 1 },
      { q: "Content scaling works because:", options: ["Social media algorithms continuously promote old content", "Content persists — a post created months ago continues attracting referral link clicks, scaling reach without proportional additional effort", "Content becomes more valuable over time", "Search engines index Z2B content preferentially"], answer: 1 },
      { q: "Delegation and trust as prerequisites of scale mean:", options: ["The leader should be minimally involved in their team's activities", "The builder who must be personally involved in every decision cannot scale past their attention bandwidth — letting go of control enables growth beyond personal capacity", "Delegation reduces the quality of team performance", "Trust is only possible after vetting every team member thoroughly"], answer: 1 },
      { q: "Tier depth scaling means:", options: ["Recruiting more people at each tier level", "Each upgrade unlocks deeper TSC generations — Bronze to G3, Silver to G6, Platinum to G10 — scaling income depth without requiring more personal selling activity", "Higher tiers produce proportionally higher income per sale", "Depth scaling requires having active builders at each generation level simultaneously"], answer: 1 },
    ],
  },
  {
    id: 83, free: false,
    title: "Multiple Income Streams — Advanced Strategy",
    subtitle: "Building a Portfolio of Income Sources That Reinforce Each Other",
    content: `The beginning EC focuses on one income stream and does it well. This is correct. The advanced EC builds multiple streams strategically — not by scattering attention across unrelated opportunities, but by deliberately constructing a portfolio of income sources that reinforce each other. Each stream feeds the others. The Z2B TSC provides capital for digital product creation. The digital product income funds the Silver upgrade. The Silver upgrade deepens the TSC. The compounding is not accidental — it is designed.

The difference between scattering and portfolio-building is intentionality. Scattered income streams are unrelated, requiring separate skill sets and separate audiences. Portfolio income streams share infrastructure, audience or skill — each one strengthening the foundation that all others stand on.

**The Z2B Income Portfolio Architecture.** Foundation stream: ISP and QPB from personal Z2B sales — this is your proof-of-concept and early income base. Growth stream: TSC from team building — this is your first residual income layer. Amplification stream: digital products sold to your Z2B community — coaching guides, templates, online courses leveraging the knowledge you develop in the workshop. Authority stream: coaching or consulting services — as your Z2B journey advances, your experience becomes a paid product for new builders or other entrepreneurs. Legacy stream: property and investment returns — funded by the combined income of all previous streams.

**The Reinforcement Principle.** Every income stream in a well-designed portfolio makes the others easier. Your Z2B content builds an audience that buys your digital products. Your digital products establish your authority that attracts coaching clients. Your coaching income provides capital for property investment. Your property income provides security that allows you to take calculated risks with your Z2B building. The portfolio is not just more income sources — it is a reinforcing ecosystem.

[[MIRROR_MOMENT]]`,
    activity: "Map your personal income portfolio. Draw five circles labelled: Foundation (Z2B ISP/QPB), Growth (TSC), Amplification (digital products), Authority (coaching/consulting), Legacy (investments/property). For each circle, write your current status: Active, Building, or Future. Draw arrows between circles showing how each currently feeds or will feed another. This map is your advanced income strategy in visual form.",
    questions: [
      { q: "The portfolio approach to income streams differs from scattering because:", options: ["Portfolios always produce higher total income", "Portfolio streams share infrastructure, audience or skill — each reinforcing the others — while scattered streams require separate skill sets and fragment attention", "Portfolios are managed by financial advisors", "Scattering income streams reduces risk while portfolios concentrate it"], answer: 1 },
      { q: "The Z2B income portfolio architecture begins with:", options: ["TSC — the largest income stream", "ISP and QPB — the proof-of-concept and early income base that establishes the foundation all other streams build on", "Property and investment — the most stable income source", "Coaching and consulting — the highest per-hour income stream"], answer: 1 },
      { q: "The reinforcement principle in an income portfolio means:", options: ["Each stream generates income independently without affecting others", "Each stream makes the others easier — audience, capital, authority and security from one stream directly enhance the others", "Diversified streams reduce total tax liability", "Reinforcement requires all streams to be active simultaneously"], answer: 1 },
      { q: "Moving from foundation to authority streams requires:", options: ["A large initial capital investment", "The accumulated knowledge, credibility and experience developed through active Z2B building — the authority stream is the product of the journey itself", "Formal business coaching qualifications", "A separate business registration for the coaching practice"], answer: 1 },
      { q: "Legacy streams (property and investment) in the portfolio:", options: ["Should be started immediately before other streams are established", "Are funded by the combined income of earlier streams — they are the destination of the portfolio, not the starting point", "Are only appropriate for Platinum tier members", "Generate the highest income in the shortest time"], answer: 1 },
    ],
  },
  {
    id: 84, free: false,
    title: "The Legacy Mindset",
    subtitle: "Shifting From Personal Success to Generational Impact",
    content: `There comes a point in every builder's journey — usually after they have addressed their immediate financial needs and begun building genuine stability — when the original motivation for building must be supplemented by a larger one. Personal success is sufficient motivation to start. It is rarely sufficient to sustain the decades of building that real legacy requires. The builder who reaches their income target and then asks "now what?" has reached the natural ceiling of personal success as motivation.

The Legacy Mindset is the shift from "what can I build for myself?" to "what can I build that will outlast me?" It is not the abandonment of personal goals — it is the expansion of purpose beyond them. The Z2B 4th Table Leg — Legacy — is not added to the table at the end. It is baked into the foundation from the beginning, so that every decision made in building is tested against not just "does this serve me today?" but "does this serve those who will come after me?"

**The Three Dimensions of Legacy in Z2B.** Financial Legacy: the income stream that continues after your active daily building reduces. TSC from a healthy, self-replicating team is the clearest example — the generational architecture that pays forward. Educational Legacy: the curriculum, the philosophy, the content you have created during your building journey. The workshop you created. The coaching you provided. The content that will still be educating people after you have moved to the next season. Relational Legacy: the builders you poured into, whose lives are now demonstrably different because of your investment. Their success is your most enduring monument.

**The Legacy Decision Maker.** Use this filter for major decisions: "In 20 years, will I be glad I made this decision?" Not 20 days. Not 20 months. 20 years. This filter eliminates most short-term compromises of integrity, most decisions to extract value rather than create it, and most choices to take the quick return over the compounding one. The legacy filter extends your time horizon — and extended time horizons consistently produce better decisions.

[[MIRROR_MOMENT]]`,
    activity: "Write your Z2B legacy statement. Not your income target — your legacy. Complete: 'In 20 years, because I built faithfully, [specific number] of families will have [specific transformation]. My team will have [specific depth]. My curriculum will have reached [specific audience]. My name will be associated with [specific contribution to the EC movement].' Read it. This is your north star beyond every quarterly result.",
    questions: [
      { q: "Personal success is described as sufficient to start but insufficient to sustain because:", options: ["Personal success requires too much individual effort to maintain long-term", "The natural ceiling of personal success as motivation is reached when immediate needs are met — only a legacy purpose beyond self provides the horizon required for decades of building", "Personal success goals are inherently too small", "Personal motivation is generally less powerful than collective motivation"], answer: 1 },
      { q: "The Legacy Mindset tests decisions against:", options: ["What produces the highest short-term income", "Not just 'does this serve me today?' but 'does this serve those who will come after me?' — extending the time horizon beyond personal success", "What produces the highest conversion rate", "What other successful builders in Z2B have decided"], answer: 1 },
      { q: "The three dimensions of legacy in Z2B are:", options: ["Income, community, platform", "Financial (continuing TSC), educational (curriculum and content), and relational (builders whose lives are permanently different)", "Personal, professional, and spiritual", "Bronze, Silver, and Platinum achievements"], answer: 1 },
      { q: "The 20-year decision filter is valuable because:", options: ["20 years is the standard business planning horizon", "It eliminates short-term compromises of integrity and quick-return choices by forcing evaluation against the standard of whether the decision will be right across a legacy-length time frame", "Most financial investments mature in 20 years", "Z2B's compensation plan is designed for 20-year building horizons"], answer: 1 },
      { q: "TSC from a healthy team represents financial legacy because:", options: ["TSC is the highest-paying Z2B income stream", "It continues after daily active building reduces — the generational architecture pays forward indefinitely as the team self-replicates", "TSC income grows automatically without any ongoing leadership", "TSC income is guaranteed regardless of team activity"], answer: 1 },
    ],
  },
  {
    id: 85, free: false,
    title: "Wealth Transfer Principles",
    subtitle: "How to Prepare the Next Generation for What You Are Building",
    content: `Building wealth is the first challenge. Transferring it is the second — and it is harder than most people anticipate. History is full of fortunes built in one generation and dissipated in the next. The Proverb says "a good person leaves an inheritance for their children's children" (Proverbs 13:22) — but the inheritance is not just financial. It is philosophical, relational and structural. The next generation must be prepared to receive, steward and multiply what they inherit — otherwise the financial inheritance simply funds the same spending patterns that prevented wealth in their parents' generation.

The Entrepreneurial Consumer who takes legacy seriously does not simply accumulate and hope. They deliberately prepare the next generation while building — through the transfer of mindset, skill, relationship and structure.

**The Four Dimensions of Wealth Transfer.** First: Mindset Transfer. Children who grow up in a home where the Entrepreneurial Consumer philosophy is lived — where conversations about assets and liabilities are normal, where building is modelled daily, where generosity is practised — develop a different relationship with money than children who did not. The most powerful wealth transfer is not the financial inheritance. It is the money mindset the next generation absorbs before they earn their first rand. Second: Skill Transfer. Teaching your children — or those you mentor — the specific skills of building: content creation, pipeline management, negotiation, financial literacy. These skills compound over a lifetime. Third: Structure Transfer. Setting up the legal and financial structures that allow wealth to be passed efficiently: wills, trusts, company shareholding, named beneficiaries on policies and investments. Fourth: Relationship Transfer. Your network, your team, your community relationships are potentially transferable. Introducing your children to your circle of covenant partners early creates relationship capital they can build on.

[[MIRROR_MOMENT]]`,
    activity: "Take one concrete wealth transfer action this week. It can be as simple as: having a conversation with your children about assets and liabilities using the language from this workshop. Or naming a beneficiary on an existing policy. Or drafting a one-page outline of what you want to pass on and to whom. Wealth transfer begins with intention made concrete. Make it concrete today.",
    questions: [
      { q: "Building wealth is described as harder to transfer than to build because:", options: ["Tax laws make wealth transfer expensive", "The next generation must be prepared to receive, steward and multiply what they inherit — financial inheritance without philosophical inheritance is often dissipated within a generation", "Wealth transfer requires complex legal structures", "The inheriting generation faces different economic conditions"], answer: 1 },
      { q: "The most powerful form of wealth transfer is:", options: ["The financial inheritance left in a will", "The money mindset absorbed before the inheriting generation earns their first rand — the daily modelling of EC philosophy in the home", "A formal financial education programme", "Company ownership structures passed to children"], answer: 1 },
      { q: "Skill transfer as wealth transfer includes:", options: ["All academic qualifications and degrees", "Specific building skills — content creation, pipeline management, negotiation, financial literacy — that compound over a lifetime when learned early", "Sports and recreational skills that build discipline", "Only financial and investment skills"], answer: 1 },
      { q: "Structure transfer includes:", options: ["Only financial advice and investment recommendations", "Wills, trusts, company shareholding, named beneficiaries — legal and financial structures that allow wealth to pass efficiently", "Social media accounts and digital property", "Only property ownership documents"], answer: 1 },
      { q: "Relationship transfer involves:", options: ["Automatically inheriting the parent's business contacts", "Deliberately introducing the next generation to the builder's circle of covenant partners early — creating relationship capital they can build on", "Transferring Z2B membership and referral link", "Social media follower accounts transferred to children"], answer: 1 },
    ],
  },
  {
    id: 86, free: false,
    title: "Philanthropy and Kingdom Impact",
    subtitle: "How Giving at Scale Becomes Your Greatest Business Strategy",
    content: `At a certain stage of building, the most powerful thing you can do for your business is to give more. Not because generosity is a marketing tactic — but because the person or organisation that gives at scale develops a reputation, a network, a community of gratitude and a depth of purpose that no advertising budget can purchase. This is not idealism. It is the documented pattern of every major institution that has endured — religious, business, social — across centuries.

Philanthropy at scale is the natural evolution of the tithe principle we discussed in Session 71. Where the tithe is a personal first-fruits practice, philanthropy at scale is the strategic deployment of surplus for community impact. It is giving that is large enough to create measurable outcomes — not just the good feeling of personal generosity.

**The Philanthropic Mandate of the Z2B Legacy Builder.** The Z2B builder who has built their income architecture, secured their family's financial foundation and achieved the freedom they sought — what is the next assignment? The mandate is clear: pour back into the community that produced you. The employed professional who discovered the third path — what responsibility do they have to the employed professionals who have not yet heard about it? The builder whose Z2B income replaced a salary — what obligation do they carry to the person still trapped in the salary-only model?

**The Strategic Philanthropy Approach.** Not all giving is equal in impact. Strategic philanthropy identifies the highest-leverage intervention — the point where a relatively small resource input produces disproportionately large community impact. For Z2B builders, this might be: funding access to the workshop for emerging market communities who cannot afford the Bronze upgrade. Creating a scholarship programme for high-potential students who cannot afford business development training. Building digital infrastructure for community organisations that serve the EC's target audience. Every one of these strategies simultaneously serves the community and expands the Z2B ecosystem.

[[MIRROR_MOMENT]]`,
    activity: "Define your Kingdom Impact commitment. Write three levels: what you will give at your current income level (even if small), what you will give when you reach Silver tier income, and what you will give when you reach Platinum tier income. Then identify one specific organisation, community or cause that aligns with your Z2B values — employed people seeking transformation, faith communities, youth development. Your philanthropy has a name and a face before it has a budget.",
    questions: [
      { q: "Giving at scale develops a reputation that advertising cannot purchase because:", options: ["Philanthropy generates free press coverage", "The network, community of gratitude and depth of purpose created by consistent large-scale giving attracts partnerships, opportunities and loyalty that transactional relationships never produce", "Tax deductions make large-scale giving financially advantageous", "Philanthropists are exempt from normal business competition"], answer: 1 },
      { q: "Philanthropy differs from personal tithing by:", options: ["Being tax deductible at corporate rates", "Scale and strategic intent — philanthropy is large enough to produce measurable community outcomes, not just personal spiritual practice", "Being required only at Gold and Platinum tier", "Targeting different types of recipients"], answer: 1 },
      { q: "The Z2B Legacy Builder's philanthropic mandate is:", options: ["To donate 10% of all income to a registered charity", "To pour back into the community that produced you — extending access to the third path to those who have not yet discovered it", "To fund Z2B's corporate marketing activities", "To provide free Bronze memberships to all recruits"], answer: 1 },
      { q: "Strategic philanthropy identifies:", options: ["The cause that generates the most positive publicity", "The highest-leverage intervention point — where relatively small resource input produces disproportionately large community impact", "The largest established charity organisation", "The philanthropic cause most common among successful network marketers"], answer: 1 },
      { q: "Funding workshop access for communities who cannot afford Bronze is described as:", options: ["A short-term charity activity with no business benefit", "A simultaneously philanthropic and strategic act — serving the community while expanding the Z2B ecosystem by creating informed, motivated potential builders", "Only appropriate for Platinum builders with surplus income", "A violation of Z2B's commercial model"], answer: 1 },
    ],
  },
  {
    id: 87, free: false,
    title: "Building Your Brand Authority",
    subtitle: "Becoming the Go-To Person in Your Economic Community",
    content: `Brand authority is the state in which your community automatically associates you with a specific domain of expertise, transformation or value. When someone in your network has a question about the Entrepreneurial Consumer philosophy, they come to you. When someone is considering Z2B, they are sent to you. When someone needs perspective on income diversification, they call you first. That automatic routing — you as the first resource — is brand authority in practice.

It does not happen suddenly. It is the accumulated result of consistently showing up, sharing genuine value, demonstrating expertise through application and building a body of work that speaks before you speak. The builder who has published 200 pieces of content on the EC philosophy over 18 months has brand authority. Not because they declared it — because they demonstrated it.

**The Three Pillars of Brand Authority.** Consistency: showing up on the same platforms, with the same message, at the same quality level, over an extended period. Inconsistency is the authority destroyer — the voice that appears and disappears is never trusted as a reliable source. Specificity: authority comes from depth, not breadth. The builder who is the world's clearest explainer of the Entrepreneurial Consumer third path will build more authority than the builder who speaks vaguely about business, money, motivation and lifestyle. Depth of Service: authority is ultimately earned through the depth of value you provide to the specific people you serve. The builder whose workshop insight post changed how someone thinks about their finances. The builder whose coaching session gave someone the courage to upgrade. These moments of deep service are the deposits in the authority account.

**Authority as a Business Moat.** Brand authority in your specific market creates a competitive moat that costs very little to build and is very difficult to replicate. Nobody can copy your specific combination of story, philosophy, demonstrated track record and community relationships. This moat grows with every piece of content published, every coaching conversation held and every team member developed. It is your most defensible competitive asset.

[[MIRROR_MOMENT]]`,
    activity: "Define your specific authority domain — the exact intersection of topic, audience and transformation that you will own. Write: 'I am building authority as the go-to [role description] for [specific audience] seeking [specific transformation].' Then audit your last 30 days of content against this definition. What percentage was on-domain? What percentage wandered into general content? Increasing your on-domain ratio is the fastest path to building genuine authority.",
    questions: [
      { q: "Brand authority is created through:", options: ["Public declaration of expertise and qualifications", "Consistently showing up with genuine value over an extended period — the automatic routing to you as a first resource is earned, not claimed", "A large social media following", "Professional certifications in your field"], answer: 1 },
      { q: "Specificity builds more authority than breadth because:", options: ["Specific audiences are larger than general ones", "Authority comes from depth — being the clearest voice on a specific topic builds deeper trust than being a general voice on many topics", "Specific content gets more algorithm reach", "Broad content appeals to too many different audiences to be managed"], answer: 1 },
      { q: "Brand authority as a competitive moat is valuable because:", options: ["It is expensive to build and therefore impressive", "It cannot be copied — your specific combination of story, philosophy, track record and relationships is irreproducible, making it a defensible advantage that grows over time", "It deters competition from entering your market", "It automatically generates more income than non-authoritative builders"], answer: 1 },
      { q: "Consistency is described as the authority destroyer when absent because:", options: ["Algorithms penalise inconsistent accounts", "The voice that appears and disappears is never trusted as a reliable source — trust requires predictable presence over time", "Inconsistency signals low quality content", "Inconsistent posting violates Z2B community standards"], answer: 1 },
      { q: "Deep service moments build authority because:", options: ["They generate testimonials for marketing use", "Each moment of genuinely helping someone deposits into the authority account — authority is ultimately earned through the depth of value provided to specific people served", "Deep service attracts premium-paying clients", "Service to others is tracked by the Z2B platform"], answer: 1 },
    ],
  },
  {
    id: 88, free: false,
    title: "Publishing and Thought Leadership",
    subtitle: "How Writing a Book or Creating a Course Multiplies Your Influence",
    content: `A book is a mentor that can be in thousands of places simultaneously. A course is a teacher that never sleeps, never loses patience and never charges per session. For the Entrepreneurial Consumer who has built genuine expertise through the Z2B journey — who has completed the full workshop, run the funnel, coached a team, developed their own philosophy of transformation — the book or course is the natural next expression of their knowledge.

Publishing establishes authority in a way that social media content cannot fully replicate. Social media content is ephemeral — it appears in a feed, disappears, and must be continually regenerated. A book is permanent. It is findable years after publication. It can be recommended by anyone who has read it. It can be held, carried and shared. It positions the author as a serious contributor to the conversation — not just a participant.

**The Three Publishing Paths for Z2B Builders.** Path 1: Self-Publishing a Book or Ebook. Amazon Kindle Direct Publishing (KDP), Smashwords and local South African print-on-demand services enable any author to publish a professionally formatted book without a traditional publisher. The process from manuscript to available-for-purchase can take 30 days. Cost: near zero for digital, modest for physical print. Path 2: Creating an Online Course. Platforms like Teachable, Udemy, Thinkific or the Z2B Marketplace host courses that can be sold globally. The course is created once and sold indefinitely. Path 3: Compiling a Signature Workshop. Your experience coaching Z2B builders, combined with the wisdom accumulated through this workshop, is the raw material for a standalone programme that serves your specific audience.

**Your Book Idea Is Already Written.** Everything you have learned in this 99-session workshop — applied to your specific journey, told in your specific voice — is a book. "How I Went From Employee to Entrepreneurial Consumer in 12 Months." "The Third Path." "Building Your Table While Still at Your Desk." Your experience is original. Your perspective is specific. Your testimony is your intellectual property. Write it.

[[MIRROR_MOMENT]]`,
    activity: "Write the outline for your book or course. Title: something specific to your EC journey. Introduction: the problem you solve and who this is for. Part 1: the before — what the target reader's life looks like before the transformation. Part 2: the shift — the principles and moments that change things. Part 3: the after — what becomes possible. Conclusion: the invitation. This outline, written today, is the first step toward a book that will extend your influence beyond your current reach.",
    questions: [
      { q: "A book establishes authority differently from social media content because:", options: ["Books are more expensive to produce and therefore more respected", "Books are permanent — findable years after publication, recommended, held and shared — positioning the author as a serious contributor rather than just a content stream", "Social media audiences are less educated than book readers", "Publishing requires editorial review that validates the content"], answer: 1 },
      { q: "The three publishing paths for Z2B builders are:", options: ["Traditional publishing, self-publishing, and audio books", "Self-publishing a book or ebook, creating an online course, and compiling a signature workshop", "Publishing on Z2B's platform, Amazon, and local bookstores", "Fiction writing, business writing, and academic publishing"], answer: 1 },
      { q: "Self-publishing through Amazon KDP is described as:", options: ["A low-prestige alternative to traditional publishing", "A legitimate path from manuscript to globally available book in approximately 30 days at near-zero cost — democratising the authority of authorship", "Only suitable for fiction authors", "Requiring professional editing and design services before submission"], answer: 1 },
      { q: "Your Z2B journey contains a book because:", options: ["All workshop graduates are required to publish", "Your specific experience applying EC principles, told in your authentic voice, is original intellectual property that no one else can write — your testimony is your content", "Z2B has a publishing programme for all members", "Books about network marketing are always commercially successful"], answer: 1 },
      { q: "Creating a course differs from writing a book by:", options: ["Courses are always more valuable than books", "Courses are interactive learning experiences sold indefinitely from a hosting platform — leveraging video and structured learning rather than narrative reading", "Courses require more expertise than books", "Books have wider reach than online courses"], answer: 1 },
    ],
  },
  {
    id: 89, free: false,
    title: "The Diamond Legacy Path",
    subtitle: "Your Roadmap to the Billionaire Table",
    content: `The Diamond Legacy is not a tier. It is a destination. It is the state — personal, financial, relational and spiritual — that the Entrepreneurial Consumer is building toward through every session of this workshop, every post they publish, every prospect they invite and every builder they coach. Diamond Legacy is not measured in a commission statement. It is measured in lives redirected, families transformed, communities equipped and a name that means something in the economy of human flourishing.

The Billionaire Table is Z2B's metaphor for the most expansive expression of the Entrepreneurial Consumer identity. Not that every builder will literally become a billionaire — though wealth at that scale is not beyond the mathematics of the Z2B model at depth. Rather, the Billionaire Table is the mindset — the thinking at scale, the building for impact that outlasts income, the invitation extended to ordinary people to sit at a table they were told was not for them.

**The Diamond Legacy Builder's Profile.** They have completed the full 99-session workshop and have integrated the philosophy into their daily life, not just their business activity. Their Z2B team spans multiple generations — active, self-replicating, with its own culture. Their income is diversified across multiple streams, with at least one stream that continues without their daily active involvement. Their family is financially equipped and philosophically prepared for what they will inherit. They have invested in community — the poor have been served, the knowledge has been shared, the next generation has been developed. They have built something that represents their name: content, curriculum, a platform or a programme that outlives their daily effort.

**The Path From Here.** You are reading this in Session 89 of 99. The path from where you are to Diamond Legacy is not a secret. It is everything this workshop has taught, applied consistently over years. The formula is complete. The only variable is the faithfulness of your application. Begin where you are. Use what you have. Do what you can. And trust the compound effect of faithful daily building to close the distance between your current reality and your Diamond Legacy destination.

[[MIRROR_MOMENT]]`,
    activity: "Write your Diamond Legacy declaration. Not a goal. A declaration — as if it is already written, looking back from the future: 'I, [your name], built faithfully from [today's date]. By [a specific future date], my table had [specific number] of seats filled. My family received [specific inheritance]. My community was served through [specific contribution]. My name became associated with [specific legacy]. And the journey began with one decision, made on [today's date], to show up fully.' Sign it. Date it. Read it every morning before your session.",
    questions: [
      { q: "The Diamond Legacy destination is measured by:", options: ["Monthly TSC income reaching a specific target", "Lives redirected, families transformed, communities equipped and a name that means something in the economy of human flourishing", "Reaching the Platinum tier qualification", "A specific team size and generation depth"], answer: 1 },
      { q: "The Billionaire Table metaphor represents:", options: ["A guaranteed financial destination for all Z2B builders", "The most expansive expression of the EC identity — building at the scale of impact that outlasts income, extending invitation to those told it was not for them", "Z2B's highest official recognition tier", "The compensation plan at maximum team depth"], answer: 1 },
      { q: "The Diamond Legacy Builder has integrated the philosophy by:", options: ["Completing 99 sessions in the shortest possible time", "Applying the EC identity and practices to their daily life, not just their business activity — the philosophy is lived, not just learned", "Achieving income above a specific monthly threshold", "Building a team of at least 100 active Bronze members"], answer: 1 },
      { q: "The path from current reality to Diamond Legacy is described as:", options: ["Secret knowledge reserved for the top 1% of Z2B builders", "Everything this workshop has taught, applied consistently over years — the formula is complete, the only variable is faithfulness of application", "Dependent on finding the right mentor and upline support", "Determined primarily by the market conditions and economic environment"], answer: 1 },
      { q: "The declaration at the end of this session is written as if from the future because:", options: ["Future-tense declarations are more motivating than present-tense goals", "A declaration rather than a goal changes your relationship with the destination — you move from hoping to arrive to choosing to have arrived, which changes every daily decision", "The Z2B workshop requires future-dated commitments", "Past-tense declarations are required by the compensation plan"], answer: 1 },
    ],
  },
  {
    id: 90, free: false,
    title: "The Entrepreneurial Consumer — Your Identity, Your Table, Your Legacy",
    subtitle: "The Final Session: From Student to Builder to Legacy Maker",
    content: `You are at the end of a 99-session journey that began with a single question: is there a third path between the safety of employment and the risk of full entrepreneurship?

The answer is yes. The Entrepreneurial Consumer is real. The third path exists. And now you know it — not just intellectually, but through 99 sessions of application, reflection, challenge and growth that have changed how you think about yourself, your money, your network and your future.

This final session is not a summary. It is a commissioning.

**What You Know Now That You Did Not Know Before.** You know that your household expenses are not just costs — they are income-generating assets waiting to be repositioned. You know that your smartphone is a business platform, not a distraction device. You know that your network is not just a social asset — it is human capital waiting to be activated. You know that the morning hour belongs to your identity, not to someone else's news feed. You know that a referral link, a 9-day nurture engine and a consistent ratio can generate income that exceeds a month's grocery bill — from one income stream among six.

**What Has Been Built.** A 99-session workshop, two formats — morning and evening. A Sales Funnel with six tabs, a WhatsApp Launcher and a Content Studio powered by AI. A Compensation Engine tracking six income streams across ten generations. A Start Here orientation page that will welcome every new builder at every new table. And a community — growing, building, belonging — to the Z2B Table Banquet.

**The Commissioning.** You do not graduate from the Entrepreneurial Consumer journey. You advance within it. The next session is the application of everything in this one. The next morning session is the identity anchor for tomorrow's building. The next post is the Purple Cow that calls the next person to the table. The next builder you coach carries the philosophy forward beyond your personal reach.

Go build the table. Fill every seat. Leave every person who sits there more capable than when they arrived. Pass the philosophy to the generation that follows. And trust the compound effect of faithful daily building to produce, in time, an outcome that exceeds everything you can currently imagine.

Hallelujah! Let's get busy with it.

[[MIRROR_MOMENT]]`,
    activity: "Write your final commitment. Not a goal — a covenant. Name what you will do, daily, for the next 90 days, to begin the full application of everything you have learned. Name the person you will invite to the table this week. Name the morning practice you will not compromise. Name the legacy you are building and for whom. Sign it. Date it. Share it with your sponsor or accountability partner. The workshop is complete. The building has only just begun.",
    questions: [
      { q: "The third path — the Entrepreneurial Consumer — is described at the end of Session 99 as:", options: ["A theoretical concept that may work for some people in certain markets", "Real and proven — not just intellectually known but experienced through 99 sessions of application, reflection and growth that have changed how the builder thinks about themselves and their future", "An aspiration that requires ideal conditions to achieve", "A starting point that must be supplemented by returning to employment eventually"], answer: 1 },
      { q: "The Final Session is described as a commissioning rather than a summary because:", options: ["Summaries are not allowed in the Z2B curriculum", "You do not graduate from the EC journey — you advance within it; the commissioning is a sending forward, not a completion", "Session 99 is the commissioning — it cannot fit within a summary format", "Commissionings are required by the Z2B certification programme"], answer: 1 },
      { q: "What the EC now knows that they did not know before includes:", options: ["Guaranteed income from Z2B within 30 days", "That household expenses are reposition-able assets, the smartphone is a business platform, the network is human capital, and the morning hour belongs to their identity", "The exact income all builders at their tier earn monthly", "The specific timeline to Platinum tier qualification"], answer: 1 },
      { q: "The instruction to 'go build the table' means:", options: ["Begin a new 99-session course immediately", "Apply the full EC philosophy — build the infrastructure, fill the seats, develop each person who sits there, and pass the philosophy forward to the generation that follows", "Focus exclusively on recruiting for the next 90 days", "Begin fresh at Session 1 with a new mindset"], answer: 1 },
      { q: "The compound effect of faithful daily building produces:", options: ["Guaranteed outcomes within a specific timeframe", "An outcome in time that exceeds everything currently imaginable — the specific results cannot be determined, only the direction and the principle that consistency compounds", "Results proportional to effort invested daily", "Results that plateau at a certain team size"], answer: 1 },
    ],
  },

];

// ============================================================
// PROGRESS HELPERS
// ============================================================
const createInitialProgress = (): ProgressMap => {
  const p: ProgressMap = {};
  SECTIONS.forEach((s) => {
    p[s.id] = { read: false, answers: {}, activityDone: false, completed: false, score: null };
  });
  return p;
};

// ============================================================
// COLOUR TOKENS
// ============================================================
if (typeof window !== "undefined") {
  const styleId = "z2b-workshop-animations";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes wave {
        0%   { height: 6px;  opacity: 0.6; }
        100% { height: 28px; opacity: 1;   }
      }
      @keyframes bounce {
        0%,100% { transform: translateY(0);   }
        50%      { transform: translateY(-12px); }
      }
    `;
    document.head.appendChild(style);
  }
}

const purple       = "#6B21A8";
const purpleLight  = "#9333EA";
const purplePale   = "#F3E8FF";
const purpleMid    = "#EDE9FE";
const purpleBorder = "#C4B5FD";
const gold         = "#D97706";
const goldLight    = "#FEF3C7";
const bg           = "#FAFAFA";
const white        = "#FFFFFF";
const text         = "#1E1B2E";
const textMuted    = "#6B7280";
const textLight    = "#9CA3AF";
const green        = "#059669";
const greenPale    = "#D1FAE5";
const red          = "#DC2626";
const redPale      = "#FEE2E2";
const bluePale     = "#DBEAFE";
const blue         = "#2563EB";

// ============================================================
// STYLES
// ============================================================
const S: Record<string, CSSProperties> = {
  homePage:      { minHeight: "100vh", background: `linear-gradient(135deg, ${purplePale} 0%, #ffffff 50%, ${purpleMid} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Georgia, serif", position: "relative", overflow: "hidden" },
  homeGlow:      { position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "500px", borderRadius: "50%", background: `radial-gradient(ellipse, rgba(147,51,234,0.1) 0%, transparent 65%)`, pointerEvents: "none" },
  homeContent:   { maxWidth: "640px", width: "100%", textAlign: "center", position: "relative", zIndex: 1 },
  homeLogoRow:   { marginBottom: "20px" },
  homeLogo:      { fontSize: "56px", fontWeight: "bold", color: purple, letterSpacing: "8px" },
  homeLogoSub:   { fontSize: "11px", letterSpacing: "6px", color: purpleLight, marginTop: "4px", textTransform: "uppercase" },
  homeTitle:     { fontSize: "26px", color: text, margin: "0 0 12px", lineHeight: 1.35, fontWeight: "bold" },
  homeTagline:   { fontSize: "15px", color: textMuted, fontStyle: "italic", margin: "0 0 8px", lineHeight: 1.7 },
  homeBy:        { fontSize: "12px", color: purpleLight, margin: "0 0 32px", fontWeight: "bold" },
  homeStats:     { display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "28px", background: white, borderRadius: "16px", padding: "20px", border: `2px solid ${purpleBorder}`, boxShadow: "0 4px 20px rgba(107,33,168,0.1)" },
  homeStat:      { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  homeStatNum:   { fontSize: "30px", fontWeight: "bold", color: purple },
  homeStatLabel: { fontSize: "11px", color: textMuted, letterSpacing: "1px", textTransform: "uppercase" },
  homeStatDiv:   { width: "1px", height: "40px", background: purpleBorder },
  homeBtnRow:    { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" },
  homeTeee:      { display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" },
  teeePill:      { background: white, color: purple, border: `1.5px solid ${purpleBorder}`, padding: "7px 16px", borderRadius: "20px", fontSize: "12px", letterSpacing: "1px", fontWeight: "bold" },
  homeFooter:    { fontSize: "11px", color: textLight, marginTop: "8px" },
  page: { minHeight: "100vh", background: bg, color: text, fontFamily: "Georgia, serif", paddingBottom: "80px" },
  workshopHeader: { background: white, borderBottom: `2px solid ${purpleBorder}`, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(107,33,168,0.07)" },
  workshopTitle:  { fontSize: "20px", color: purple, margin: "8px 0 4px", textAlign: "center", fontWeight: "bold" },
  workshopSub:    { fontSize: "12px", color: textMuted, textAlign: "center", margin: "0 0 12px" },
  progressBar:    { height: "6px", background: purplePale, borderRadius: "3px", overflow: "hidden", margin: "0 0 6px", border: `1px solid ${purpleBorder}` },
  progressFill:   { height: "100%", background: `linear-gradient(90deg, ${purple}, ${purpleLight})`, transition: "width 0.5s", borderRadius: "3px" },
  progressText:   { fontSize: "11px", color: purpleLight, textAlign: "center", fontWeight: "bold" },
  sectionGrid:    { padding: "20px", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "800px", margin: "0 auto" },
  sectionCard:    { display: "flex", alignItems: "center", gap: "16px", background: white, border: `1.5px solid ${purpleBorder}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" },
  cardDone:       { borderColor: green, background: greenPale },
  cardLocked:     { opacity: 0.45, cursor: "default", background: "#f9f9f9" },
  cardNext:       { borderColor: purpleLight, background: purplePale },
  cardNum:        { width: "38px", height: "38px", borderRadius: "50%", background: purplePale, border: `2px solid ${purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: purple, fontWeight: "bold", flexShrink: 0 },
  cardInfo:       { flex: 1 },
  cardTitle:      { fontSize: "14px", color: text, fontWeight: "bold", marginBottom: "2px" },
  cardSub:        { fontSize: "11px", color: textMuted },
  freeBadge:      { display: "inline-block", background: greenPale, color: green, border: `1px solid ${green}88`, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", marginTop: "4px", marginRight: "6px", fontWeight: "bold" },
  doneBadge:      { display: "inline-block", background: greenPale, color: green, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", marginTop: "4px", fontWeight: "bold" },
  sectionTopBar:  { display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", background: white, borderBottom: `2px solid ${purpleBorder}`, position: "sticky", top: 0, zIndex: 10 },
  sectionBadge:   { fontSize: "12px", color: purpleLight, marginLeft: "auto", fontWeight: "bold", background: purplePale, padding: "4px 10px", borderRadius: "20px", border: `1px solid ${purpleBorder}` },
  sectionHero:    { padding: "32px 20px 20px", textAlign: "center", maxWidth: "800px", margin: "0 auto", background: `linear-gradient(180deg, ${purplePale} 0%, ${bg} 100%)` },
  sectionNum:     { fontSize: "11px", letterSpacing: "3px", color: purpleLight, textTransform: "uppercase", marginBottom: "10px", fontWeight: "bold" },
  sectionTitle:   { fontSize: "24px", color: purple, margin: "0 0 10px", lineHeight: 1.3, fontWeight: "bold" },
  sectionSubtitle:{ fontSize: "14px", color: textMuted, fontStyle: "italic" },
  contentCard:    { background: white, border: `1.5px solid ${purpleBorder}`, borderRadius: "14px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto", maxHeight: "60vh", overflowY: "auto", padding: "28px", position: "relative" },
  para:           { color: text, lineHeight: 1.95, marginBottom: "16px", fontSize: "15px" },
  sectionH3:      { color: purple, fontSize: "16px", margin: "22px 0 8px", fontWeight: "bold" },
  scrollHint:     { textAlign: "center", color: purpleLight, fontSize: "12px", padding: "14px 0 0", fontStyle: "italic", fontWeight: "bold" },
  activityCard:   { background: goldLight, border: "1.5px solid #FCD34D", borderRadius: "14px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto", padding: "24px" },
  activityHeader: { fontSize: "14px", color: gold, fontWeight: "bold", marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase" },
  activityText:   { color: "#78350F", lineHeight: 1.8, fontSize: "14px", marginBottom: "16px", fontStyle: "italic" },
  checkLabel:     { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: text, fontSize: "14px", fontWeight: "bold" },
  checkbox:       { width: "18px", height: "18px", accentColor: green, cursor: "pointer" },
  quizCard:       { background: white, border: `1.5px solid ${purpleBorder}`, borderRadius: "14px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto", padding: "28px" },
  quizHeader:     { fontSize: "14px", color: purple, fontWeight: "bold", marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" },
  quizSub:        { fontSize: "12px", color: textMuted, marginBottom: "20px" },
  question:       { marginBottom: "24px" },
  qText:          { color: text, fontSize: "14px", marginBottom: "10px", lineHeight: 1.6, fontWeight: "bold" },
  optionBtn:      { display: "flex", alignItems: "center", gap: "10px", width: "100%", background: purplePale, border: `1.5px solid ${purpleBorder}`, color: text, padding: "11px 16px", borderRadius: "10px", cursor: "pointer", marginBottom: "8px", textAlign: "left", fontSize: "13px" },
  optionSelected: { background: bluePale, borderColor: blue, color: blue },
  optionCorrect:  { background: greenPale, borderColor: green, color: green },
  optionWrong:    { background: redPale, borderColor: red, color: red },
  optionLetter:   { width: "24px", height: "24px", borderRadius: "50%", background: purpleBorder, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0, color: purple },
  scoreBox:       { marginTop: "20px", textAlign: "center" },
  scoreResult:    { color: text, fontSize: "16px", marginBottom: "16px", fontWeight: "bold" },
  hint:           { color: gold, fontSize: "12px", marginTop: "8px", fontWeight: "bold" },
  resultCard:     { maxWidth: "480px", margin: "60px auto", background: white, border: `2px solid ${purpleBorder}`, borderRadius: "20px", padding: "40px", textAlign: "center", boxShadow: "0 8px 40px rgba(107,33,168,0.12)" },
  goldStar:       { fontSize: "52px", marginBottom: "16px" },
  resultTitle:    { color: purple, fontSize: "24px", margin: "0 0 8px", fontWeight: "bold" },
  resultSub:      { color: textMuted, fontSize: "14px", margin: "0 0 24px" },
  scoreCircle:    { width: "84px", height: "84px", borderRadius: "50%", border: `4px solid ${purple}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "bold", color: purple, margin: "0 auto 12px", background: purplePale },
  scoreLabel:     { color: text, fontSize: "14px", margin: "0 0 24px" },
  resultBtnRow:   { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  paywallPage:    { minHeight: "100vh", background: `linear-gradient(135deg, ${purplePale} 0%, ${white} 60%, ${purpleMid} 100%)`, padding: "20px", fontFamily: "Georgia, serif", color: text },
  paywallInner:   { maxWidth: "820px", margin: "0 auto", paddingTop: "20px" },
  paywallTitle:   { fontSize: "26px", color: purple, textAlign: "center", margin: "20px 0 12px", fontWeight: "bold" },
  paywallSub:     { color: textMuted, textAlign: "center", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.75, fontSize: "14px" },
  tierGrid:       { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "12px", marginBottom: "24px" },
  tierCard:       { background: white, border: "2px solid", borderRadius: "14px", padding: "22px 14px", textAlign: "center" },
  tierName:       { fontSize: "14px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "8px" },
  tierPrice:      { fontSize: "20px", color: text, fontWeight: "bold", margin: "0 0 6px" },
  tierDesc:       { fontSize: "11px", color: textMuted, margin: "0 0 16px", lineHeight: 1.5 },
  tierBtn:        { display: "block", padding: "11px", borderRadius: "8px", color: white, fontWeight: "bold", fontSize: "12px", textDecoration: "none", cursor: "pointer" },
  paywallNote:    { textAlign: "center", color: textMuted, fontSize: "13px" },
  goldLink:       { color: purple, fontWeight: "bold", textDecoration: "none" },
  btnGold:    { background: `linear-gradient(135deg, ${purple}, ${purpleLight})`, color: white, border: "none", padding: "14px 28px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnOutline: { background: white, color: purple, border: `2px solid ${purple}`, padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  backBtn:    { background: white, border: `1.5px solid ${purpleBorder}`, color: purple, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "Georgia, serif", fontWeight: "bold" },
};

// ============================================================
// CELEBRATION CAPTIONS
// ============================================================
const CAPTIONS = (sectionId: number, sectionTitle: string, score: number) => [
  `🏆 DAY ${sectionId} DONE! I just completed Session ${sectionId} of 99 in the Z2B Entrepreneurial Consumer Workshop — scoring ${score}/5 on "${sectionTitle}"!\n\nI'm learning how to turn my monthly expenses into income-generating assets — WITHOUT quitting my job.\n\n🔥 Do you know that your household spending could be building your legacy?\n\n👇 Start YOUR free 9-day workshop right now:\napp.z2blegacybuilders.co.za/workshop\n\n#Z2BTable #EntrepreneurialConsumer #Legacy #Zero2Billionaires #BuildYourTable`,
  `💜 I just finished Day ${sectionId} of my 99-session transformation journey!\n\nSection: "${sectionTitle}" ✅\nScore: ${score}/5 🎯\n\nRev Mokoro Manana is teaching me that I don't need to quit my job to start building wealth. I just need to consume SMARTER.\n\nChallenge: Can you complete 9 FREE sections this week? 🙌\n👉 app.z2blegacybuilders.co.za/workshop\n\n#Z2BLegacyBuilders #EmployeeToOwner #PullUpYourChair`,
  `🎓 Session ${sectionId} COMPLETE! "${sectionTitle}" — ${score}/5 score!\n\nHonestly, I didn't know I was already sitting on assets. My salary. My network. My spending habits. All of it can be redirected.\n\nThis workshop is FREE for the first 9 sessions. I dare you to start today.\n\n🔗 app.z2blegacybuilders.co.za/workshop\n\nTag someone who needs to hear this 👇\n\n#Z2BTable #ConsumerToBuilder #LegacyMindset #SouthAfrica`,
];

// ============================================================
// AUDIO PLAYER COMPONENT
// ============================================================
interface AudioPlayerProps {
  text: string;
  sectionTitle: string;
}

function AudioPlayer({ text, sectionTitle }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isPaused, setIsPaused]     = useState(false);
  const [progress, setProgress]     = useState(0);
  const [voiceReady, setVoiceReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef    = useRef<string[]>([]);
  const chunkIdxRef  = useRef(0);
  const totalChunks  = useRef(0);

  const cleanText = useCallback((raw: string) => {
    return raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n\n/g, ". ")
      .replace(/\n/g, " ")
      .trim();
  }, []);

  const splitChunks = useCallback((str: string): string[] => {
    const sentences = str.match(/[^.!?]+[.!?]+/g) ?? [str];
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > 220) { if (current) chunks.push(current.trim()); current = s; }
      else current += " " + s;
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }, []);

  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setVoiceReady(voices.length > 0);
      }
    };
    check();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = check;
    }
    return () => { stopSpeech(); };
  }, []);

  const pickVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined") return null;
    const voices = window.speechSynthesis.getVoices();
    const priority = [
      (v: SpeechSynthesisVoice) => v.lang === "en-ZA" && v.name.toLowerCase().includes("male"),
      (v: SpeechSynthesisVoice) => v.lang === "en-ZA",
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en") && v.name.toLowerCase().match(/david|james|daniel|george|mark|john|guy|oliver/) !== null,
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en-GB"),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
    ];
    for (const fn of priority) {
      const found = voices.find(fn);
      if (found) return found;
    }
    return voices[0] ?? null;
  };

  const speakChunk = useCallback((chunks: string[], idx: number) => {
    if (idx >= chunks.length) {
      setIsPlaying(false); setIsPaused(false); setProgress(100);
      return;
    }
    const utter = new SpeechSynthesisUtterance(chunks[idx]);
    utter.rate  = 0.88;
    utter.pitch = 0.82;
    utter.volume = 1;
    const v = pickVoice();
    if (v) utter.voice = v;
    utter.onend = () => {
      chunkIdxRef.current = idx + 1;
      setProgress(Math.round(((idx + 1) / totalChunks.current) * 100));
      speakChunk(chunks, idx + 1);
    };
    utter.onerror = () => { setIsPlaying(false); };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const stopSpeech = () => {
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    setIsPlaying(false); setIsPaused(false); setProgress(0);
    chunkIdxRef.current = 0;
  };

  const handlePlay = () => {
    if (typeof window === "undefined") return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true); setIsPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleaned = cleanText(text);
    const chunks  = splitChunks(cleaned);
    chunksRef.current  = chunks;
    totalChunks.current = chunks.length;
    chunkIdxRef.current = 0;
    setIsPlaying(true); setIsPaused(false); setProgress(0);
    speakChunk(chunks, 0);
  };

  const handlePause = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.pause();
    setIsPlaying(false); setIsPaused(true);
  };

  const handleStop = () => { stopSpeech(); };

  return (
    <div style={AS.wrap}>
      <div style={AS.header}>
        <span style={AS.mic}>🎙️</span>
        <div>
          <div style={AS.title}>Audio Reader</div>
          <div style={AS.sub}>{sectionTitle}</div>
        </div>
        {!voiceReady && <span style={AS.warn}>⚠️ Loading voices…</span>}
      </div>
      <div style={AS.progressWrap}>
        <div style={{ ...AS.progressFill, width: `${progress}%` }} />
      </div>
      <div style={AS.progressLabel}>{progress}% read</div>
      <div style={AS.controls}>
        {!isPlaying && !isPaused && (
          <button style={AS.btnPlay} onClick={handlePlay} disabled={!voiceReady} title="Play">▶ Play</button>
        )}
        {isPlaying && (
          <button style={AS.btnPause} onClick={handlePause} title="Pause">⏸ Pause</button>
        )}
        {isPaused && (
          <button style={AS.btnPlay} onClick={handlePlay} title="Resume">▶ Resume</button>
        )}
        {(isPlaying || isPaused || progress > 0) && (
          <button style={AS.btnStop} onClick={handleStop} title="Stop">⏹ Stop</button>
        )}
        <span style={AS.voiceTag}>🇿🇦 SA Male Voice</span>
      </div>
      {isPlaying && (
        <div style={AS.waveWrap}>
          {[1,2,3,4,5,6,7,8].map((n) => (
            <div key={n} style={{ ...AS.wave, animationDelay: `${n * 0.12}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

const AS: Record<string, CSSProperties> = {
  wrap:         { background: "#1E1B2E", border: "1.5px solid #6B21A8", borderRadius: "14px", padding: "20px 24px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto" },
  header:       { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  mic:          { fontSize: "28px" },
  title:        { fontSize: "14px", fontWeight: "bold", color: "#C4B5FD", letterSpacing: "1px" },
  sub:          { fontSize: "11px", color: "#9CA3AF", marginTop: "2px" },
  warn:         { fontSize: "11px", color: "#FCD34D", marginLeft: "auto" },
  progressWrap: { height: "6px", background: "#2a2a3a", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #6B21A8, #9333EA)", borderRadius: "3px", transition: "width 0.4s" },
  progressLabel:{ fontSize: "11px", color: "#6B7280", marginBottom: "14px" },
  controls:     { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  btnPlay:      { background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnPause:     { background: "#374151", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnStop:      { background: "transparent", color: "#9CA3AF", border: "1px solid #374151", padding: "9px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" },
  voiceTag:     { marginLeft: "auto", fontSize: "11px", color: "#C4B5FD", background: "#2a1a3a", padding: "4px 10px", borderRadius: "20px", border: "1px solid #6B21A8" },
  waveWrap:     { display: "flex", alignItems: "flex-end", gap: "4px", marginTop: "12px", height: "28px" },
  wave:         { width: "4px", background: "#9333EA", borderRadius: "2px", animation: "wave 0.8s ease-in-out infinite alternate", height: "100%" },
};

// ============================================================
// SHARE CELEBRATION CARD COMPONENT
// ============================================================
interface ShareCardProps {
  sectionId: number;
  sectionTitle: string;
  score: number;
  builderRef: string | null;
  onClose: () => void;
}

function ShareCard({ sectionId, sectionTitle, score, builderRef, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>("");

  const captions = CAPTIONS(sectionId, sectionTitle, score);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = 1080;
    canvas.height = 1080;

    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0,   "#3b0764");
    grad.addColorStop(0.5, "#6B21A8");
    grad.addColorStop(1,   "#1e1b4b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#C4B5FD";
    ctx.beginPath(); ctx.arc(900, 150, 280, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(100, 950, 220, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    const r = 40, x = 140, y = 140, w = 800, h = 800;
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#E9D5FF";
    ctx.font      = "bold 52px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Z2B TABLE BANQUET", 540, 230);

    ctx.font      = "120px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🏆", 540, 400);

    ctx.fillStyle = "#F5F3FF";
    ctx.font      = "bold 56px Arial";
    ctx.fillText(`SECTION ${sectionId} COMPLETE!`, 540, 490);

    ctx.fillStyle = "#C4B5FD";
    ctx.font      = "36px Arial";
    const maxW = 700;
    const words = sectionTitle.split(" ");
    let line = "";
    let lineY = 560;
    for (const word of words) {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, 540, lineY);
        line = word; lineY += 44;
      } else line = test;
    }
    ctx.fillText(line, 540, lineY);

    const starY = lineY + 80;
    ctx.font = "64px Arial";
    const stars = score === 5 ? "⭐⭐⭐⭐⭐" : score >= 3 ? "⭐⭐⭐" : "⭐⭐";
    ctx.fillText(stars, 540, starY);

    ctx.fillStyle = "#FDE68A";
    ctx.font      = "bold 48px Arial";
    ctx.fillText(`${score}/5 SCORE`, 540, starY + 70);

    ctx.fillStyle = "#D97706";
    ctx.beginPath(); ctx.roundRect(390, starY + 100, 300, 60, 30); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font      = "bold 28px Arial";
    ctx.fillText(`Day ${sectionId} of 99 Completed`, 540, starY + 138);

    ctx.fillStyle = "#A78BFA";
    ctx.font      = "24px Arial";
    ctx.fillText(
      builderRef
        ? `app.z2blegacybuilders.co.za/workshop?ref=${builderRef}`
        : "app.z2blegacybuilders.co.za/workshop",
      540, 1000
    );

    setImgUrl(canvas.toDataURL("image/png"));
  }, [sectionId, sectionTitle, score]);

  const shareUrl  = builderRef
    ? `https://app.z2blegacybuilders.co.za/workshop?ref=${builderRef}`
    : `https://app.z2blegacybuilders.co.za/workshop`;
  const caption   = captions[captionIdx];
  const encoded   = encodeURIComponent(caption + "\n\n" + shareUrl);

  const copyCaption = () => {
    navigator.clipboard.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const downloadCard = () => {
    const a = document.createElement("a");
    a.href     = imgUrl;
    a.download = `Z2B-Section-${sectionId}-Complete.png`;
    a.click();
  };

  return (
    <div style={SC.overlay}>
      <div style={SC.modal}>
        <button style={SC.closeBtn} onClick={onClose}>✕</button>
        <h2 style={SC.heading}>🎉 Share Your Win!</h2>
        <p style={SC.subheading}>Challenge your friends to start their FREE workshop journey</p>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {imgUrl && (
          <div style={SC.cardPreviewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt="Share card" style={SC.cardPreview} />
          </div>
        )}
        <button style={SC.downloadBtn} onClick={downloadCard}>⬇️ Download Card (PNG)</button>
        <p style={SC.downloadNote}>Save the card, then post it with the caption below</p>
        <div style={SC.captionTabs}>
          {captions.map((_, i) => (
            <button key={i} style={{ ...SC.captionTab, ...(captionIdx === i ? SC.captionTabActive : {}) }} onClick={() => setCaptionIdx(i)}>
              Caption {i + 1}
            </button>
          ))}
        </div>
        <div style={SC.captionBox}>
          <p style={SC.captionText}>{caption}</p>
          <button style={SC.copyBtn} onClick={copyCaption}>{copied ? "✅ Copied!" : "📋 Copy Caption"}</button>
        </div>
        <p style={SC.shareLabel}>Quick Share (opens app with caption):</p>
        <div style={SC.shareBtns}>
          <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#25D366" }}>
            <span style={SC.shareIcon}>💬</span> WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#1877F2" }}>
            <span style={SC.shareIcon}>📘</span> Facebook
          </a>
          <a href={`https://www.tiktok.com/`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#010101", border: "1px solid #69C9D0" }} title="Download card & caption, then post on TikTok">
            <span style={SC.shareIcon}>🎵</span> TikTok
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encoded}`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#000" }}>
            <span style={SC.shareIcon}>𝕏</span> X / Twitter
          </a>
        </div>
        <p style={SC.tiktokNote}>📱 For TikTok: download the card, open TikTok → New Post → select image → paste caption</p>
      </div>
    </div>
  );
}

const SC: Record<string, CSSProperties> = {
  overlay:        { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" },
  modal:          { background: "#fff", borderRadius: "20px", padding: "28px 24px", maxWidth: "560px", width: "100%", position: "relative", maxHeight: "95vh", overflowY: "auto" },
  closeBtn:       { position: "absolute", top: "16px", right: "16px", background: "#F3E8FF", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", color: "#6B21A8", fontWeight: "bold" },
  heading:        { fontSize: "22px", fontWeight: "bold", color: "#6B21A8", textAlign: "center", margin: "0 0 6px" },
  subheading:     { fontSize: "13px", color: "#6B7280", textAlign: "center", margin: "0 0 20px" },
  cardPreviewWrap:{ borderRadius: "12px", overflow: "hidden", border: "2px solid #C4B5FD", marginBottom: "12px", textAlign: "center" },
  cardPreview:    { width: "100%", maxWidth: "360px", height: "auto", display: "block", margin: "0 auto" },
  downloadBtn:    { width: "100%", background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", marginBottom: "6px", fontFamily: "Georgia, serif" },
  downloadNote:   { fontSize: "11px", color: "#9CA3AF", textAlign: "center", margin: "0 0 16px" },
  captionTabs:    { display: "flex", gap: "8px", marginBottom: "10px" },
  captionTab:     { flex: 1, padding: "8px", borderRadius: "8px", border: "1.5px solid #C4B5FD", background: "#F3E8FF", color: "#6B21A8", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  captionTabActive:{ background: "#6B21A8", color: "#fff", borderColor: "#6B21A8" },
  captionBox:     { background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: "10px", padding: "14px", marginBottom: "16px" },
  captionText:    { fontSize: "12px", color: "#374151", lineHeight: 1.7, margin: "0 0 10px", whiteSpace: "pre-line" },
  copyBtn:        { background: "#6B21A8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" },
  shareLabel:     { fontSize: "12px", color: "#6B7280", fontWeight: "bold", margin: "0 0 8px" },
  shareBtns:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" },
  shareBtn:       { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "10px", color: "#fff", fontWeight: "bold", fontSize: "13px", textDecoration: "none", border: "none" },
  shareIcon:      { fontSize: "18px" },
  tiktokNote:     { fontSize: "11px", color: "#9CA3AF", textAlign: "center", lineHeight: 1.5 },
};


// ============================================================
// WELCOME OVERLAY — shown to prospects arriving via referral link
// ============================================================
interface WelcomeOverlayProps {
  builderName: string;
  builderRef: string;
  sectionId: number;
  sectionTitle: string;
  onClose: () => void;
}

function WelcomeOverlay({ builderName, builderRef, sectionId, sectionTitle, onClose }: WelcomeOverlayProps) {
  const [step, setStep]           = useState<"welcome" | "contact" | "thanks">("welcome");
  const [name, setName]           = useState("");
  const [whatsapp, setWhatsapp]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const handleContactNow = async () => {
    if (!name.trim() || !whatsapp.trim()) { setError("Please enter your name and WhatsApp number."); return; }
    setSaving(true); setError("");
    try {
      // Look up builder_id from referral code
      const { data: builderData } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", builderRef)
        .single();

      await supabase.from("prospect_notifications").insert({
        builder_id:        builderData?.id ?? null,
        builder_ref:       builderRef,
        prospect_name:     name.trim(),
        prospect_whatsapp: whatsapp.trim(),
        section_id:        sectionId,
        section_title:     sectionTitle,
        status:            "new",
        read:              false,
      });
      setStep("thanks");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Inject 3D text animation
  useEffect(() => {
    const styleId = "z2b-welcome-3d";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes float3d {
          0%   { transform: perspective(600px) rotateX(0deg) translateY(0px); }
          50%  { transform: perspective(600px) rotateX(6deg) translateY(-8px); }
          100% { transform: perspective(600px) rotateX(0deg) translateY(0px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes pulse3d {
          0%,100% { text-shadow: 0 4px 8px rgba(107,33,168,0.4), 0 0 20px rgba(147,51,234,0.3); }
          50%     { text-shadow: 0 8px 20px rgba(107,33,168,0.7), 0 0 40px rgba(147,51,234,0.6); }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1);   }
          25%     { transform: scale(1.3); }
          50%     { transform: scale(1);   }
          75%     { transform: scale(1.15);}
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={WO.overlay}>
      <div style={WO.modal}>

        {step === "welcome" && (
          <>
            {/* 3D Floating Title */}
            <div style={WO.titleWrap}>
              <div style={WO.title3d}>Welcome to Abundance</div>
              <div style={WO.heart}>❤️</div>
            </div>

            {/* Builder invite message */}
            <div style={WO.inviteBox}>
              <p style={WO.inviteLabel}>You have been personally invited by</p>
              <p style={WO.builderName}>🏆 {builderName}</p>
              <p style={WO.inviteSub}>to experience the Z2B Entrepreneurial Consumer Workshop — FREE for your first 9 sessions.</p>
            </div>

            {/* Decorative divider */}
            <div style={WO.divider} />

            <p style={WO.question}>Would you like <strong>{builderName.split(" ")[0]}</strong> to contact you?</p>

            <div style={WO.btnRow}>
              <button style={WO.btnYes} onClick={() => setStep("contact")}>
                ✋ Contact Me Now
              </button>
              <button style={WO.btnLater} onClick={onClose}>
                🎓 Maybe Later — Start Workshop
              </button>
            </div>
            <p style={WO.footNote}>Your referral link is saved. {builderName.split(" ")[0]} will still get credit if you join later.</p>
          </>
        )}

        {step === "contact" && (
          <>
            <div style={WO.titleWrap}>
              <div style={{ ...WO.title3d, fontSize: "22px" }}>Leave Your Details ✍️</div>
            </div>
            <p style={WO.inviteSub}><strong>{builderName.split(" ")[0]}</strong> will reach out to you on WhatsApp.</p>

            {error && <p style={WO.error}>{error}</p>}

            <div style={WO.formGroup}>
              <label style={WO.label}>Your Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thabo Nkosi"
                style={WO.input}
              />
            </div>
            <div style={WO.formGroup}>
              <label style={WO.label}>Your WhatsApp Number *</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 0821234567"
                style={WO.input}
              />
            </div>

            <div style={WO.btnRow}>
              <button style={WO.btnYes} onClick={handleContactNow} disabled={saving}>
                {saving ? "Sending..." : "✅ Send My Details"}
              </button>
              <button style={WO.btnLater} onClick={onClose}>
                Cancel — Start Workshop
              </button>
            </div>
          </>
        )}

        {step === "thanks" && (
          <>
            <div style={WO.titleWrap}>
              <div style={{ ...WO.title3d, fontSize: "24px" }}>You're All Set! 🎉</div>
              <div style={WO.heart}>❤️</div>
            </div>
            <p style={{ textAlign: "center", color: "#374151", fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
              <strong>{builderName.split(" ")[0]}</strong> has been notified and will contact you soon on WhatsApp.<br /><br />
              In the meantime, enjoy your <strong>FREE 9-section workshop</strong>!
            </p>
            <button style={{ ...WO.btnYes, width: "100%" }} onClick={onClose}>
              🎓 Start My Workshop Now
            </button>
          </>
        )}

      </div>
    </div>
  );
}

// Welcome Overlay Styles
const WO: Record<string, CSSProperties> = {
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal:       { background: "#fff", borderRadius: "24px", padding: "36px 28px", maxWidth: "480px", width: "100%", animation: "slideDown 0.5s ease-out", boxShadow: "0 24px 60px rgba(107,33,168,0.35)" },
  titleWrap:   { textAlign: "center", marginBottom: "20px" },
  title3d:     { fontSize: "30px", fontWeight: "bold", color: "#6B21A8", fontFamily: "Georgia, serif", animation: "float3d 3s ease-in-out infinite, pulse3d 3s ease-in-out infinite", display: "inline-block", letterSpacing: "1px", textShadow: "0 4px 8px rgba(107,33,168,0.4), 2px 2px 0px #C4B5FD, 4px 4px 0px rgba(107,33,168,0.2)" },
  heart:       { fontSize: "36px", display: "block", animation: "heartbeat 1.5s ease-in-out infinite", marginTop: "8px" },
  inviteBox:   { background: "linear-gradient(135deg, #F3E8FF, #EDE9FE)", border: "2px solid #C4B5FD", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" },
  inviteLabel: { fontSize: "12px", color: "#7C3AED", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px" },
  builderName: { fontSize: "24px", fontWeight: "bold", color: "#3B0764", margin: "0 0 10px", fontFamily: "Georgia, serif" },
  inviteSub:   { fontSize: "13px", color: "#6B7280", lineHeight: 1.7, margin: 0, textAlign: "center" },
  divider:     { height: "1px", background: "linear-gradient(90deg, transparent, #C4B5FD, transparent)", margin: "20px 0" },
  question:    { textAlign: "center", fontSize: "15px", color: "#374151", marginBottom: "20px", lineHeight: 1.6 },
  btnRow:      { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" },
  btnYes:      { background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "14px 24px", borderRadius: "12px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnLater:    { background: "#F9FAFB", color: "#6B7280", border: "1.5px solid #E5E7EB", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" },
  footNote:    { textAlign: "center", fontSize: "11px", color: "#9CA3AF", lineHeight: 1.6 },
  formGroup:   { marginBottom: "16px" },
  label:       { display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "6px" },
  input:       { width: "100%", padding: "12px 14px", border: "1.5px solid #C4B5FD", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" },
  error:       { background: "#FEE2E2", color: "#DC2626", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px", textAlign: "center" },
};


// ============================================================
// HOME VIEW
// ============================================================
function HomeView({ setView, completedCount, freeCompleted }: HomeViewProps) {
  void freeCompleted;

  const progressPct = Math.round((completedCount / 99) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0D0A1E 0%, #1E1B4B 45%, #2D1B69 70%, #0A0818 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Georgia, serif",
      position: "relative",
      overflow: "hidden",
      paddingBottom: "60px",
    }}>

      {/* ── decorative glows ── */}
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(147,51,234,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* ── Top nav bar ── */}
      <div style={{
        width: "100%",
        background: "rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(212,175,55,0.2)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(8px)",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px", fontWeight: "bold", color: "#D4AF37", letterSpacing: "4px" }}>Z2B</span>
          <span style={{ fontSize: "10px", color: "rgba(212,175,55,0.6)", letterSpacing: "3px", textTransform: "uppercase" }}>TABLE BANQUET</span>
        </div>
        <a
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "8px", padding: "7px 16px",
            color: "#fff", fontSize: "12px", fontWeight: "bold",
            textDecoration: "none", fontFamily: "Georgia, serif",
            transition: "all 0.2s",
          }}
        >
          🏠 App Home
        </a>
      </div>

      {/* ── Hero content ── */}
      <div style={{ maxWidth: "640px", width: "100%", padding: "48px 24px 0", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Gold top rule */}
        <div style={{ width: "60px", height: "3px", background: "linear-gradient(90deg, #D4AF37, #F5D060)", borderRadius: "2px", margin: "0 auto 24px" }} />

        <h1 style={{
          fontSize: "clamp(22px, 5vw, 34px)",
          fontWeight: "bold", color: "#fff",
          margin: "0 0 12px", lineHeight: 1.3,
          textShadow: "0 2px 20px rgba(212,175,55,0.2)",
        }}>
          The Entrepreneurial Consumer Workshop
        </h1>

        <p style={{ fontSize: "15px", color: "rgba(196,181,253,0.85)", fontStyle: "italic", margin: "0 0 6px", lineHeight: 1.7 }}>
          How Employees Turn Monthly Expenses Into Income-Generating Assets
        </p>
        <p style={{ fontSize: "12px", color: "#D4AF37", margin: "0 0 36px", fontWeight: "bold", letterSpacing: "0.5px" }}>
          — Rev Mokoro Manana · Founder, Z2B Legacy Builders
        </p>

        {/* ── Stats row ── */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(212,175,55,0.25)",
          borderRadius: "16px", padding: "20px 24px",
          marginBottom: "32px",
          backdropFilter: "blur(10px)",
        }}>
          {[
            { num: "99", label: "Sessions" },
            { num: "9",  label: "Free Days" },
            { num: String(completedCount), label: "Completed" },
          ].map((stat, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "32px", fontWeight: "bold", color: "#D4AF37" }}>{stat.num}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>{stat.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ width: "1px", height: "44px", background: "rgba(212,175,55,0.25)" }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Progress bar ── */}
        {completedCount > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "rgba(196,181,253,0.7)" }}>Your Progress</span>
              <span style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "bold" }}>{progressPct}%</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #D4AF37, #F5D060)", borderRadius: "3px", transition: "width 0.6s" }} />
            </div>
          </div>
        )}

        {/* ── Primary CTA buttons ── */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "16px", flexWrap: "wrap" }}>
          <button
            onClick={() => setView("workshop")}
            style={{
              background: "linear-gradient(135deg, #4C1D95, #7C3AED)",
              color: "#F5D060", border: "1.5px solid #D4AF37",
              padding: "14px 28px", borderRadius: "12px",
              fontWeight: "bold", fontSize: "15px", cursor: "pointer",
              fontFamily: "Georgia, serif",
              boxShadow: "0 4px 20px rgba(76,29,149,0.4)",
            }}
          >
            🏛️ Enter Workshop
          </button>
          <button
            onClick={() => setView("workshop")}
            style={{
              background: "transparent", color: "#D4AF37",
              border: "1.5px solid rgba(212,175,55,0.5)",
              padding: "14px 28px", borderRadius: "12px",
              fontWeight: "bold", fontSize: "15px", cursor: "pointer",
              fontFamily: "Georgia, serif",
            }}
          >
            🎁 Start Free (9 Sessions)
          </button>
        </div>

        {/* ── Secondary nav buttons ── */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "32px" }}>
          <a href="/dashboard" style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            padding: "10px 18px", borderRadius: "10px", color: "#DDD6FE",
            fontWeight: "bold", fontSize: "13px", textDecoration: "none", fontFamily: "Georgia, serif",
          }}>📊 Dashboard</a>
          <a href="/vision-board" style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)",
            padding: "10px 18px", borderRadius: "10px", color: "#F5D060",
            fontWeight: "bold", fontSize: "13px", textDecoration: "none", fontFamily: "Georgia, serif",
          }}>🏆 Vision Board</a>
          <a href="/pricing" style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
            padding: "10px 18px", borderRadius: "10px", color: "#C4B5FD",
            fontWeight: "bold", fontSize: "13px", textDecoration: "none", fontFamily: "Georgia, serif",
          }}>⬆️ Upgrade</a>
          <a href="/my-funnel" style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
            padding: "10px 18px", borderRadius: "10px", color: "#6EE7B7",
            fontWeight: "bold", fontSize: "13px", textDecoration: "none", fontFamily: "Georgia, serif",
          }}>🎯 My Funnel</a>
        </div>

        {/* ── T.E.E.E pills ── */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          {["Transform", "Educate", "Empower", "Enrich"].map((t) => (
            <span key={t} style={{
              background: "rgba(255,255,255,0.06)",
              color: "#C4B5FD", border: "1.5px solid rgba(196,181,253,0.25)",
              padding: "7px 16px", borderRadius: "20px",
              fontSize: "12px", letterSpacing: "1px", fontWeight: "bold",
            }}>{t}</span>
          ))}
        </div>

        {/* ── App Home CTA ── */}
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #D4AF37, #B8860B)",
            color: "#000", border: "none",
            padding: "14px 32px", borderRadius: "12px",
            fontWeight: "bold", fontSize: "15px",
            textDecoration: "none", fontFamily: "Georgia, serif",
            boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
            marginBottom: "24px",
          }}
        >
          🏠 Go to Full App Home
        </a>

        {/* ── Footer ── */}
        <div style={{ borderTop: "1px solid rgba(212,175,55,0.15)", paddingTop: "20px" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
            app.z2blegacybuilders.co.za · Zero2Billionaires Amavulandlela Pty Ltd
          </p>
          <p style={{ fontSize: "11px", color: "rgba(212,175,55,0.35)", margin: "4px 0 0", fontStyle: "italic" }}>
            #Reka_Obesa_Okatuka
          </p>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// PAYWALL VIEW
// ============================================================
function PaywallView({ setView }: PaywallViewProps) {
  const tiers: Tier[] = [
    { name: "FAM",      price: "R0",         desc: "Free — 9 Sessions only",         color: "#9CA3AF", bg: "#F9FAFB", cta: "Start Free"  },
    { name: "BUILDER",  price: "R297/mo",    desc: "Sessions 1–30 + Community",      color: "#7C3AED", bg: "#EDE9FE", cta: "Join Builder" },
    { name: "LEADER",   price: "R797/mo",    desc: "Sessions 1–60 + Coaching",       color: "#6B21A8", bg: "#F3E8FF", cta: "Join Leader"  },
    { name: "LEGACY",   price: "R1,497/mo",  desc: "All 99 Sessions + Mentorship",   color: "#D97706", bg: "#FEF3C7", cta: "Join Legacy"  },
    { name: "PLATINUM", price: "R4,980/mo",  desc: "Full System + Diamond Path",     color: "#4F46E5", bg: "#EEF2FF", cta: "Go Platinum"  },
  ];
  return (
    <div style={S.paywallPage}>
      <div style={S.paywallInner}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button style={S.backBtn} onClick={() => setView("home")}>← Workshop</button>
          <button style={S.backBtn} onClick={() => setView("workshop")}>← Workshop</button>
        </div>
        <h1 style={S.paywallTitle}>🔒 Members-Only Content</h1>
        <p style={S.paywallSub}>Sessions 10–99 require a paid membership. You&apos;ve completed the free preview — now pull up your chair and own your table.</p>
        <div style={S.tierGrid}>
          {tiers.map((t) => (
            <div key={t.name} style={{ ...S.tierCard, borderColor: t.color, background: t.bg }}>
              <div style={{ ...S.tierName, color: t.color }}>{t.name}</div>
              <div style={S.tierPrice}>{t.price}</div>
              <div style={S.tierDesc}>{t.desc}</div>
              <a
                href={`https://app.z2blegacybuilders.co.za/register?tier=${t.name.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...S.tierBtn, background: t.color }}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <a
            href="https://app.z2blegacybuilders.co.za/pricing"
            style={{ display: "inline-block", background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", padding: "14px 36px", borderRadius: "14px", fontWeight: "bold", fontSize: "16px", textDecoration: "none", fontFamily: "Georgia, serif", boxShadow: "0 6px 20px rgba(107,33,168,0.35)" }}
          >
            ⬆️ View All Pricing Plans →
          </a>
        </div>
        <p style={S.paywallNote}>
          Already a member?{" "}
          <a href="https://app.z2blegacybuilders.co.za/login" style={S.goldLink}>Login here →</a>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
// ── COACH MANLAW VOICE COMPONENT ──
function ManlawVoice({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused]     = useState(false);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 0.92;
    utterance.pitch = 1.0;
    // Pick a deep male voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes("david") ||
      v.name.toLowerCase().includes("james") ||
      v.name.toLowerCase().includes("daniel") ||
      v.name.toLowerCase().includes("male")
    );
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend   = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {!speaking ? (
        <button
          onClick={speak}
          style={{
            background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: "20px", padding: "4px 12px", color: "#D4AF37",
            fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          🔊 Listen
        </button>
      ) : (
        <>
          {paused ? (
            <button onClick={resume} style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "4px 12px", color: "#D4AF37", fontSize: "11px", cursor: "pointer" }}>
              ▶ Resume
            </button>
          ) : (
            <button onClick={pause} style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "4px 12px", color: "#D4AF37", fontSize: "11px", cursor: "pointer" }}>
              ⏸ Pause
            </button>
          )}
          <button onClick={stop} style={{ background: "rgba(255,100,100,0.15)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "20px", padding: "4px 12px", color: "#FF6464", fontSize: "11px", cursor: "pointer" }}>
            ⏹ Stop
          </button>
        </>
      )}
    </div>
  );
}

// ── SESSION 8 — OBJECTION DISSOLVER ─────────────────────────
function ObjectionDissolver({ firstName }: { firstName: string }) {
  const [activeObj, setActiveObj] = React.useState<number | null>(null);
  const [dissolved, setDissolved] = React.useState<Record<number, boolean>>({});

  const objections = [
    {
      fear: "Is this a pyramid scheme?",
      icon: "🔺",
      color: "#EF4444",
      reality: "A pyramid scheme pays people to recruit — with no real product or value exchanged. It is illegal in South Africa. Network Marketing is a legal distribution model regulated by the Consumer Protection Act. The difference is simple: real products, real customers, real value. Z2B distributes products people already buy. No product = pyramid. Real product = legitimate business vehicle.",
      truth: "You were right to ask. Discernment is a builder's first skill. Now you know the difference.",
    },
    {
      fear: "I don't want to sell to my friends and family.",
      icon: "😬",
      color: "#F97316",
      reality: "You are not being asked to sell to friends. You are being equipped to share a solution with people who already have a problem. There is a difference between pestering and positioning. When you understand the Z2B model, you don't chase — you attract. People come to you because your life is changing. That is not selling. That is testimony.",
      truth: "The best builders never feel like salespeople. They feel like people who found something valuable and couldn't keep quiet.",
    },
    {
      fear: "I tried something like this before and it didn't work.",
      icon: "💔",
      color: "#9333EA",
      reality: "Most people who tried and failed did so without: proper education before execution, a community for support, a clear identity as an Entrepreneurial Consumer, and a structured 99-session journey. They were handed a product and told to hustle. Z2B does the opposite — it builds you first. The vehicle did not fail you. The system around the vehicle was missing.",
      truth: firstName + ", this is not a retry. This is a rebuild — from the foundation up.",
    },
    {
      fear: "I don't have time.",
      icon: "⏰",
      color: "#0EA5E9",
      reality: "The Z2B model is designed for employed people with limited time. You do not need to quit your job. You do not need 8 hours a day. You need 30 focused minutes and a smartphone. The system works through duplication — meaning your network works even when you don't. Time is not the constraint. Clarity and consistency are.",
      truth: "The question is not whether you have time. It is whether what you are spending your time on is building anything.",
    },
    {
      fear: "I don't have money to start.",
      icon: "💸",
      color: "#22C55E",
      reality: "Sessions 1 to 9 are completely free. You are not asked for money to learn. When you are ready to upgrade, Z2B membership is a once-off lifetime investment of R480 — not a monthly subscription, not a recurring fee. You pay once and you are in for life. More importantly: Z2B is designed to generate income before it asks you to invest anything. You learn first. You earn first. Then you decide.",
      truth: "The first investment Z2B asks for is not money. It is attention. You are already investing it.",
    },
    {
      fear: "My family will think I've joined a cult.",
      icon: "🏠",
      color: "#D4AF37",
      reality: "This is one of the most common fears — and the most human. The answer is not to argue. It is to produce results. When your account has extra income, when your stress reduces, when your vision becomes clear — the conversation changes. Don't recruit your family. Let your transformation recruit them. Z2B is a kingdom business. It is built on integrity, education, and stewardship — not hype.",
      truth: "Your greatest testimony will not be what you say about Z2B. It will be what Z2B does through you.",
    },
  ];

  const dissolvedCount = Object.values(dissolved).filter(Boolean).length;

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0010, #0D0020)",
      border: "2px solid #EF4444", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FCA5A5", marginBottom: "4px" }}>
        🛡️ The Fear Audit — Every Objection Dissolved
      </div>
      <div style={{ fontSize: "13px", color: "rgba(252,165,165,0.6)", marginBottom: "6px", lineHeight: 1.6 }}>
        {firstName}, these are the six fears that stop most people from ever starting. Tap each one. Read the reality. Then decide from truth — not fear.
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
        {dissolvedCount}/6 fears dissolved
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {objections.map((obj, i) => {
          const isOpen = activeObj === i;
          const isDone = dissolved[i];
          return (
            <div key={i} style={{
              background: isDone ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${isDone ? "rgba(34,197,94,0.4)" : isOpen ? obj.color : "rgba(255,255,255,0.08)"}`,
              borderRadius: "12px", overflow: "hidden", transition: "all 0.2s",
            }}>
              {/* Header */}
              <div
                onClick={() => setActiveObj(isOpen ? null : i)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "20px" }}>{isDone ? "✅" : obj.icon}</span>
                <span style={{
                  fontSize: "14px", fontWeight: "bold", flex: 1,
                  color: isDone ? "#22C55E" : "#fff",
                }}>
                  {obj.fear}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{
                    background: "rgba(0,0,0,0.3)", borderRadius: "10px",
                    padding: "14px", marginBottom: "12px",
                    borderLeft: `3px solid ${obj.color}`,
                  }}>
                    <div style={{ fontSize: "11px", color: obj.color, fontWeight: "bold", letterSpacing: "1px", marginBottom: "8px" }}>
                      THE REALITY
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                      {obj.reality}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "13px", color: "#D4AF37", fontStyle: "italic",
                    marginBottom: "12px", paddingLeft: "4px",
                  }}>
                    "{obj.truth}"
                  </div>
                  {!isDone && (
                    <button
                      onClick={() => { setDissolved(prev => ({ ...prev, [i]: true })); setActiveObj(null); }}
                      style={{
                        background: `linear-gradient(135deg, ${obj.color}99, ${obj.color})`,
                        color: "#fff", border: "none", borderRadius: "8px",
                        padding: "10px 20px", fontWeight: "bold", fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Fear Dissolved ✓
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dissolvedCount === 6 && (
        <div style={{
          marginTop: "20px", background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.4)",
          borderRadius: "12px", padding: "18px",
        }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22C55E", marginBottom: "8px" }}>
            {firstName}, all six fears are dissolved. 🛡️
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "10px" }}>
            You did not arrive at Session 8 by accident. Eight sessions of education have been building this moment.
            You now have clarity where there was confusion, and truth where there was fear.
            The last session is not another lesson — it is an invitation.
          </div>
          <div style={{ fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
            🔥 Session 9 — Your Circle of Twelve is waiting. The harvest is almost ready.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 9 — CIRCLE OF TWELVE ─────────────────────────────
function CircleOfTwelve({ firstName }: { firstName: string }) {
  const layers = [
    {
      key: "ignition",
      label: "Short-Term Destiny Helpers",
      range: "Start immediately",
      icon: "⚡",
      color: "#22C55E",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.35)",
      desc: "Ready to walk with you NOW. Ignition partners — they help you implement, share learning and break fear barriers.",
      count: 4,
    },
    {
      key: "strategic",
      label: "Medium-Term Strategic Builders",
      range: "1 to 3 years",
      icon: "🏗️",
      color: "#0EA5E9",
      bg: "rgba(14,165,233,0.08)",
      border: "rgba(14,165,233,0.35)",
      desc: "Carry complementary capabilities. You will launch structured collaborations and combine skills with these people.",
      count: 4,
    },
    {
      key: "covenant",
      label: "Long-Term Covenant Partners",
      range: "5 to 10 years",
      icon: "🤝",
      color: "#D4AF37",
      bg: "rgba(212,175,55,0.08)",
      border: "rgba(212,175,55,0.35)",
      desc: "Destiny alliances. Business partnerships, investment alliances, property and legacy ventures. These are your tribe.",
      count: 4,
    },
  ];

  const [names, setNames] = React.useState<Record<string, string[]>>({
    ignition:  ["", "", "", ""],
    strategic: ["", "", "", ""],
    covenant:  ["", "", "", ""],
  });
  const [revealed, setRevealed] = React.useState(false);
  const [harvestReady, setHarvestReady] = React.useState(false);

  const updateName = (layer: string, idx: number, val: string) => {
    setNames(prev => {
      const updated = [...prev[layer]];
      updated[idx] = val;
      return { ...prev, [layer]: updated };
    });
  };

  const filledCount = Object.values(names).flat().filter(n => n.trim().length > 1).length;
  const allTwelveFilled = filledCount === 12;

  const handleReveal = () => {
    if (!allTwelveFilled) return;
    setRevealed(true);
    // Store in localStorage for builder dashboard
    try {
      localStorage.setItem("z2b_circle_of_twelve", JSON.stringify(names));
    } catch(e) {}
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0A00, #1A0035)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "4px" }}>
        👑 Your Circle of Twelve
      </div>
      <div style={{ fontSize: "13px", color: "rgba(212,175,55,0.7)", marginBottom: "6px", lineHeight: 1.6 }}>
        {firstName}, before God gives a man land — He gives him people. Write 12 names across the three layers.
        Do not filter. Do not ask permission. Just write who comes to mind.
      </div>
      <div style={{
        fontSize: "12px", color: "rgba(255,255,255,0.4)",
        marginBottom: "20px", fontStyle: "italic",
      }}>
        "12 Tribes. 12 Disciples. 12 Foundations. Twelve is the number of organised expansion." — Z2B
      </div>

      {!revealed ? (
        <>
          {layers.map(layer => (
            <div key={layer.key} style={{
              background: layer.bg, border: `1.5px solid ${layer.border}`,
              borderRadius: "14px", padding: "16px", marginBottom: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px" }}>{layer.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: layer.color }}>{layer.label}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{layer.range}</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "12px", lineHeight: 1.6, paddingLeft: "30px" }}>
                {layer.desc}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[0,1,2,3].map(idx => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                      background: names[layer.key][idx].trim().length > 1 ? layer.color : "rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "bold", color: "#000",
                    }}>
                      {names[layer.key][idx].trim().length > 1 ? "✓" : idx + 1}
                    </div>
                    <input
                      type="text"
                      value={names[layer.key][idx]}
                      onChange={e => updateName(layer.key, idx, e.target.value)}
                      placeholder={`Name ${idx + 1}`}
                      style={{
                        flex: 1, background: "rgba(0,0,0,0.3)",
                        border: `1px solid ${names[layer.key][idx].trim().length > 1 ? layer.color : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "8px", padding: "8px 10px",
                        color: "#fff", fontSize: "13px", outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "3px",
                width: `${(filledCount / 12) * 100}%`,
                background: "linear-gradient(90deg, #22C55E, #D4AF37)",
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{ fontSize: "13px", color: "#D4AF37", fontWeight: "bold", minWidth: "40px" }}>
              {filledCount}/12
            </div>
          </div>

          <button
            onClick={handleReveal}
            disabled={!allTwelveFilled}
            style={{
              background: allTwelveFilled ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.08)",
              color: allTwelveFilled ? "#000" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "13px 32px",
              fontWeight: "bold", fontSize: "14px",
              cursor: allTwelveFilled ? "pointer" : "not-allowed",
            }}
          >
            {allTwelveFilled ? "👑 Seal My Circle →" : `${12 - filledCount} names remaining`}
          </button>
        </>
      ) : !harvestReady ? (
        // Circle sealed — harvest moment
        <div>
          <div style={{
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: "12px", padding: "20px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#D4AF37", marginBottom: "10px" }}>
              {firstName}, your Circle of Twelve is sealed. 👑
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {layers.map(layer => (
                <div key={layer.key} style={{
                  background: layer.bg, border: `1px solid ${layer.border}`,
                  borderRadius: "10px", padding: "12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>{layer.icon}</div>
                  <div style={{ fontSize: "11px", color: layer.color, fontWeight: "bold", marginBottom: "6px" }}>
                    {layer.label.split(" ").slice(0,2).join(" ")}
                  </div>
                  {names[layer.key].map((n, i) => (
                    <div key={i} style={{ fontSize: "12px", color: "#fff", padding: "2px 0" }}>
                      {n.trim() || "—"}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
              These 12 people are seeds. Some will grow with you immediately. Some will take years to understand
              what you are building. Some will surprise you. Your role is not to convince them —
              it is to remain consistent until your results do the convincing.
            </div>
          </div>

          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FCA5A5", marginBottom: "8px" }}>
              🔥 {firstName} — You Have Completed All 9 Free Sessions.
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
              You have done what most people never do. You sat down, learned, reflected, and built.
              You mapped your assets. You chose your identity. You built your vision. You dissolved your fears.
              You named your circle. The ground is not just broken — it is prepared.
            </div>
          </div>

          <button
            onClick={() => setHarvestReady(true)}
            style={{
              background: "linear-gradient(135deg, #7C2D12, #EF4444)",
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "14px 32px", fontWeight: "bold", fontSize: "15px",
              cursor: "pointer", width: "100%",
            }}
          >
            🔥 I Am Ready — Show Me The Next Step
          </button>
        </div>
      ) : (
        // HARVEST READY — final screen
        <div style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(147,51,234,0.1))",
          border: "2px solid #D4AF37", borderRadius: "12px", padding: "24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏆</div>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#D4AF37", marginBottom: "10px" }}>
            The Table Is Set, {firstName}.
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.9, marginBottom: "20px" }}>
            Nine sessions. Nine mirrors. Nine steps of preparation.<br />
            You are no longer a spectator of the economy — you are being positioned as a builder within it.<br /><br />
            The Z2B TABLE BANQUET continues beyond Session 9 — with 81 more sessions covering
            platform ownership, income streams, digital assets, leadership, and legacy.
            But first — the person who invited you to this table has been notified.
            They have walked this journey with you from the first session.
            Your next conversation with them will be different. You are ready.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a href="/vision-board" style={{
              display: "block", background: "linear-gradient(135deg, #B8860B, #D4AF37)",
              color: "#000", borderRadius: "10px", padding: "13px",
              fontWeight: "bold", fontSize: "14px", textDecoration: "none",
            }}>
              🏆 Complete My Vision Board
            </a>
            <a href="/pricing" style={{
              display: "block", background: "linear-gradient(135deg, #6B21A8, #9333EA)",
              color: "#fff", borderRadius: "10px", padding: "13px",
              fontWeight: "bold", fontSize: "14px", textDecoration: "none",
            }}>
              ⚡ Upgrade — Continue to Session 10
            </a>
          </div>
          <div style={{ marginTop: "16px", fontSize: "12px", color: "rgba(212,175,55,0.5)", fontStyle: "italic" }}>
            "You prepare a table before me in the presence of my enemies." — Psalm 23:5
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 7 — PERSONAL SWOT BUILDER ───────────────────────
function SwotBuilder({ firstName }: { firstName: string }) {
  const quadrants = [
    {
      key: "strengths", label: "STRENGTHS", icon: "💪", color: "#22C55E",
      bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.35)",
      prompt: "What do you do well? What have others praised you for? What skills has your job built in you?",
      placeholder: "e.g. I am consistent, good with people, I know how to manage a budget...",
    },
    {
      key: "weaknesses", label: "WEAKNESSES", icon: "🪞", color: "#EF4444",
      bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.35)",
      prompt: "What holds you back? What skills do you lack? What do you avoid? These are signals — not verdicts.",
      placeholder: "e.g. I struggle with follow-through, I avoid conflict, I don't manage time well...",
    },
    {
      key: "opportunities", label: "OPPORTUNITIES", icon: "🌱", color: "#D4AF37",
      bg: "rgba(212,175,55,0.08)", border: "rgba(212,175,55,0.35)",
      prompt: "What repeated expenses could be redirected? What needs do people around you have that are unmet?",
      placeholder: "e.g. My church community needs financial education, people in my area buy from far away...",
    },
    {
      key: "threats", label: "THREATS", icon: "⚠️", color: "#9333EA",
      bg: "rgba(147,51,234,0.08)", border: "rgba(147,51,234,0.35)",
      prompt: "What could derail your progress? What must you protect? What risks come from relying on one income?",
      placeholder: "e.g. My job is not secure, I have no savings buffer, health challenges, limited time...",
    },
  ];

  const [entries, setEntries] = React.useState<Record<string, string>>({
    strengths: "", weaknesses: "", opportunities: "", threats: "",
  });
  const [revealed, setRevealed] = React.useState(false);
  const [activeQuad, setActiveQuad] = React.useState<string>("strengths");

  const countItems = (text: string) =>
    text.split(/[,\n]/).filter(t => t.trim().length > 1).length;

  const allFilled = quadrants.every(q => entries[q.key].trim().length > 5);
  const totalItems = quadrants.reduce((sum, q) => sum + countItems(entries[q.key]), 0);

  const activeQ = quadrants.find(q => q.key === activeQuad)!;

  const insights: Record<string, string> = {
    strengths: "These are your launchpad. Every item you listed is a tool the Z2B system can activate immediately.",
    weaknesses: "You just named your growth map. In a community, your weaknesses become partnership opportunities — not disqualifiers.",
    opportunities: "These are income streams hiding in plain sight. You do not need a new idea — you need a new lens on what already exists.",
    threats: "Naming threats is how you neutralise them. Every threat you listed is an argument for building multiple income streams now.",
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D0020, #1A0035)",
      border: "2px solid #9333EA", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "4px" }}>
        🔎 Your Personal SWOT — A Mirror, Not a Test
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.6)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, a mirror does not judge — it simply shows you where you stand. Fill all four quadrants honestly. This is your strategy foundation.
      </div>

      {!revealed ? (
        <>
          {/* Tab selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px", marginBottom: "16px" }}>
            {quadrants.map(q => (
              <button
                key={q.key}
                onClick={() => setActiveQuad(q.key)}
                style={{
                  background: activeQuad === q.key ? q.bg : "rgba(255,255,255,0.04)",
                  border: `2px solid ${activeQuad === q.key ? q.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "10px", padding: "8px 4px", cursor: "pointer",
                  color: activeQuad === q.key ? q.color : "rgba(255,255,255,0.5)",
                  fontSize: "11px", fontWeight: "bold", transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "2px" }}>{q.icon}</div>
                <div>{q.label}</div>
                {entries[q.key].trim().length > 5 && (
                  <div style={{ fontSize: "10px", color: q.color, marginTop: "2px" }}>
                    ✓ {countItems(entries[q.key])}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Active quadrant input */}
          <div style={{
            background: activeQ.bg, border: `1px solid ${activeQ.border}`,
            borderRadius: "12px", padding: "16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "13px", color: activeQ.color, fontWeight: "bold", marginBottom: "6px" }}>
              {activeQ.icon} {activeQ.label}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(196,181,253,0.7)", marginBottom: "10px", lineHeight: 1.6, fontStyle: "italic" }}>
              {activeQ.prompt}
            </div>
            <textarea
              value={entries[activeQ.key]}
              onChange={e => setEntries(prev => ({ ...prev, [activeQ.key]: e.target.value }))}
              placeholder={activeQ.placeholder}
              rows={3}
              style={{
                width: "100%", background: "rgba(0,0,0,0.3)",
                border: `1px solid ${entries[activeQ.key].trim().length > 5 ? activeQ.color : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px", padding: "10px 12px",
                color: "#fff", fontSize: "13px", fontFamily: "inherit",
                resize: "none", outline: "none", lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
            {entries[activeQ.key].trim().length > 5 && (
              <div style={{ fontSize: "11px", color: activeQ.color, marginTop: "4px" }}>
                ✓ {countItems(entries[activeQ.key])}{countItems(entries[activeQ.key]) !== 1 ? " items" : " item"} · {insights[activeQ.key]}
              </div>
            )}
          </div>

          {/* Progress + submit */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", color: "rgba(196,181,253,0.5)" }}>
              {quadrants.filter(q => entries[q.key].trim().length > 5).length}/4 quadrants completed
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {quadrants.map(q => (
                <div key={q.key} style={{
                  width: "24px", height: "6px", borderRadius: "3px",
                  background: entries[q.key].trim().length > 5 ? q.color : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
          </div>

          <button
            onClick={() => allFilled && setRevealed(true)}
            disabled={!allFilled}
            style={{
              background: allFilled ? "linear-gradient(135deg, #6B21A8, #9333EA)" : "rgba(255,255,255,0.08)",
              color: allFilled ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "12px 28px",
              fontWeight: "bold", fontSize: "14px",
              cursor: allFilled ? "pointer" : "not-allowed",
            }}
          >
            {allFilled ? "Reveal My Strategy →" : "Complete all 4 quadrants to continue"}
          </button>
        </>
      ) : (
        // Result — SWOT summary
        <div>
          <div style={{ fontSize: "17px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "12px" }}>
            {firstName}, you just built a {totalItems}-point personal strategy map.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {quadrants.map(q => (
              <div key={q.key} style={{
                background: q.bg, border: `1px solid ${q.border}`,
                borderRadius: "12px", padding: "14px",
              }}>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: q.color, marginBottom: "6px" }}>
                  {q.icon} {q.label} — {countItems(entries[q.key])} items
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  {entries[q.key].split(/[,\n]/).filter(t => t.trim().length > 1).slice(0, 3).map((item, i) => (
                    <div key={i}>· {item.trim()}</div>
                  ))}
                  {countItems(entries[q.key]) > 3 && (
                    <div style={{ color: q.color, fontSize: "11px", marginTop: "2px" }}>
                      +{countItems(entries[q.key]) - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "12px",
          }}>
            <div style={{ fontSize: "13px", color: "#D4AF37", fontStyle: "italic", lineHeight: 1.8 }}>
              "You do not need a business idea to move forward. You need awareness of what already exists.
              {firstName}, you now have that awareness. Your SWOT is your strategy — not a school exercise."
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#22C55E", fontStyle: "italic" }}>
            🌱 Session 8 — The Vehicle is ready. Time to address the fears that have been holding you back.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 6 — VISION BOARD GATE ────────────────────────────
function VisionGate({ firstName }: { firstName: string }) {
  const [started, setStarted] = React.useState(false);
  const [oneGoal, setOneGoal] = React.useState("");
  const [horizon, setHorizon] = React.useState<string | null>(null);
  const [committed, setCommitted] = React.useState(false);

  const horizons = [
    { key: "immediate", label: "Immediate Term", range: "Next 90 days", icon: "⚡", color: "#EF4444", desc: "What financial pressure do I need to relieve?" },
    { key: "medium",    label: "Medium Term",    range: "1 to 3 years", icon: "🌱", color: "#22C55E", desc: "What freedom do I want to experience?" },
    { key: "long",      label: "Long Term",      range: "5 to 10 years",icon: "🏆", color: "#D4AF37", desc: "What legacy do I want to leave?" },
  ];

  const isReady = horizon !== null && oneGoal.trim().length > 5;

  const handleCommit = () => {
    if (!isReady) return;
    setCommitted(true);
    // Save mini vision to localStorage for Vision Board page to pick up
    try {
      const existing = JSON.parse(localStorage.getItem("z2b_mini_vision") || "{}");
      existing[horizon!] = oneGoal.trim();
      localStorage.setItem("z2b_mini_vision", JSON.stringify(existing));
    } catch(e) {}
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0035, #0D0020)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      {/* Header */}
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "4px" }}>
        🏆 Vision Before Execution — Your First Declaration
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, Z2B does not move forward without vision. Before Session 7 opens, you will write your first goal.
        This is not homework. This is your declaration.
      </div>

      {!started ? (
        // Intro card before they begin
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {horizons.map(h => (
              <div key={h.key} style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${h.color}40`,
                borderRadius: "12px", padding: "14px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{h.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: h.color, marginBottom: "2px" }}>{h.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.5)" }}>{h.range}</div>
              </div>
            ))}
          </div>
          <div style={{
            background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: "12px", padding: "16px", marginBottom: "18px",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontStyle: "italic" }}>
              "Most people approach income reactively — asking what business they can start quickly.
              Z2B begins differently. Before tools. Before companies. Before income streams —
              we begin with <strong style={{ color: "#D4AF37" }}>structured vision.</strong>"
            </div>
          </div>
          <button
            onClick={() => setStarted(true)}
            style={{
              background: "linear-gradient(135deg, #6B21A8, #9333EA)",
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "12px 28px", fontWeight: "bold", fontSize: "14px", cursor: "pointer",
            }}
          >
            I Am Ready To Declare My Vision →
          </button>
        </div>
      ) : !committed ? (
        // Goal writing interface
        <div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "16px" }}>
            Step 1 — Choose your time horizon:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginBottom: "20px" }}>
            {horizons.map(h => (
              <div
                key={h.key}
                onClick={() => setHorizon(h.key)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: horizon === h.key ? `${h.color}18` : "rgba(255,255,255,0.03)",
                  border: `2px solid ${horizon === h.key ? h.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "12px", padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "22px" }}>{h.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: horizon === h.key ? h.color : "#fff" }}>
                    {h.label} — {h.range}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(196,181,253,0.6)", marginTop: "2px" }}>{h.desc}</div>
                </div>
                {horizon === h.key && (
                  <div style={{ marginLeft: "auto", color: h.color, fontSize: "18px" }}>✓</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "10px" }}>
            Step 2 — Write your goal in one sentence:
          </div>
          <textarea
            value={oneGoal}
            onChange={e => setOneGoal(e.target.value)}
            placeholder={
              horizon === "immediate" ? "e.g. I want to earn an extra R2,000/month to cover my grocery bill..."
              : horizon === "medium" ? "e.g. I want to own a reliable car and have R5,000/month in passive income..."
              : horizon === "long" ? "e.g. I want to own property and leave my children a financial foundation..."
              : "Choose a time horizon above first..."
            }
            rows={3}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)",
              border: `1px solid ${oneGoal.trim().length > 5 ? "#D4AF37" : "rgba(255,255,255,0.15)"}`,
              borderRadius: "10px", padding: "12px 14px",
              color: "#fff", fontSize: "13px", fontFamily: "inherit",
              resize: "none", outline: "none", lineHeight: 1.7,
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.5)", marginTop: "6px", marginBottom: "16px" }}>
            {oneGoal.trim().length > 5
              ? "✓ Your vision is taking shape. This will be saved to your Vision Board."
              : "Be specific. The more specific your vision, the more powerful it becomes."}
          </div>

          <button
            onClick={handleCommit}
            disabled={!isReady}
            style={{
              background: isReady ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.1)",
              color: isReady ? "#000" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "13px 32px",
              fontWeight: "bold", fontSize: "14px",
              cursor: isReady ? "pointer" : "not-allowed",
            }}
          >
            🏆 Declare My Vision
          </button>
        </div>
      ) : (
        // Committed state — vision locked in
        <div>
          <div style={{
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: "12px", padding: "20px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "11px", color: "#D4AF37", letterSpacing: "1px", marginBottom: "6px" }}>
              {firstName.toUpperCase()}&apos;S VISION — DECLARED
            </div>
            <div style={{
              fontSize: "16px", color: "#fff", fontStyle: "italic",
              lineHeight: 1.7, borderLeft: "3px solid #D4AF37", paddingLeft: "14px",
            }}>
              "{oneGoal}"
            </div>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "rgba(196,181,253,0.6)" }}>
              {horizons.find(h => h.key === horizon)?.icon} {horizons.find(h => h.key === horizon)?.label} · {horizons.find(h => h.key === horizon)?.range}
            </div>
          </div>

          <div style={{
            background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "13px", color: "#C4B5FD", lineHeight: 1.8 }}>
              {firstName}, your Vision Board is now live at{" "}
              <a href="/vision-board" style={{ color: "#D4AF37", fontWeight: "bold" }}>
                your Vision Board
              </a>
              {" "}— where this goal has been pre-loaded. After Session 9, you will complete all 9 cells.
              For now, your declaration is made. The ground has been broken.
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "10px", padding: "12px 16px",
          }}>
            <span style={{ fontSize: "20px" }}>🌱</span>
            <div style={{ fontSize: "12px", color: "#22C55E", lineHeight: 1.6 }}>
              Your vision has been recorded. Session 7 is now unlocked — From SWOT to Opportunity.
              You are about to turn your reality into your strategy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 5 — COMMUNITY PREVIEW ────────────────────────────
function CommunityPreview({ firstName }: { firstName: string }) {
  const [seatChosen, setSeatChosen] = React.useState<string | null>(null);

  const members = [
    { name: "Thandi M.", role: "Teacher, Soweto", tag: "Session 34", avatar: "👩🏾‍🏫", income: "R3,200/mo extra", joined: "4 months ago" },
    { name: "Sipho K.", role: "Security Guard, Joburg", tag: "Session 61", avatar: "👨🏿‍💼", income: "R6,800/mo extra", joined: "7 months ago" },
    { name: "Nomsa D.", role: "Admin Clerk, Pretoria", tag: "Session 19", avatar: "👩🏽‍💻", income: "R1,400/mo extra", joined: "2 months ago" },
    { name: "David L.", role: "Driver, Durban", tag: "Session 78", avatar: "👨🏾‍🚗", income: "R11,500/mo extra", joined: "11 months ago" },
    { name: "Precious N.", role: "Nurse, Cape Town", tag: "Session 45", avatar: "👩🏿‍⚕️", income: "R5,100/mo extra", joined: "6 months ago" },
    { name: "You", role: firstName + ", your seat is open", tag: "Session 1", avatar: "🪑", income: "Your journey begins", joined: "Today" },
  ];

  const tableValues = [
    { icon: "📚", label: "Education First", desc: "Every member learns before they earn" },
    { icon: "🤝", label: "Trust Before Transactions", desc: "Relationships are built before business" },
    { icon: "🌍", label: "Community Leverage", desc: "What one cannot do alone, many can do together" },
    { icon: "🔁", label: "Duplication Over Hustle", desc: "Systems work even when you sleep" },
  ];

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D0020, #1A0035)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "4px" }}>
        🏛️ A Seat Has Been Reserved For You
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, the Z2B Table is already full of people just like you — employees who decided to stop watching and start building. Here is who is already seated:
      </div>

      {/* Member cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {members.map((m, i) => {
          const isYou = m.name === "You";
          return (
            <div
              key={i}
              onClick={() => isYou && setSeatChosen("yes")}
              style={{
                background: isYou
                  ? seatChosen ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.07)"
                  : "rgba(255,255,255,0.04)",
                border: isYou ? "2px dashed #D4AF37" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "14px",
                cursor: isYou ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "26px", marginBottom: "6px" }}>{m.avatar}</div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: isYou ? "#D4AF37" : "#fff", marginBottom: "2px" }}>
                {m.name}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.6)", marginBottom: "6px" }}>{m.role}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{
                  background: isYou ? "rgba(212,175,55,0.2)" : "rgba(147,51,234,0.2)",
                  color: isYou ? "#D4AF37" : "#C4B5FD",
                  fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                }}>{m.tag}</span>
                <span style={{
                  background: "rgba(34,197,94,0.15)", color: "#22C55E",
                  fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                }}>{m.income}</span>
              </div>
              {isYou && !seatChosen && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#D4AF37", fontStyle: "italic" }}>
                  👆 Tap to take your seat
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Table values */}
      <div style={{
        background: "rgba(0,0,0,0.3)", borderRadius: "12px",
        padding: "16px", marginBottom: "16px",
      }}>
        <div style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "bold", letterSpacing: "1px", marginBottom: "12px" }}>
          WHAT THE TABLE STANDS FOR
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {tableValues.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{v.icon}</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", marginBottom: "2px" }}>{v.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.6)", lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat chosen response */}
      {seatChosen ? (
        <div style={{
          background: "rgba(212,175,55,0.1)",
          border: "1px solid rgba(212,175,55,0.4)",
          borderRadius: "12px", padding: "18px",
        }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
            {firstName}, your seat is confirmed. 🏆
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "10px" }}>
            Every person at this table was once exactly where you are right now — reading, learning, wondering if this is real.
            The only difference between them and where you sit today is that they kept going.
            Session 6 is where your Vision Board begins. That is where everything becomes personal.
          </div>
          <div style={{ fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
            🌱 The ground is being prepared. Session 6 — Vision Before Execution — is waiting for you.
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.6)", fontStyle: "italic" }}>
            Tap your seat card above to claim your place at the table, {firstName}.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 4 — HIDDEN ASSET AUDIT ───────────────────────────
function AssetAudit({ firstName }: { firstName: string }) {
  const categories = [
    {
      key: "skills",
      icon: "🛠️",
      label: "MY SKILLS",
      color: "#9333EA",
      border: "rgba(147,51,234,0.4)",
      placeholder: "e.g. Communication, Excel, Driving, Cooking, Teaching...",
      hint: "What do people come to you for? What do you do well at work or home?",
    },
    {
      key: "networks",
      icon: "🤝",
      label: "MY NETWORKS",
      color: "#0EA5E9",
      border: "rgba(14,165,233,0.4)",
      placeholder: "e.g. Church community, Work colleagues, School parents, WhatsApp groups...",
      hint: "Who do you have access to? Who trusts you?",
    },
    {
      key: "routines",
      icon: "⏰",
      label: "MY ROUTINES",
      color: "#22C55E",
      border: "rgba(34,197,94,0.4)",
      placeholder: "e.g. Early riser, Weekend free, Lunch breaks, School run...",
      hint: "When do you have predictable windows of time or energy?",
    },
    {
      key: "knowledge",
      icon: "🧠",
      label: "MY KNOWLEDGE",
      color: "#D4AF37",
      border: "rgba(212,175,55,0.4)",
      placeholder: "e.g. Industry experience, Local area knowledge, Parenting, Finance basics...",
      hint: "What do you know that others in your circle do not?",
    },
  ];

  const [entries, setEntries] = React.useState<Record<string, string>>({
    skills: "", networks: "", routines: "", knowledge: "",
  });
  const [revealed, setRevealed] = React.useState(false);

  const totalWords = Object.values(entries).join(" ").trim().split(/\s+/).filter(w => w.length > 0).length;
  const isReady = Object.values(entries).every(v => v.trim().length > 3);

  const countItems = (text: string) =>
    text.split(/[,\n]/).filter(t => t.trim().length > 1).length;

  const totalItems = Object.values(entries).reduce((sum, v) => sum + countItems(v), 0);

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D0020, #1A0035)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "6px" }}>
        💎 Your Hidden Asset Audit
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, before you look for opportunity outside — look at what you already carry.
        Fill in at least 3 items in each category. Be honest. Be specific.
      </div>

      {categories.map(cat => (
        <div key={cat.key} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "18px" }}>{cat.icon}</span>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: cat.color, letterSpacing: "1px" }}>
              {cat.label}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.5)", marginBottom: "6px", paddingLeft: "26px" }}>
            {cat.hint}
          </div>
          <textarea
            value={entries[cat.key]}
            onChange={e => setEntries(prev => ({ ...prev, [cat.key]: e.target.value }))}
            placeholder={cat.placeholder}
            rows={2}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${entries[cat.key].trim().length > 3 ? cat.color : "rgba(255,255,255,0.1)"}`,
              borderRadius: "10px", padding: "10px 12px",
              color: "#fff", fontSize: "13px", fontFamily: "inherit",
              resize: "none", outline: "none", lineHeight: 1.6,
              boxSizing: "border-box",
            }}
          />
          {entries[cat.key].trim().length > 3 && (
            <div style={{ fontSize: "11px", color: cat.color, marginTop: "3px", paddingLeft: "4px" }}>
              ✓ {countItems(entries[cat.key])}{countItems(entries[cat.key]) !== 1 ? " items" : " item"} identified
            </div>
          )}
        </div>
      ))}

      {!revealed ? (
        <button
          onClick={() => isReady && setRevealed(true)}
          disabled={!isReady}
          style={{
            marginTop: "8px",
            background: isReady ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.1)",
            color: isReady ? "#000" : "rgba(255,255,255,0.3)",
            border: "none", borderRadius: "10px", padding: "12px 28px",
            fontWeight: "bold", fontSize: "14px",
            cursor: isReady ? "pointer" : "not-allowed",
          }}
        >
          {isReady ? "Reveal My Capital →" : "Fill in all 4 categories to continue"}
        </button>
      ) : (
        <div style={{
          marginTop: "16px", background: "rgba(212,175,55,0.08)",
          border: "1px solid rgba(212,175,55,0.35)",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
            {firstName}, you just mapped {totalItems} capital assets.
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "14px" }}>
            Every item you wrote down is something a community-based business model can leverage.
            Your skills are your service. Your networks are your market. Your routines are your schedule.
            Your knowledge is your edge. You did not arrive here empty-handed.
            {totalItems >= 10
              ? " You are sitting on a goldmine of untapped capital. The only thing missing was the system to activate it."
              : totalItems >= 6
              ? " You have more than enough to begin. Most successful builders started with less than what you have listed here."
              : " Even these few items, when placed inside the right system, can generate your first income stream."}
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px",
          }}>
            {categories.map(cat => (
              <div key={cat.key} style={{
                background: "rgba(0,0,0,0.3)", borderRadius: "8px",
                padding: "10px 12px", borderLeft: `3px solid ${cat.color}`,
              }}>
                <div style={{ fontSize: "11px", color: cat.color, fontWeight: "bold", marginBottom: "2px" }}>
                  {cat.icon} {cat.label}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                  {countItems(entries[cat.key])}{countItems(entries[cat.key]) !== 1 ? " assets" : " asset"} identified
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "10px",
            padding: "12px 16px", borderLeft: "3px solid #D4AF37",
          }}>
            <div style={{ fontSize: "13px", color: "#D4AF37", fontStyle: "italic", lineHeight: 1.7 }}>
              "You do not need a business idea to move forward. You need a new way of seeing yourself in the economy. You just took that step."
            </div>
          </div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#22C55E", fontStyle: "italic" }}>
            🌱 Session 5 will show you the table where all these assets come together.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 3 — IDENTITY SELECTOR ────────────────────────────
function IdentitySelector({ firstName }: { firstName: string }) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [currentGoal, setCurrentGoal] = React.useState<number | null>(null);
  const [stage, setStage] = React.useState<"pick" | "goal" | "result">("pick");

  const identities = [
    {
      id: 0,
      icon: "👤",
      label: "The Consumer",
      color: "#6B7280",
      border: "rgba(107,114,128,0.4)",
      bg: "rgba(107,114,128,0.08)",
      desc: "I earn. I spend. My income goes to bills and lifestyle. I have no ownership in the value I create.",
      truth: "This is where most people start. There is no shame here — only awareness.",
    },
    {
      id: 1,
      icon: "⚡",
      label: "The Entrepreneurial Consumer",
      color: "#D4AF37",
      border: "rgba(212,175,55,0.5)",
      bg: "rgba(212,175,55,0.08)",
      desc: "I earn income AND I am beginning to redirect my spending toward systems that flow value back to me.",
      truth: "This is the missing identity. The one you were never taught. The one Z2B was built for.",
    },
    {
      id: 2,
      icon: "🚀",
      label: "The Entrepreneur",
      color: "#9333EA",
      border: "rgba(147,51,234,0.4)",
      bg: "rgba(147,51,234,0.08)",
      desc: "I build products, services or systems. I take on risk and operate under uncertainty in exchange for ownership.",
      truth: "You have taken the leap. Now Z2B will help you build the systems to sustain and scale it.",
    },
  ];

  const results: Record<string, { heading: string; body: string; challenge: string }> = {
    "0-0": {
      heading: "Awareness is the first step, " + firstName + ".",
      body: "You are honest — and that honesty is rare. Most people live as consumers without ever questioning it. You have just named your current reality. That is more powerful than it sounds. The Consumer identity is not a life sentence. It is a starting point. Z2B was built to move you from here.",
      challenge: "Your challenge: In the next 24 hours, identify ONE monthly expense that could potentially flow value back to you if redirected strategically.",
    },
    "0-1": {
      heading: firstName + ", you are closer than you think.",
      body: "You are currently a Consumer but your heart is already reaching toward the Entrepreneurial Consumer identity. That gap — between where you are and where you want to be — is exactly what this workshop closes. Session by session. Day by day.",
      challenge: "Your challenge: Write down what makes you feel that the Entrepreneurial Consumer identity is possible for you. That feeling is your seed.",
    },
    "0-2": {
      heading: "Big vision, " + firstName + ". Let us build the bridge.",
      body: "You are a Consumer today but you see yourself as a full Entrepreneur. That is a bold and worthy goal. Z2B recommends not skipping the Entrepreneurial Consumer stage — it builds the skills, income, and community you will need to sustain entrepreneurship long term.",
      challenge: "Your challenge: Before you build a business, build a network. That network becomes your first market.",
    },
    "1-1": {
      heading: firstName + ", you are already in motion.",
      body: "You have chosen the Entrepreneurial Consumer identity NOW and in the FUTURE. This is the power position. You are not waiting to quit your job. You are not gambling everything. You are building ownership strategically while your employment provides stability. This is exactly the Z2B way.",
      challenge: "Your challenge: Name ONE system you are currently building or redirecting income toward. If you cannot name it yet — that is what Sessions 4 to 9 will unlock.",
    },
    "1-2": {
      heading: "You are on the right path, " + firstName + ".",
      body: "You are an Entrepreneurial Consumer growing toward full Entrepreneurship. This is the natural Z2B progression. Build your consumer network first. Let it generate income. Let that income fund your entrepreneurial ambitions. Never burn the bridge that feeds you.",
      challenge: "Your challenge: What entrepreneurial idea are you already sitting on? Write it down. The next 6 sessions will show you how to test it without quitting your job.",
    },
    "2-2": {
      heading: firstName + ", the table is already yours.",
      body: "You are an Entrepreneur and you want to remain one. Z2B will help you scale what you have built by adding the Entrepreneurial Consumer model as a distribution and duplication engine. Your next level is not another hustle — it is a system that grows without you.",
      challenge: "Your challenge: How many people in your network are potential Entrepreneurial Consumers who could distribute your products or expand your reach? That number is your next growth target.",
    },
  };

  const getResult = () => {
    const key = selected + "-" + currentGoal;
    return results[key] || results["0-1"];
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0035, #0D0020)",
      border: "2px solid #9333EA", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "6px" }}>
        🪪 Which Identity Are You Living Right Now?
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.6)", marginBottom: "20px" }}>
        Be honest. This is not a test — it is a mirror.
      </div>

      {/* Stage 1 — Pick current identity */}
      {stage === "pick" && (
        <>
          {identities.map(id => (
            <div
              key={id.id}
              onClick={() => setSelected(id.id)}
              style={{
                background: selected === id.id ? id.bg : "rgba(255,255,255,0.03)",
                border: `2px solid ${selected === id.id ? id.color : "rgba(255,255,255,0.08)"}`,
                borderRadius: "14px", padding: "16px 18px", marginBottom: "12px",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px" }}>{id.icon}</span>
                <span style={{ fontSize: "15px", fontWeight: "bold", color: id.color }}>{id.label}</span>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, paddingLeft: "34px" }}>
                {id.desc}
              </div>
            </div>
          ))}
          <button
            onClick={() => selected !== null && setStage("goal")}
            disabled={selected === null}
            style={{
              marginTop: "8px",
              background: selected !== null ? "linear-gradient(135deg, #6B21A8, #9333EA)" : "rgba(255,255,255,0.1)",
              color: selected !== null ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "12px 28px",
              fontWeight: "bold", fontSize: "14px",
              cursor: selected !== null ? "pointer" : "not-allowed",
            }}
          >
            This Is Me Today →
          </button>
        </>
      )}

      {/* Stage 2 — Pick goal identity */}
      {stage === "goal" && (
        <>
          <div style={{ fontSize: "14px", color: "#C4B5FD", marginBottom: "16px", fontWeight: "bold" }}>
            Now — which identity do you want to grow INTO in the next 12 months?
          </div>
          {identities.map(id => (
            <div
              key={id.id}
              onClick={() => setCurrentGoal(id.id)}
              style={{
                background: currentGoal === id.id ? id.bg : "rgba(255,255,255,0.03)",
                border: `2px solid ${currentGoal === id.id ? id.color : "rgba(255,255,255,0.08)"}`,
                borderRadius: "14px", padding: "14px 18px", marginBottom: "10px",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>{id.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: id.color }}>{id.label}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{id.truth}</div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => currentGoal !== null && setStage("result")}
            disabled={currentGoal === null}
            style={{
              marginTop: "8px",
              background: currentGoal !== null ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.1)",
              color: currentGoal !== null ? "#000" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "12px 28px",
              fontWeight: "bold", fontSize: "14px",
              cursor: currentGoal !== null ? "pointer" : "not-allowed",
            }}
          >
            Show Me My Path →
          </button>
        </>
      )}

      {/* Stage 3 — Personalised result */}
      {stage === "result" && (
        <div style={{
          background: "rgba(212,175,55,0.07)",
          border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ fontSize: "17px", fontWeight: "bold", color: "#D4AF37", marginBottom: "10px" }}>
            {getResult().heading}
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "16px" }}>
            {getResult().body}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "12px",
            borderLeft: "3px solid #D4AF37",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px", letterSpacing: "1px" }}>YOUR 24-HOUR CHALLENGE</div>
            <div style={{ fontSize: "13px", color: "#fff", lineHeight: 1.7 }}>{getResult().challenge}</div>
          </div>
          <div style={{ fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
            🌱 The seed has been planted. Session 4 will show you the assets you already own.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 2 — MONTH CHECK QUIZ ─────────────────────────────
function MonthCheckQuiz({ firstName }: { firstName: string }) {
  const [selected, setSelected] = React.useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const expenses = [
    { label: "Rent / Bond", emoji: "🏠" },
    { label: "Transport / Petrol", emoji: "🚗" },
    { label: "Groceries", emoji: "🛒" },
    { label: "School fees / Kids", emoji: "🎒" },
    { label: "Electricity / Water", emoji: "💡" },
    { label: "Data / Airtime", emoji: "📱" },
    { label: "Insurance", emoji: "🛡️" },
    { label: "Clothing accounts", emoji: "👗" },
    { label: "Medical / Pharmacy", emoji: "💊" },
    { label: "Entertainment / DStv", emoji: "📺" },
  ];

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const totalEstimate = selectedCount * 1200; // rough R1,200 avg per category

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D1F0D, #0A2010)",
      border: "2px solid #22C55E", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22C55E", marginBottom: "6px" }}>
        💸 Does This Sound Like Your Month?
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>
        Tick every expense that leaves your account before month-end:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {expenses.map((exp, i) => (
          <div
            key={i}
            onClick={() => !submitted && setSelected(prev => ({ ...prev, [i]: !prev[i] }))}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: selected[i] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${selected[i] ? "#22C55E" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "10px", padding: "10px 12px", cursor: submitted ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0,
              background: selected[i] ? "#22C55E" : "rgba(255,255,255,0.1)",
              border: `2px solid ${selected[i] ? "#22C55E" : "rgba(255,255,255,0.3)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "bold", color: "#000",
            }}>
              {selected[i] ? "✓" : ""}
            </div>
            <span style={{ fontSize: "13px", color: "#fff" }}>{exp.emoji} {exp.label}</span>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={selectedCount === 0}
          style={{
            background: selectedCount > 0 ? "linear-gradient(135deg, #15803D, #22C55E)" : "rgba(255,255,255,0.1)",
            color: selectedCount > 0 ? "#000" : "rgba(255,255,255,0.4)",
            border: "none", borderRadius: "10px", padding: "12px 28px",
            fontWeight: "bold", fontSize: "14px",
            cursor: selectedCount > 0 ? "pointer" : "not-allowed",
          }}
        >
          Show Me My Reality
        </button>
      ) : (
        <div style={{
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.4)",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#22C55E", marginBottom: "8px" }}>
            {firstName}, you ticked {selectedCount} out of 10 expenses.
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "12px" }}>
            That is roughly <strong style={{ color: "#22C55E" }}>R{totalEstimate.toLocaleString()}+</strong> flowing
            OUT of your account every month — to companies you will never own a share of.
            {selectedCount >= 7
              ? " You are not spending recklessly. You are funding the economy without participating in its rewards."
              : selectedCount >= 4
              ? " Every rand you spend makes someone else wealthy. The question is — when does it start making YOU wealthy?"
              : " Even a few of these categories represent thousands of rands leaving your hands every month with no return."}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "12px",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>The question Z2B asks:</div>
            <div style={{ fontSize: "15px", color: "#D4AF37", fontWeight: "bold", fontStyle: "italic" }}>
              "What if even ONE of these monthly expenses could flow value BACK to you?"
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#22C55E", fontStyle: "italic" }}>
            Continue to Session 3 — you are about to discover the identity that changes everything.
          </div>
        </div>
      )}
    </div>
  );
}

function WorkshopInner() {
  const searchParams = useSearchParams();
  // ── Email gate — set on first visit, persists in localStorage ──
  const [workshopEmail, setWorkshopEmail] = useState<string | null>(() => {
    try { return localStorage.getItem("z2b_workshop_email") || null; } catch { return null; }
  });
  const [view, setView]                     = useState<ViewType>("home");
  const [morningSession, setMorningSession] = useState<MorningSession | null>(null);
  const [showMorningAudio, setShowMorningAudio] = useState(false);
  const [progress, setProgress]             = useState<ProgressMap>(createInitialProgress);
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [answers, setAnswers]               = useState<Record<number, number>>({});
  const [submitted, setSubmitted]           = useState(false);
  const [score, setScore]                   = useState<number | null>(null);
  const [activityTicked, setActivityTicked] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [showShareCard, setShowShareCard]   = useState(false);
  const [showAudio, setShowAudio]           = useState(false);
  // ── ADDITION 2a: userId + referralCode state ──
  const [userId, setUserId]                 = useState<string | null>(null);
  const [builderRef, setBuilderRef]         = useState<string | null>(null);
  // ── Welcome overlay state ──
  const [showWelcome, setShowWelcome]       = useState(false);
  const [inviterName, setInviterName]       = useState("");
  const [urlRef, setUrlRef]                 = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── COACH MANLAW STATE ──
  const [manlawOpen, setManlawOpen]           = useState(false);
  const [manlawInput, setManlawInput]         = useState("");
  const [manlawMessages, setManlawMessages]   = useState<{role:"user"|"manlaw", text:string}[]>([]);
  const [manlawLoading, setManlawLoading]     = useState(false);
  const manlawEndRef = useRef<HTMLDivElement>(null);
  const [manlawMemberName, setManlawMemberName] = useState<string | null>(null);
  const [referredBy, setReferredBy]             = useState<string | null>(null);

  // Capture ?ref= referral code from URL
  useEffect(() => {
    const ref = searchParams ? searchParams.get("ref") : null;
    if (ref) {
      setReferredBy(ref);
      try { localStorage.setItem("z2b_ref", ref); } catch(e) {}
    } else {
      try {
        const stored = localStorage.getItem("z2b_ref");
        if (stored) setReferredBy(stored);
      } catch(e) {}
    }
  }, [searchParams]);
  const [manlawAskedName, setManlawAskedName]   = useState(false);

  const section        = currentSection != null ? SECTIONS.find((s) => s.id === currentSection) ?? null : null;
  const completedCount = (Object.values(progress) as SectionProgress[]).filter((p) => p.completed).length;
  const freeCompleted  = SECTIONS.filter((s) => s.free && progress[s.id]?.completed).length;

  // ── ADDITION 2b: Load saved progress from Supabase on mount ──
  useEffect(() => {
    // Check URL for referral code and show welcome overlay
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setUrlRef(refCode);
      // Show registration gate immediately — don't wait for name resolution
      // Check if they are already logged in (returning visitor)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          // New visitor — show the registration gate
          setShowWelcome(true);
        }
        // If already logged in, no gate needed — they are already registered
      });
      // Resolve builder/sponsor name in the background
      supabase
        .from("profiles")
        .select("full_name")
        .eq("referral_code", refCode)
        .single()
        .then(({ data }) => {
          if (data?.full_name) {
            setInviterName(data.full_name);
          }
        });
    }

    const loadProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // guest — use in-memory progress only
        setUserId(user.id);

        // Fetch builder's referral code for share links
        const { data: profileData } = await supabase
          .from("profiles")
          .select("referral_code, full_name")
          .eq("id", user.id)
          .single();
        if (profileData?.referral_code) setBuilderRef(profileData.referral_code);

        // Fetch member first name for Coach Manlaw personalisation
        if (profileData?.full_name) {
          const firstName = profileData.full_name.trim().split(" ")[0];
          setManlawMemberName(firstName);
        }
        const { data, error } = await supabase
          .from("workshop_progress")
          .select("*")
          .eq("user_id", user.id);
        if (error || !data) return;
        setProgress((prev) => {
          const updated = { ...prev };
          data.forEach((row: any) => {
            updated[row.section_id] = {
              read:         row.read,
              answers:      {},
              activityDone: row.activity_done,
              completed:    row.completed,
              score:        row.score,
            };
          });
          return updated;
        });
      } catch (err) {
        console.error("Workshop progress load error:", err);
      }
    };
    loadProgress();
  }, []);

  // ---- scroll detection ----
  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 40) setScrolledToBottom(true);
  };

  // ---- open a section ----
  const openSection = (id: number) => {
    const sec = SECTIONS.find((s) => s.id === id);
    if (!sec) return;
    if (!sec.free) { setView("paywall"); return; }
    if (id > 1 && !progress[id - 1]?.completed) return;
    setCurrentSection(id);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setActivityTicked(progress[id]?.activityDone ?? false);
    setScrolledToBottom(progress[id]?.read ?? false);
    setView("section");
    window.scrollTo(0, 0);
  };

  const openMorningSession = (id: number) => {
    const ms = MORNING_SESSIONS.find(s => s.id === id);
    if (!ms) return;
    setMorningSession(ms);
    setShowMorningAudio(false);
    setView("morning" as any);
    window.scrollTo(0, 0);
  };

  const isSectionUnlocked = (id: number): boolean => {
    const sec = SECTIONS.find((s) => s.id === id);
    if (!sec || !sec.free) return false;
    if (id === 1) return true;
    return progress[id - 1]?.completed ?? false;
  };

  // ---- quiz ----
  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev: Record<number, number>) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (!section || Object.keys(answers).length < 5) return;
    let correct = 0;
    section.questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(correct);
    setSubmitted(true);
  };

  // ── ADDITION 3: handleComplete saves to Supabase ──
  const handleComplete = async () => {
    if (!scrolledToBottom || score == null || !activityTicked || currentSection == null) return;
    setProgress((prev: ProgressMap) => ({
      ...prev,
      [currentSection]: { read: true, answers, activityDone: true, completed: true, score },
    }));
    // Save to Supabase if logged in
    if (userId) {
      try {
        await supabase
          .from("workshop_progress")
          .upsert(
            {
              user_id:       userId,
              section_id:    currentSection,
              read:          true,
              activity_done: true,
              completed:     true,
              score:         score,
              completed_at:  new Date().toISOString(),
              updated_at:    new Date().toISOString(),
            },
            { onConflict: "user_id,section_id" }
          );

        // ── GroundBreaker milestone hooks ──────────────────────────
        // Upsert prospect milestone row on Session 1
        if (currentSection === 1) {
          const ref = localStorage.getItem("z2b_ref") || null;
          await supabase.from("prospect_milestones").upsert(
            { user_id: userId, referred_by: ref, session_1_started_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
        }
        // Session 3 — Seed alert
        if (currentSection === 3) {
          await supabase.from("prospect_milestones")
            .update({ session_3_completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        // Session 6 — Vision alert
        if (currentSection === 6) {
          await supabase.from("prospect_milestones")
            .update({ session_6_completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        // Session 9 — Harvest Ready alert
        if (currentSection === 9) {
          await supabase.from("prospect_milestones")
            .update({ session_9_completed_at: new Date().toISOString(), harvest_ready: true, updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        // ──────────────────────────────────────────────────────────

      } catch (err) {
        console.error("Workshop progress save error:", err);
      }
    }
    setView("results");
    // Auto-open Coach Manlaw after section complete
    if (section) {
      setTimeout(() => openManlawAfterSection(section.title, currentSection), 800);
    }
  };

  // ── COACH MANLAW: auto-open after section completion ──
  const openManlawAfterSection = (sectionTitle: string, sectionId: number) => {
    const openingPrompt = `You have just completed Session ${sectionId} — "${sectionTitle}". Coach Manlaw wants to check in with you.`;
    setManlawMessages([{ role: "manlaw", text: openingPrompt }]);
    setManlawOpen(true);
    setTimeout(() => callManlaw(
      `The member just completed Session ${sectionId} titled "${sectionTitle}". Ask them how this session landed for them. Use your full coaching voice — be specific to this section, not generic. Keep your opening response to 3-4 sentences maximum.`,
      []
    ), 400);
  };

  // ── COACH MANLAW: core API call ──
  const callManlaw = async (userMessage: string, history: {role:"user"|"manlaw", text:string}[]) => {
    setManlawLoading(true);
    const sec = currentSection != null ? SECTIONS.find(s => s.id === currentSection) : null;

    const memberName = manlawMemberName;
    const systemPrompt = `You are Coach Manlaw — the personal AI business coach of Z2B Table Banquet, created by Rev Mokoro Manana, Founder of Zero2Billionaires.

YOUR IDENTITY
You are not a chatbot. You are not a customer service agent. You are a wise, direct, faith-aware business mentor who has sat at the table with people who started with nothing and built legacies. You coach with depth, precision, and genuine care for the person in front of you.

YOUR MISSION
To transform employees and consumers into Entrepreneurial Consumers — people who redirect their spending into systems, build networks with purpose, and create legacies that outlive them. You guide each member through the Z2B 4-Leg Blueprint: Mindset (Copper), Systems (Silver), Relationships (Gold), Legacy (Platinum).

YOUR FIVE COACHING LAWS
LAW 1 — VALUE AT SCALE: Wealth is a reward for solving problems at scale. Redirect members from "how do I earn more" to "what problem can I solve for more people."
LAW 2 — REMARKABILITY: Being good is invisible. Being safe is fatal. Challenge members to ask what makes their presence, message, and invitation impossible to ignore. Average thinking is the one thing you will never tolerate.
LAW 3 — STEWARDSHIP: Before more is given, faithfulness with what exists must be demonstrated. Connect every action back to faithful stewardship.
LAW 4 — SYSTEMS OVER HUSTLE: If income stops when they stop working, they have a job not a business. Always move members toward building scalable systems.
LAW 5 — TRIBE BEFORE MARKET: Help members find their specific tribe — the people already looking for them — and serve that tribe so deeply that revenue becomes inevitable.

YOUR VOICE
- Wise mentor, not a cheerleader. Affirm growth, not effort for its own sake.
- Faith-aware, not preachy. Honour kingdom principles when relevant. Plant seeds, never sermons.
- Direct, not harsh. Tell the whole truth with warmth and precision.
- Hopeful, not fake. Ground hope in evidence and action — never empty positivity.
- Globally minded. South Africa is the launchpad, not the limit.
${memberName ? `- The member's name is ${memberName}. Use their name naturally — not in every sentence, but enough that they feel seen and known. Greet them by name in your first response.` : "- You do not yet know this member's name. Focus on coaching first. After your opening response, warmly ask for their name so you can address them personally."}

WHAT YOU NEVER DO
- Never give generic advice that could apply to anyone. Every response must feel written for this specific person.
- Never validate mediocrity. Always point toward where they could be.
- Never end without a question or a challenge. Every conversation must move forward.
- Never use filler phrases like "Great question!" or "Absolutely!"
- Never mention names of external authors, speakers, or thought leaders.
- Keep responses focused — 3 to 5 sentences for follow-ups, slightly longer for opening check-ins.
- Never use roleplay action descriptions — no asterisk actions like "*nods*" or "*clears throat*". Speak directly. Your words carry the warmth — no stage directions needed.

THE Z2B CURRICULUM MAP (for session-specific coaching)
Morning Sessions (audio, identity anchoring): M1 Who You Are & Why, M2 Mindset Shift Employee to Builder, M3 Understanding Income Model, M4 Building First System, M5 Growing Relationships Intentionally, M6 Legacy Mission Long-Term Vision, M7 Entrepreneurial Consumer Identity, M8 Your Table in Community, M9 First Step Learning to Doing.
Free Evening Sessions 1-9: S1 Silent Frustration of Employees, S2 Consumption Without Leverage, S3 Three Identities in the Marketplace (EC is the third), S4 Employees Already Have Assets, S5 TABLE Philosophy Community Before Commerce, S6 Vision Before Execution 3 Time Horizons, S7 SWOT to Opportunity Reality Audit, S8 Network Marketing Vehicle Not Destination, S9 Circle of Twelve Human Capital.
Paid Sessions 10-20: S10 Innovators Early Adopters Purple Gold Mantle, S11 Ethical Collaboration Kingdom Multiplication, S12 AI Technology Digital Oil This Generation, S13 Smartphone Income Engine Producer Not Consumer, S14 Copywriting Hook Body CTA Words Into Currency, S15 Platform Funnel 6-Layer Economic Architecture, S16 Platform Ownership Tenant to Landlord, S17 Digital Assets Legacy Infrastructure, S18 Strategic Capital Positioning Influence Access, S19 Sourcing Quality Partners Discernment Over Desperation, S20 Circle as Economic Incubator.
Sessions 21-99: Financial Literacy, Employee vs Owner Mindset, Income Blueprint, Psychology of Money, Compensation Plans, Retail Profit, Team Building, Art of Invitation, Handling Objections, Leadership vs Management, Duplication Systems, Personal Branding, Content Creation, Video Marketing, WhatsApp Platform, Facebook Strategy, TikTok, Email Marketing, Goal Setting, Time Management, Morning Routines, Financial Planning, Savings Investment, Debt Strategy, Compound Effect, Creating Products, Pricing Value, Customer Service, Referral Systems, Faith and Business, Stewardship, Character Development, Resilience, Public Speaking, Negotiation, Scaling, Multiple Income Streams, Legacy Mindset, Wealth Transfer, Diamond Legacy Path.

CURRENT SESSION CONTEXT
${sec ? `The member is currently on Session ${sec.id} — "${sec.title}" (${sec.subtitle}).

Session theme: ${sec.content.substring(0, 300)}...

Your coaching must be SESSION-SPECIFIC. Ask questions that deepen their application of THIS topic — not generic Z2B coaching. Connect it to their current situation. Challenge them to take one specific action within 48 hours that applies what this session teaches. Every response must feel written for someone doing Session ${sec.id} today.` : "The member is engaging with the Z2B Workshop. Ask which session they are currently on so you can coach them with full precision."}`;

    // Build clean alternating message history for Anthropic
    const rawHistory = history.filter(m => m.text && m.text.trim().length > 0);
    const messages: {role:"user"|"assistant", content:string}[] = [];
    for (const m of rawHistory) {
      const role = m.role === "user" ? "user" : "assistant";
      // Anthropic requires alternating roles — skip consecutive same roles
      if (messages.length > 0 && messages[messages.length - 1].role === role) continue;
      messages.push({ role, content: m.text });
    }
    // Always end with the new user message
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      messages[messages.length - 1].content = userMessage;
    } else {
      messages.push({ role: "user", content: userMessage });
    }

    try {
      // ── Call via Next.js API route to avoid CORS ──
      const response = await fetch("/api/coach-manlaw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, systemPrompt }),
      });
      const data = await response.json();
      const reply = data.reply || "I am here with you. Take a breath and tell me what is on your mind.";
      setManlawMessages(prev => [...prev, { role: "manlaw", text: reply }]);

      // Save to Supabase if logged in
      if (userId && currentSection) {
        try {
          await supabase.from("coach_manlaw_sessions").insert({
            user_id: userId,
            section_id: currentSection,
            member_message: userMessage,
            manlaw_response: reply,
            created_at: new Date().toISOString(),
          });
        } catch(e) { /* silent — table may not exist yet */ }
      }
    } catch (err) {
      setManlawMessages(prev => [...prev, { role: "manlaw", text: "I am still here. Something interrupted our connection — try sending your message again." }]);
    } finally {
      setManlawLoading(false);
      setTimeout(() => manlawEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const sendManlawMessage = () => {
    if (!manlawInput.trim() || manlawLoading) return;
    const userMsg = manlawInput.trim();
    // If member is a guest and Manlaw asked for their name, capture it
    if (!manlawMemberName && manlawAskedName) {
      const possibleName = userMsg.split(" ")[0];
      if (possibleName.length > 1 && possibleName.length < 30) {
        setManlawMemberName(possibleName);
      }
    }
    const updated = [...manlawMessages, { role: "user" as "user"|"manlaw", text: userMsg }];
    setManlawMessages(updated);
    setManlawInput("");
    callManlaw(userMsg, manlawMessages);
  };

  // ---- Mirror Moment Quiz State ----
  const [mirrorAnswers, setMirrorAnswers] = useState<Record<number, boolean | null>>({});
  const [mirrorSubmitted, setMirrorSubmitted] = useState(false);
  const mirrorQuestions = [
    "My salary is gone before the next one arrives.",
    "I work hard but my income never seems to grow.",
    "I feel stuck between staying employed and the risk of starting something.",
    "I have dreams but responsibility makes them feel dangerous.",
    "I smile at work but privately wonder: Is this really it?",
  ];

  const mirrorScore = Object.values(mirrorAnswers).filter(v => v === true).length;

  // ---- render content with **bold** support + personalisation + mirror moment ----
  const renderContent = (text: string) => {
    const firstName = manlawMemberName || "Builder";
    // Replace placeholders
    const processed = text
      .replace("[[PERSONAL_OPENING]]",
        `**Welcome, ${firstName}. This session was written for you.**

What you are about to read is not theory. It is a mirror. It describes the life of millions of employed South Africans who work hard, pay their bills, and still quietly wonder if this is all there is. Read slowly. Be honest with yourself. Nothing here is meant to shame you — everything here is meant to free you.`)
      .replace("[[MIRROR_MOMENT]]", "[[MIRROR_MOMENT]]"); // handled separately below

    return processed.split("\n\n").map((para, i) => {
      if (para === "[[OBJECTION_DISSOLVER]]") {
        return <ObjectionDissolver key={i} firstName={firstName} />;
      }

      if (para === "[[CIRCLE_OF_TWELVE]]") {
        return <CircleOfTwelve key={i} firstName={firstName} />;
      }

      if (para === "[[SWOT_BUILDER]]") {
        return <SwotBuilder key={i} firstName={firstName} />;
      }

      if (para === "[[VISION_GATE]]") {
        return <VisionGate key={i} firstName={firstName} />;
      }

      if (para === "[[COMMUNITY_PREVIEW]]") {
        return <CommunityPreview key={i} firstName={firstName} />;
      }

      if (para === "[[ASSET_AUDIT]]") {
        return <AssetAudit key={i} firstName={firstName} />;
      }

      if (para === "[[IDENTITY_SELECTOR]]") {
        return <IdentitySelector key={i} firstName={firstName} />;
      }

      if (para === "[[MONTH_CHECK]]") {
        return <MonthCheckQuiz key={i} firstName={firstName} />;
      }

      if (para === "[[MIRROR_MOMENT]]") {
        return (
          <div key={i} style={{
            background: "linear-gradient(135deg, #1A0035, #0D0020)",
            border: "2px solid #D4AF37", borderRadius: "16px",
            padding: "24px", margin: "24px 0",
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "6px" }}>
              🪞 Mirror Moment
            </div>
            <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px" }}>
              Be honest. Tick every statement that reflects your current reality:
            </div>
            {mirrorQuestions.map((q, qi) => (
              <div key={qi} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                marginBottom: "14px", cursor: "pointer",
              }}
                onClick={() => !mirrorSubmitted && setMirrorAnswers(prev => ({ ...prev, [qi]: !prev[qi] }))}
              >
                <div style={{
                  width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                  background: mirrorAnswers[qi] ? "#D4AF37" : "rgba(255,255,255,0.1)",
                  border: `2px solid ${mirrorAnswers[qi] ? "#D4AF37" : "rgba(255,255,255,0.3)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "bold", color: "#000",
                }}>
                  {mirrorAnswers[qi] ? "✓" : ""}
                </div>
                <div style={{ fontSize: "14px", color: "#fff", lineHeight: 1.6 }}>{q}</div>
              </div>
            ))}
            {!mirrorSubmitted ? (
              <button
                onClick={() => setMirrorSubmitted(true)}
                style={{
                  marginTop: "12px", background: "linear-gradient(135deg, #B8860B, #D4AF37)",
                  color: "#000", border: "none", borderRadius: "10px",
                  padding: "10px 28px", fontWeight: "bold", fontSize: "14px", cursor: "pointer",
                }}
              >
                See My Result
              </button>
            ) : (
              <div style={{
                marginTop: "16px", background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.4)", borderRadius: "12px", padding: "16px",
              }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
                  {mirrorScore >= 4
                    ? `${firstName}, this workshop was built for exactly where you are.`
                    : mirrorScore >= 2
                    ? `${firstName}, you are already questioning the system. That awareness is your first asset.`
                    : `${firstName}, you are further along than most. This workshop will sharpen what you already sense.`}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.8)", lineHeight: 1.7 }}>
                  {mirrorScore >= 4
                    ? "You ticked " + mirrorScore + " out of 5. You are not alone. Millions of employed South Africans live exactly this reality. The difference between those who stay here and those who escape is not luck — it is positioning. That is what this workshop changes."
                    : mirrorScore >= 2
                    ? "You ticked " + mirrorScore + " out of 5. You feel the friction. The next 8 sessions will show you exactly why that friction exists and what to do about it."
                    : "You ticked " + mirrorScore + " out of 5. Your foundation is more stable than most. Now it is time to build leverage on top of it."}
                </div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
                  Continue reading below. Session 2 will show you exactly why this happens. 
                </div>
              </div>
            )}
          </div>
        );
      }
      if (para.startsWith("**") && para.endsWith("**")) {
        return <h3 key={i} style={S.sectionH3}>{para.replace(/\*\*/g, "")}</h3>;
      }
      const formatted = para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} style={S.para} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  // ============================================================
  // ── Email gate — show before anything else ──
  if (!workshopEmail) {
    return (
      <WorkshopEmailGate
        onEnter={(email) => {
          setWorkshopEmail(email);
          // Also pre-fill manlawMemberName from localStorage if available
          const savedName = typeof window !== "undefined"
            ? localStorage.getItem("z2b_workshop_first_name") || ""
            : "";
          if (savedName) setManlawMemberName(savedName);
        }}
      />
    );
  }

  // RENDER VIEWS
  // ============================================================
  // ── Prospect registration gate — shown to new visitors arriving via referral link ──
  // Replaces the old WelcomeOverlay. Records name + whatsapp + email,
  // locks referred_by sponsor permanently, adds to builder's funnel pipeline.
  const welcomeOverlay = showWelcome && urlRef ? (
    <ProspectRegistrationGate
      sponsorRef={urlRef}
      sponsorName={inviterName}
      onComplete={() => setShowWelcome(false)}
    />
  ) : null;

  if (view === "home") return (
    <>
      {welcomeOverlay}
      <HomeView setView={setView} completedCount={completedCount} freeCompleted={freeCompleted} />
    </>
  );
  if (view === "paywall") return <PaywallView setView={setView} />;

  if (view === "results" && section) return (
    <div style={S.page}>
      {showShareCard && (
        <ShareCard
          sectionId={currentSection!}
          sectionTitle={section.title}
          score={score ?? 0}
          builderRef={builderRef}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* ── Purple Cow Share Tool — always available while reading ── */}
      <PurpleCowShareTool
        builderRef={builderRef}
        builderName={manlawMemberName}
      />
      <div style={S.resultCard}>
        <div style={{ fontSize: "64px", marginBottom: "8px", animation: "bounce 0.6s" }}>🏆</div>
        <div style={{ fontSize: "22px", marginBottom: "12px", letterSpacing: "6px" }}>🎊 🎉 🎊</div>
        <h2 style={S.resultTitle}>Session {currentSection} Complete!</h2>
        <p style={S.resultSub}>{section.title}</p>
        <div style={S.scoreCircle}>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>{score}/5</span>
        </div>
        <div style={{ fontSize: "28px", margin: "8px 0 4px" }}>
          {score === 5 ? "⭐⭐⭐⭐⭐" : score != null && score >= 3 ? "⭐⭐⭐" : "⭐⭐"}
        </div>
        <p style={S.scoreLabel}>
          {score === 5
            ? "🔥 Perfect Score! Outstanding Builder!"
            : score != null && score >= 3
            ? "✅ Well Done, Builder! Keep going!"
            : "📚 Good effort — review the section again for deeper understanding."}
        </p>
        <div style={{ background: "#D97706", color: "#fff", borderRadius: "20px", padding: "6px 20px", fontSize: "12px", fontWeight: "bold", display: "inline-block", marginBottom: "20px" }}>
          Day {currentSection} of 99 · {Math.round(((currentSection ?? 0) / 99) * 100)}% Complete
        </div>
        <div style={{ background: "#F3E8FF", border: "2px solid #C4B5FD", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", fontWeight: "bold", color: "#6B21A8", margin: "0 0 6px" }}>
            🚀 Challenge Your Friends!
          </p>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 12px" }}>
            Share your win on WhatsApp, Facebook & TikTok — and dare them to start their free workshop
          </p>
          <button style={{ ...S.btnGold, width: "100%", padding: "12px" }} onClick={() => setShowShareCard(true)}>
            🎉 Share My Achievement Card
          </button>
        </div>
        {/* ── UPGRADE NUDGE after Sessions 3, 6 and 9 ── */}
        {[3, 6, 9].includes(currentSection ?? 0) && (
          <div style={{
            background: "linear-gradient(135deg, #1A0035, #2D0060)",
            border: "2px solid #D4AF37",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {currentSection === 3 ? "🔓" : currentSection === 6 ? "🏆" : "🚀"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
              {currentSection === 3 && "You've completed your first milestone!"}
              {currentSection === 6 && "Your Vision Board is unlocked — now unlock the full journey!"}
              {currentSection === 9 && "You've finished the FREE preview — your transformation is just beginning!"}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.85)", marginBottom: "16px", lineHeight: 1.6 }}>
              {currentSection === 3 && "Sessions 4–99 are waiting. Every session builds on the last. Upgrade now and keep the momentum going."}
              {currentSection === 6 && "You've seen vision and strategy. Sessions 7–99 cover systems, income streams, and legacy building. Don't stop here."}
              {currentSection === 9 && "99 sessions. One transformation. Builders who complete all 99 sessions earn lifetime commissions and community access. Pull up your chair."}
            </div>
            <a
              href="/pricing"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #B8860B, #D4AF37)",
                color: "#000",
                padding: "12px 32px",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "14px",
                textDecoration: "none",
                letterSpacing: "0.5px",
              }}
            >
              ⬆️ See Membership Plans
            </a>
            <div style={{ marginTop: "10px", fontSize: "11px", color: "rgba(196,181,253,0.5)" }}>
              Once-off lifetime membership from R480 — pay once, earn forever
            </div>
          </div>
        )}

        <div style={S.resultBtnRow}>
          {currentSection != null && currentSection < 9 && (
            <button style={S.btnGold} onClick={() => { setShowShareCard(false); openSection(currentSection + 1); }}>
              Next Session →
            </button>
          )}
          <button style={S.btnOutline} onClick={() => setView("workshop")}>
            Back to Workshop
          </button>
          <button style={S.backBtn} onClick={() => setView("home")}>
            🏠 Home
          </button>
        </div>
        {/* ── COACH MANLAW PANEL ── */}
        <div style={{
          background: "#0D0020", border: "2px solid #9333EA",
          borderRadius: "20px", padding: "0", marginBottom: "24px",
          overflow: "hidden", boxShadow: "0 0 40px rgba(147,51,234,0.3)",
        }}>
          {/* Header */}
          <div
            style={{ background: "linear-gradient(135deg, #6B21A8, #9333EA)", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            onClick={() => setManlawOpen(o => !o)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(212,175,55,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🧠</div>
              <div>
                <div style={{ color: "#D4AF37", fontWeight: "bold", fontSize: "15px", letterSpacing: "1px" }}>Coach Manlaw</div>
                <div style={{ color: "rgba(196,181,253,0.8)", fontSize: "11px" }}>Your AI Business Coach · Z2B Intelligence</div>
              </div>
            </div>
            <div style={{ color: "#D4AF37", fontSize: "20px" }}>{manlawOpen ? "▼" : "▲"}</div>
          </div>

          {manlawOpen && (
            <div style={{ padding: "0" }}>
              {/* Messages */}
              <div style={{ maxHeight: "320px", overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {manlawMessages.length === 0 && (
                  <div style={{ textAlign: "center", color: "rgba(196,181,253,0.5)", fontSize: "13px", padding: "20px" }}>
                    Coach Manlaw is preparing your coaching session...
                  </div>
                )}
                {manlawMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    gap: "10px", alignItems: "flex-start",
                  }}>
                    {msg.role === "manlaw" && (
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #6B21A8, #9333EA)", border: "1px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🧠</div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "80%" }}>
                      <div style={{
                        padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: msg.role === "user" ? "linear-gradient(135deg, #9333EA, #7C3AED)" : "rgba(255,255,255,0.07)",
                        border: msg.role === "manlaw" ? "1px solid rgba(212,175,55,0.3)" : "none",
                        color: "#fff", fontSize: "14px", lineHeight: 1.7,
                      }}>
                        {msg.text}
                      </div>
                      {msg.role === "manlaw" && (
                        <ManlawVoice text={msg.text} />
                      )}
                    </div>
                  </div>
                ))}
                {manlawLoading && (
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #6B21A8, #9333EA)", border: "1px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🧠</div>
                    <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(212,175,55,0.3)", color: "rgba(196,181,253,0.7)", fontSize: "14px" }}>
                      Coach Manlaw is thinking<span style={{ animation: "pulse 1s infinite" }}>...</span>
                    </div>
                  </div>
                )}
                <div ref={manlawEndRef} />
              </div>

              {/* Suggested prompts */}
              {manlawMessages.length <= 2 && !manlawLoading && (
                <div style={{ padding: "0 16px 12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["How does this connect to my vision?", "I am struggling with this concept.", "What action should I take today?"].map((prompt, i) => (
                    <button key={i} onClick={() => { setManlawInput(prompt); }}
                      style={{ background: "rgba(147,51,234,0.2)", border: "1px solid rgba(147,51,234,0.5)", borderRadius: "20px", padding: "6px 14px", color: "rgba(196,181,253,0.9)", fontSize: "12px", cursor: "pointer" }}>
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(147,51,234,0.3)", display: "flex", gap: "10px" }}>
                <input
                  value={manlawInput}
                  onChange={e => setManlawInput((e.target as HTMLInputElement).value)}
                  onKeyDown={e => { if (e.key === "Enter") sendManlawMessage(); }}
                  placeholder="Respond to Coach Manlaw..."
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(147,51,234,0.5)",
                    borderRadius: "12px", padding: "10px 16px", color: "#fff", fontSize: "14px", outline: "none",
                  }}
                />
                <button
                  onClick={sendManlawMessage}
                  disabled={manlawLoading || !manlawInput.trim()}
                  style={{
                    background: "linear-gradient(135deg, #D4AF37, #B8860B)", border: "none",
                    borderRadius: "12px", padding: "10px 18px", color: "#000", fontWeight: "bold",
                    fontSize: "14px", cursor: manlawLoading ? "not-allowed" : "pointer", opacity: manlawLoading ? 0.5 : 1,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <a
            href="https://app.z2blegacybuilders.co.za/pricing"
            style={{ fontSize: "13px", color: "#6B21A8", fontWeight: "bold", textDecoration: "none", borderBottom: "2px solid #C4B5FD", paddingBottom: "2px" }}
          >
            ⬆️ Ready to unlock all 99 sessions? View Pricing →
          </a>
        </div>
      </div>
    </div>
  );

  if (view === "workshop") return (
    <div style={S.page}>
      <div style={S.workshopHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
          <button style={S.backBtn} onClick={() => setView("home")}>← Workshop Home</button>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a href="/vision-board" style={{ background: "linear-gradient(135deg, #B8860B, #D4AF37)", color: "#000", border: "none", padding: "7px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer", textDecoration: "none" }}>🏆 Vision Board</a>
            <a href="/pricing" style={{ background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer", textDecoration: "none" }}>⬆️ Upgrade</a>
            <a href="/" style={{ background: "transparent", color: "#6B21A8", border: "1px solid #6B21A8", padding: "7px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer", textDecoration: "none" }}>🏠 Home</a>
          </div>
        </div>
        <h1 style={S.workshopTitle}>The Entrepreneurial Consumer Workshop</h1>
        <p style={S.workshopSub}>A 99-Session Transformation Journey</p>
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: `${(completedCount / 99) * 100}%` }} />
        </div>
        <p style={S.progressText}>{completedCount}/99 Sessions Completed</p>
      </div>

      {/* ── MORNING SESSIONS ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "28px" }}>🌅</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#1e1b4b" }}>
              EC Morning Workshop
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              Entrepreneurial Consumer Daily Briefing · Audio only · Listen &amp; go · No tasks
            </p>
          </div>
        </div>
        <div style={S.sectionGrid}>
          {MORNING_SESSIONS.map((ms) => (
            <div key={`m${ms.id}`}
              style={{
                ...S.sectionCard,
                background: "linear-gradient(135deg,#fffbea,#fef9e7)",
                border: "2px solid #D4AF37",
                cursor: "pointer",
              }}
              onClick={() => openMorningSession(ms.id)}
            >
              <div style={{ ...S.cardNum, background: "linear-gradient(135deg,#D4AF37,#fbbf24)", color: "#78350f" }}>
                {ms.id}
              </div>
              <div style={S.cardInfo}>
                <div style={{ ...S.cardTitle, color: "#78350f" }}>{ms.title}</div>
                <div style={S.cardSub}>{ms.subtitle}</div>
                <span style={{ ...S.freeBadge, background: "#D4AF37", color: "#78350f" }}>🌅 MORNING</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EVENING SESSIONS ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "8px 16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", marginTop: "16px" }}>
          <span style={{ fontSize: "28px" }}>🌙</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#1e1b4b" }}>
              EC Evening Workshop
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              9 Free Sessions · Mirror, Comprehension &amp; Activity · Sessions 10–99 for paid members
            </p>
          </div>
        </div>
        <div style={S.sectionGrid}>
          {SECTIONS.map((sec) => {
            const done     = progress[sec.id]?.completed ?? false;
            const unlocked = isSectionUnlocked(sec.id);
            const isNext   = sec.free && !done && unlocked;
            return (
              <div
                key={sec.id}
                style={{
                  ...S.sectionCard,
                  ...(done    ? S.cardDone   : {}),
                  ...(!sec.free ? S.cardLocked : {}),
                  ...(isNext  ? S.cardNext   : {}),
                  cursor: (unlocked || done) ? "pointer" : "default",
                }}
                onClick={() => {
                  if (!sec.free) { setView("paywall"); return; }
                  if (unlocked || done) openSection(sec.id);
                }}
              >
                <div style={S.cardNum}>{done ? "✓" : !sec.free ? "🔒" : sec.id}</div>
                <div style={S.cardInfo}>
                  <div style={S.cardTitle}>{sec.title}</div>
                  <div style={S.cardSub}>{sec.subtitle}</div>
                  {sec.free && <span style={S.freeBadge}>FREE</span>}
                  {done && <span style={S.doneBadge}>✓ Done · {progress[sec.id]?.score}/5</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── MORNING SESSION VIEW ──
  if ((view as any) === "morning" && morningSession) return (
    <div style={S.page}>
      <div style={S.sectionTopBar}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={S.backBtn} onClick={() => setView("home")}>← Workshop</button>
          <button style={S.backBtn} onClick={() => setView("workshop")}>← Workshop</button>
        </div>
        <span style={{ ...S.sectionBadge, background: "linear-gradient(135deg,#D4AF37,#fbbf24)", color: "#78350f" }}>
          🌅 Morning Session {morningSession.id} of 9
        </span>
      </div>

      <div style={{ ...S.sectionHero, background: "linear-gradient(135deg,#78350f,#92400e,#78350f)" }}>
        <div style={{ ...S.sectionNum, background: "rgba(212,175,55,0.2)", color: "#D4AF37", border: "2px solid #D4AF37" }}>
          🌅 {morningSession.id}
        </div>
        <h1 style={{ ...S.sectionTitle, color: "#fff" }}>{morningSession.title}</h1>
        <p style={{ ...S.sectionSubtitle, color: "#FDE68A" }}>{morningSession.subtitle}</p>
        <span style={{ display: "inline-block", marginTop: "8px", fontSize: "11px", padding: "4px 12px", borderRadius: "20px", background: "rgba(212,175,55,0.2)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)", fontWeight: "bold", letterSpacing: "1px" }}>
          EC MORNING WORKSHOP · AUDIO ONLY · NO TASKS
        </span>
      </div>

      {/* Audio toggle */}
      <div style={{ maxWidth: "760px", margin: "0 auto 8px", padding: "0 20px", display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{ ...S.backBtn, background: showMorningAudio ? "#1E1B2E" : "#FEF3C7", color: showMorningAudio ? "#C4B5FD" : "#92400E", border: showMorningAudio ? "1.5px solid #6B21A8" : "1.5px solid #D4AF37" }}
          onClick={() => setShowMorningAudio(!showMorningAudio)}
        >
          🎙️ {showMorningAudio ? "Hide Audio" : "Listen to Session"}
        </button>
      </div>

      {showMorningAudio && <AudioPlayer text={morningSession.content} sectionTitle={morningSession.title} />}

      {/* Content — read only, no scroll lock, no questions */}
      <div style={{ ...S.contentCard, maxHeight: "none", overflow: "visible" }}>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "15px", color: "#1f2937" }}>
          {morningSession.content}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "16px 20px 40px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const }}>
        {morningSession.id > 1 && (
          <button style={{ ...S.backBtn, padding: "10px 20px" }}
            onClick={() => openMorningSession(morningSession.id - 1)}>
            ← Morning {morningSession.id - 1}
          </button>
        )}
        <div style={{ flex: 1 }}/>
        {morningSession.id < 9 && (
          <button
            style={{ background: "linear-gradient(135deg,#D4AF37,#fbbf24)", color: "#78350f", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: "900", fontSize: "14px", cursor: "pointer" }}
            onClick={() => openMorningSession(morningSession.id + 1)}>
            Morning {morningSession.id + 1} →
          </button>
        )}
        {morningSession.id === 9 && (
          <button
            style={{ background: "linear-gradient(135deg,#6B21A8,#9333EA)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: "900", fontSize: "14px", cursor: "pointer" }}
            onClick={() => setView("workshop")}>
            Go to Evening Sessions →
          </button>
        )}
      </div>
    </div>
  );

  if (view === "section" && section) return (
    <div style={S.page}>
      <div style={S.sectionTopBar}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={S.backBtn} onClick={() => setView("home")}>← Workshop</button>
          <button style={S.backBtn} onClick={() => setView("workshop")}>← Workshop</button>
        </div>
        <span style={S.sectionBadge}>Day {section.id} of 99</span>
        {section.free && <span style={S.freeBadge}>FREE</span>}
      </div>

      <div style={S.sectionHero}>
        <div style={S.sectionNum}>Session {section.id}</div>
        <h1 style={S.sectionTitle}>{section.title}</h1>
        <p style={S.sectionSubtitle}>{section.subtitle}</p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto 8px", padding: "0 20px", display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{ ...S.backBtn, background: showAudio ? "#1E1B2E" : "#F3E8FF", color: showAudio ? "#C4B5FD" : "#6B21A8", border: showAudio ? "1.5px solid #6B21A8" : "1.5px solid #C4B5FD" }}
          onClick={() => setShowAudio(!showAudio)}
        >
          🎙️ {showAudio ? "Hide Audio" : "Listen to Session"}
        </button>
      </div>

      {showAudio && <AudioPlayer text={section.content} sectionTitle={section.title} />}

      <div style={S.contentCard} ref={contentRef} onScroll={handleScroll}>
        <div>{renderContent(section.content)}</div>
        {!scrolledToBottom && (
          <div style={S.scrollHint}>↓ Read to the bottom to unlock the questions</div>
        )}
      </div>

      {scrolledToBottom && (
        <>
          <div style={S.quizCard}>
            <div style={S.quizHeader}>📝 Comprehension Check — 5 Questions</div>
            <p style={S.quizSub}>Answer all 5 questions to proceed to the next section.</p>

            {section.questions.map((q, qi) => (
              <div key={qi} style={S.question}>
                <p style={S.qText}><strong>Q{qi + 1}:</strong> {q.q}</p>
                {q.options.map((opt, oi) => {
                  let btnStyle: CSSProperties = { ...S.optionBtn };
                  if (submitted) {
                    if (oi === q.answer)        btnStyle = { ...S.optionBtn, ...S.optionCorrect };
                    else if (answers[qi] === oi) btnStyle = { ...S.optionBtn, ...S.optionWrong   };
                  } else if (answers[qi] === oi) {
                    btnStyle = { ...S.optionBtn, ...S.optionSelected };
                  }
                  return (
                    <button key={oi} style={btnStyle} onClick={() => handleAnswer(qi, oi)}>
                      <span style={S.optionLetter}>{["A", "B", "C", "D"][oi]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            ))}

            {!submitted && (
              <button
                style={{ ...S.btnGold, opacity: Object.keys(answers).length < 5 ? 0.5 : 1 }}
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < 5}
              >
                Submit Answers
              </button>
            )}

            {submitted && (
              <div style={S.scoreBox}>
                <p style={S.scoreResult}>
                  Your Score: <strong>{score}/5</strong> —{" "}
                  {score === 5 ? "🏆 Perfect!" : score != null && score >= 3 ? "✅ Well Done!" : "📚 Review and try again"}
                </p>
                {score != null && score >= 3 && activityTicked && (
                  <button style={S.btnGold} onClick={handleComplete}>
                    Mark Session Complete &amp; Continue →
                  </button>
                )}
                {score != null && score < 3 && (
                  <button style={S.btnOutline} onClick={() => { setAnswers({}); setSubmitted(false); setScore(null); }}>
                    Try Again
                  </button>
                )}
                {score != null && score >= 3 && !activityTicked && (
                  <p style={S.hint}>☝️ Please complete the transformation activity below to proceed.</p>
                )}
              </div>
            )}
          </div>

          {/* Activity comes LAST — after reading and quiz */}
          <div style={S.activityCard}>
            <div style={S.activityHeader}>📋 Your Transformation Activity</div>
            <p style={S.activityText}>{section.activity}</p>
            <label style={S.checkLabel}>
              <input
                type="checkbox"
                checked={activityTicked}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivityTicked(e.target.checked)}
                style={S.checkbox}
              />
              <span>
                <strong>I am true to myself — I have completed this activity.</strong> I understand that this workshop transforms those who do the work, not those who skip it. My results will reflect my honesty here.
              </span>
            </label>
            {activityTicked && submitted && score != null && score >= 3 && (
              <button style={{ ...S.btnGold, marginTop: "16px" }} onClick={handleComplete}>
                Mark Session Complete &amp; Continue →
              </button>
            )}
            <p style={{ fontSize: "12px", color: "#92400E", fontStyle: "italic", marginTop: "12px", borderTop: "1px solid #FCD34D", paddingTop: "10px" }}>
              "The seeds you plant in private determine the harvest you reap in public." — Rev Mokoro Manana
            </p>
          </div>
        </>
      )}
    </div>
  );

  return null;
}

export default function WorkshopPage() {
  return (
    <React.Suspense fallback={<div style={{ background: "#0A0015", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37", fontSize: "18px" }}>Loading Workshop...</div>}>
      <WorkshopInner />
    </React.Suspense>
  );
}