// ============================================================
// FILE LOCATION: components/PurpleCowShareTool.tsx
// USAGE: Import and drop anywhere in the workshop page
//        <PurpleCowShareTool builderRef={builderRef} builderName={builderFirstName} />
// ============================================================

"use client";
import { useState, useRef, useEffect, useCallback } from "react";

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
export default function PurpleCowShareTool({ builderRef, builderName }: PurpleCowShareToolProps) {
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
