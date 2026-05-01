// FILE: components/Z2BPlatformDiagram.tsx
// Z2B Platform visual explainer — works on ANY background (dark or light)

import React from 'react'

export default function Z2BPlatformDiagram() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '860px',
      margin: '0 auto',
      background: '#050A18',
      borderRadius: '20px',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <svg
        width="100%"
        viewBox="0 0 680 700"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <title>Z2B Legacy Builders — How the platform works</title>
        <desc>Employee joins Z2B, uses the 4M Machine and Coach Manlaw to create digital products, lists on the marketplace, and earns through 9 income streams.</desc>

        <defs>
          <marker id="za" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>

        {/* ── SLOGAN ── */}
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="340" y="26" textAnchor="middle">
          If they underpay you and do not want to employ you, deploy yourself.
        </text>

        {/* ════ ROW 1: EMPLOYEE → Z2B → BUILDER ════ */}

        {/* Employee */}
        <rect x="30" y="44" width="128" height="68" rx="10" fill="#1A1040" stroke="#4B3F8A" strokeWidth="1"/>
        <text fill="#C4B8F0" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="94" y="70" textAnchor="middle">Employee</text>
        <text fill="#7B6FC0" fontFamily="Georgia,serif" fontSize="10" x="94" y="88" textAnchor="middle">Underpaid · Stuck</text>
        <text fill="#7B6FC0" fontFamily="Georgia,serif" fontSize="10" x="94" y="103" textAnchor="middle">No income control</text>

        {/* Arrow */}
        <line x1="160" y1="78" x2="200" y2="78" stroke="#D4AF37" strokeWidth="1.5" markerEnd="url(#za)"/>
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="9" x="180" y="72" textAnchor="middle">joins</text>

        {/* Z2B */}
        <rect x="202" y="44" width="196" height="68" rx="10" fill="#1C1400" stroke="#D4AF37" strokeWidth="1.2"/>
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="300" y="70" textAnchor="middle">Z2B Legacy Builders</text>
        <text fill="#A07820" fontFamily="Georgia,serif" fontSize="10" x="300" y="88" textAnchor="middle">AI tools · 9 income streams</text>
        <text fill="#A07820" fontFamily="Georgia,serif" fontSize="10" x="300" y="103" textAnchor="middle">Community · Marketplace</text>

        {/* Arrow */}
        <line x1="400" y1="78" x2="440" y2="78" stroke="#06B6D4" strokeWidth="1.5" markerEnd="url(#za)"/>
        <text fill="#06B6D4" fontFamily="Georgia,serif" fontSize="9" x="420" y="72" textAnchor="middle">becomes</text>

        {/* Builder */}
        <rect x="442" y="44" width="208" height="68" rx="10" fill="#001820" stroke="#06B6D4" strokeWidth="1.2"/>
        <text fill="#06B6D4" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="546" y="70" textAnchor="middle">Builder</text>
        <text fill="#0A8A9A" fontFamily="Georgia,serif" fontSize="10" x="546" y="88" textAnchor="middle">Deployed · Earning</text>
        <text fill="#0A8A9A" fontFamily="Georgia,serif" fontSize="10" x="546" y="103" textAnchor="middle">Without quitting their job</text>

        {/* ── DIVIDER ── */}
        <line x1="30" y1="128" x2="650" y2="128" stroke="#2A2060" strokeWidth="0.8"/>

        {/* ════ ROW 2: 4M MACHINE ════ */}
        <text fill="#F0F0FF" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="340" y="150" textAnchor="middle">
          The 4M Machine — your deployment engine
        </text>

        {/* Manual */}
        <rect x="30" y="160" width="143" height="84" rx="8" fill="#140C2A" stroke="#8B5CF6" strokeWidth="1"/>
        <text fill="#A78BFA" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="102" y="182" textAnchor="middle">🚗 Manual</text>
        <text fill="#6B50B0" fontFamily="Georgia,serif" fontSize="10" x="102" y="200" textAnchor="middle">Phone + WhatsApp</text>
        <text fill="#6B50B0" fontFamily="Georgia,serif" fontSize="10" x="102" y="216" textAnchor="middle">First R500 in 14 days</text>
        <text fill="#4A3880" fontFamily="Georgia,serif" fontSize="9" x="102" y="232" textAnchor="middle">Free → Copper</text>

        {/* Arrow */}
        <line x1="175" y1="202" x2="190" y2="202" stroke="#555" strokeWidth="1.2" markerEnd="url(#za)"/>

        {/* Automatic */}
        <rect x="192" y="160" width="143" height="84" rx="8" fill="#061428" stroke="#3B82F6" strokeWidth="1"/>
        <text fill="#93C5FD" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="264" y="182" textAnchor="middle">⚙️ Automatic</text>
        <text fill="#3B6090" fontFamily="Georgia,serif" fontSize="10" x="264" y="200" textAnchor="middle">7 AI automation tools</text>
        <text fill="#3B6090" fontFamily="Georgia,serif" fontSize="10" x="264" y="216" textAnchor="middle">System earns for you</text>
        <text fill="#2A4870" fontFamily="Georgia,serif" fontSize="9" x="264" y="232" textAnchor="middle">Silver tier</text>

        {/* Arrow */}
        <line x1="337" y1="202" x2="352" y2="202" stroke="#555" strokeWidth="1.2" markerEnd="url(#za)"/>

        {/* Electric */}
        <rect x="354" y="160" width="143" height="84" rx="8" fill="#1C1400" stroke="#D4AF37" strokeWidth="1"/>
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="426" y="182" textAnchor="middle">⚡ Electric</text>
        <text fill="#8A6A10" fontFamily="Georgia,serif" fontSize="10" x="426" y="200" textAnchor="middle">AI creates products</text>
        <text fill="#8A6A10" fontFamily="Georgia,serif" fontSize="10" x="426" y="216" textAnchor="middle">Create once. Sell always.</text>
        <text fill="#6A5010" fontFamily="Georgia,serif" fontSize="9" x="426" y="232" textAnchor="middle">Gold → Platinum</text>

        {/* Arrow */}
        <line x1="499" y1="202" x2="514" y2="202" stroke="#555" strokeWidth="1.2" markerEnd="url(#za)"/>

        {/* Rocket */}
        <rect x="516" y="160" width="134" height="84" rx="8" fill="#001820" stroke="#06B6D4" strokeWidth="1"/>
        <text fill="#06B6D4" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="583" y="182" textAnchor="middle">🚀 Rocket</text>
        <text fill="#0A7080" fontFamily="Georgia,serif" fontSize="10" x="583" y="200" textAnchor="middle">Scale globally</text>
        <text fill="#0A7080" fontFamily="Georgia,serif" fontSize="10" x="583" y="216" textAnchor="middle">No ceiling</text>
        <text fill="#085060" fontFamily="Georgia,serif" fontSize="9" x="583" y="232" textAnchor="middle">Rocket tiers</text>

        {/* ── DIVIDER ── */}
        <line x1="30" y1="260" x2="650" y2="260" stroke="#2A2060" strokeWidth="0.8"/>

        {/* ════ ROW 3: HOW IT WORKS ════ */}
        <text fill="#F0F0FF" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="340" y="282" textAnchor="middle">How it works inside</text>

        {/* Coach Manlaw */}
        <rect x="30" y="292" width="190" height="108" rx="8" fill="#140C2A" stroke="#8B5CF6" strokeWidth="1"/>
        <text fill="#A78BFA" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="125" y="314" textAnchor="middle">Coach Manlaw</text>
        <text fill="#7B5FD0" fontFamily="Georgia,serif" fontSize="10" x="125" y="332" textAnchor="middle">AI business coach</text>
        <text fill="#7B5FD0" fontFamily="Georgia,serif" fontSize="10" x="125" y="350" textAnchor="middle">Creates digital products</text>
        <text fill="#7B5FD0" fontFamily="Georgia,serif" fontSize="10" x="125" y="368" textAnchor="middle">Writes offers + copy</text>
        <text fill="#5B45A0" fontFamily="Georgia,serif" fontSize="10" x="125" y="386" textAnchor="middle">Market research + audits</text>

        <line x1="222" y1="346" x2="244" y2="346" stroke="#D4AF37" strokeWidth="1.5" markerEnd="url(#za)"/>

        {/* Marketplace */}
        <rect x="246" y="292" width="190" height="108" rx="8" fill="#1C1400" stroke="#D4AF37" strokeWidth="1"/>
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="341" y="314" textAnchor="middle">Z2B Marketplace</text>
        <text fill="#907020" fontFamily="Georgia,serif" fontSize="10" x="341" y="332" textAnchor="middle">List your digital products</text>
        <text fill="#907020" fontFamily="Georgia,serif" fontSize="10" x="341" y="350" textAnchor="middle">Builder keeps 90%</text>
        <text fill="#907020" fontFamily="Georgia,serif" fontSize="10" x="341" y="368" textAnchor="middle">Affiliates earn 20%</text>
        <text fill="#6A5010" fontFamily="Georgia,serif" fontSize="10" x="341" y="386" textAnchor="middle">No upline cut on products</text>

        <line x1="438" y1="346" x2="456" y2="346" stroke="#06B6D4" strokeWidth="1.5" markerEnd="url(#za)"/>

        {/* Influencer */}
        <rect x="458" y="292" width="192" height="108" rx="8" fill="#001820" stroke="#06B6D4" strokeWidth="1"/>
        <text fill="#06B6D4" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="554" y="314" textAnchor="middle">Influencer Partners</text>
        <text fill="#0A7080" fontFamily="Georgia,serif" fontSize="10" x="554" y="332" textAnchor="middle">Partner with creators</text>
        <text fill="#0A7080" fontFamily="Georgia,serif" fontSize="10" x="554" y="350" textAnchor="middle">Builder earns 30%</text>
        <text fill="#0A7080" fontFamily="Georgia,serif" fontSize="10" x="554" y="368" textAnchor="middle">Influencer earns 70%</text>
        <text fill="#085060" fontFamily="Georgia,serif" fontSize="10" x="554" y="386" textAnchor="middle">Copper tier and above</text>

        {/* ── DIVIDER ── */}
        <line x1="30" y1="416" x2="650" y2="416" stroke="#2A2060" strokeWidth="0.8"/>

        {/* ════ ROW 4: 9 INCOME STREAMS ════ */}
        <text fill="#F0F0FF" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" x="340" y="436" textAnchor="middle">9 income streams — stacked and recurring</text>

        {/* Row A */}
        <rect x="30"  y="446" width="92" height="30" rx="6" fill="#001820" stroke="#06B6D4" strokeWidth="0.8"/>
        <text fill="#06B6D4" fontFamily="Georgia,serif" fontSize="11" fontWeight="700" x="76"  y="465" textAnchor="middle">NSB</text>

        <rect x="130" y="446" width="92" height="30" rx="6" fill="#061428" stroke="#3B82F6" strokeWidth="0.8"/>
        <text fill="#93C5FD" fontFamily="Georgia,serif" fontSize="11" fontWeight="700" x="176" y="465" textAnchor="middle">ISP</text>

        <rect x="230" y="446" width="92" height="30" rx="6" fill="#140C2A" stroke="#8B5CF6" strokeWidth="0.8"/>
        <text fill="#A78BFA" fontFamily="Georgia,serif" fontSize="11" fontWeight="700" x="276" y="465" textAnchor="middle">QPB</text>

        <rect x="330" y="446" width="92" height="30" rx="6" fill="#1C1400" stroke="#D4AF37" strokeWidth="0.8"/>
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="11" fontWeight="700" x="376" y="465" textAnchor="middle">TSC</text>

        <rect x="430" y="446" width="92" height="30" rx="6" fill="#1A0020" stroke="#EC4899" strokeWidth="0.8"/>
        <text fill="#F9A8D4" fontFamily="Georgia,serif" fontSize="11" fontWeight="700" x="476" y="465" textAnchor="middle">TLI</text>

        <rect x="530" y="446" width="120" height="30" rx="6" fill="#001408" stroke="#10B981" strokeWidth="0.8"/>
        <text fill="#6EE7B7" fontFamily="Georgia,serif" fontSize="10" fontWeight="700" x="590" y="465" textAnchor="middle">CEO Competition</text>

        {/* Row B */}
        <rect x="30"  y="484" width="126" height="30" rx="6" fill="#001820" stroke="#06B6D4" strokeWidth="0.8"/>
        <text fill="#06B6D4" fontFamily="Georgia,serif" fontSize="10" fontWeight="700" x="93"  y="503" textAnchor="middle">CEO Awards</text>

        <rect x="164" y="484" width="188" height="30" rx="6" fill="#1C1400" stroke="#D4AF37" strokeWidth="0.8"/>
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="10" fontWeight="700" x="258" y="503" textAnchor="middle">Marketplace Income</text>

        <rect x="360" y="484" width="290" height="30" rx="6" fill="#140C2A" stroke="#8B5CF6" strokeWidth="0.8"/>
        <text fill="#A78BFA" fontFamily="Georgia,serif" fontSize="10" fontWeight="700" x="505" y="503" textAnchor="middle">Distribution Rights (Platinum)</text>

        {/* ── DIVIDER ── */}
        <line x1="30" y1="530" x2="650" y2="530" stroke="#2A2060" strokeWidth="0.8"/>

        {/* ── BRAND PROMISE ── */}
        <text fill="#E0E0FF" fontFamily="Georgia,serif" fontSize="13" fontWeight="700" x="340" y="558" textAnchor="middle">You do not need their permission to build income.</text>
        <text fill="#7B7BA0" fontFamily="Georgia,serif" fontSize="12" x="340" y="580" textAnchor="middle">You need the right tools.</text>
        <text fill="#D4AF37" fontFamily="Georgia,serif" fontSize="14" fontWeight="700" x="340" y="604" textAnchor="middle">We built them.</text>
        <text fill="#3A3860" fontFamily="Georgia,serif" fontSize="11" x="340" y="628" textAnchor="middle">app.z2blegacybuilders.co.za</text>

      </svg>
    </div>
  )
}
