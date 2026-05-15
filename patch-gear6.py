#!/usr/bin/env python3
"""
V3 Sprint 8 Stabilization Patch
Run from repo root: python3 patch-gear6.py
"""
import re

def patch_file(path, patches):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    original = content
    for old, new, label in patches:
        if old in content:
            content = content.replace(old, new, 1)
            print(f"  OK  {label}")
        else:
            print(f"  -- SKIP (already applied or not found): {label}")
    if content != original:
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        return True
    return False

# ── GEAR 6 ENGINE ─────────────────────────────────────────────
engine_patches = [
    (
        "  pkg:    DistributionPackage,\n  intent: IntentDefinition\n): Record<string, unknown> {\n  return {",
        "  pkg:    DistributionPackage | null,\n  intent: IntentDefinition\n): Record<string, unknown> | null {\n  if (!pkg?.listing) return null\n  return {",
        "buildSessionComplete null guard"
    ),
    (
        "Math.max(49,",
        "Math.max(99,",
        "Price floor R49 → R99"
    ),
    (
        "Check it out: [link]",
        "Check the link in my bio.",
        "WhatsApp [link] placeholder removed"
    ),
    (
        "  if (result.error) {\n    return { listing: params.currentListing, tokensUsed: result.tokensUsed, error: null }\n  }",
        "  if (result.error) {\n    console.warn('[gear6-engine] Adjustment API call failed — keeping current listing:', result.error)\n    return { listing: params.currentListing, tokensUsed: result.tokensUsed, error: null }\n  }",
        "adjustListing error logged"
    ),
]

# ── GEAR API ──────────────────────────────────────────────────
api_patches = [
    (
        "keywords:    listing.keywords,",
        "keywords:    JSON.stringify(listing.keywords ?? []),",
        "keywords JSON.stringify for JSONB"
    ),
    (
        "    const completionData = buildSessionComplete(pkg as any, intent as any)\n\n    // Advance gear and complete session",
        "    const completionData = buildSessionComplete(pkg as any, intent as any)\n\n    if (!completionData) {\n      return NextResponse.json({ error: 'Could not build completion data.' }, { status: 500 })\n    }\n\n    // Advance gear and complete session",
        "completionData null check before advanceGear"
    ),
]

# ── GEAR 6 PAGE ───────────────────────────────────────────────
page_patches = [
    (
        "    if (!pkg || !intent || !sessionId) return\n    setStep('confirming')",
        "    if (!pkg || !intent || !sessionId) return\n    if (!pkg.listing?.title?.trim() || !pkg.listing?.description?.trim()) {\n      setErrorMsg('Your listing is incomplete. Please adjust and try again.')\n      setStep('error')\n      return\n    }\n    setStep('confirming')",
        "handleConfirm listing validation"
    ),
    (
        "                  {pkg.socialPosts.map((post, i) => <SocialPostCard key={i} post={post} />)}",
        """                  {pkg.socialPosts.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'32px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize:'24px', marginBottom:'8px' }}>📣</div>
                      <div style={{ fontSize:'13px', color:MUTED }}>Social posts could not be generated this time.</div>
                    </div>
                  ) : (
                    pkg.socialPosts.map((post, i) => <SocialPostCard key={i} post={post} />)
                  )}""",
        "Social posts empty state"
    ),
    (
        "              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>Redirecting to dashboard...</div>",
        "              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Redirecting to dashboard...</div>\n              <a href=\"/dashboard\" style={{ fontSize:'12px', color:MUTED }}>Click here if not redirected</a>",
        "Manual dashboard link in live state"
    ),
]

print("Patching lib/v3/gear6-engine.ts")
patch_file("lib/v3/gear6-engine.ts", engine_patches)

print("\nPatching app/api/gear/[gear]/route.ts")
patch_file("app/api/gear/[gear]/route.ts", api_patches)

print("\nPatching app/ai-income/gear/6/page.tsx")
patch_file("app/ai-income/gear/6/page.tsx", page_patches)

print("\nDone! Run: git diff --stat")
