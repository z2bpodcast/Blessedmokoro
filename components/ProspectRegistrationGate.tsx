"use client";
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

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

export default function ProspectRegistrationGate({
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
