var fs = require('fs');
var c = fs.readFileSync('app/ai-income/page.tsx', 'utf8');

// Nav — non-member CTA
c = c.replace(
  "Start from R700 →\n            </Link>",
  "Join Free →\n            </Link>"
);

// Hero — non-member CTAs
c = c.replace(
  `<Link href="/ai-income/choose-plan" style={{ padding: '14px 36px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Start from R700 →
              </Link>
              <Link href="/pricing" style={{ padding: '14px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '14px', textDecoration: 'none' }}>
                View all packages
              </Link>`,
  `<Link href="/register" style={{ padding: '14px 36px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Join Free →
              </Link>
              <Link href="/pricing" style={{ padding: '14px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '14px', textDecoration: 'none' }}>
                Compare Packages →
              </Link>`
);

// Final CTA — non-member
c = c.replace(
  "Deploy Yourself — Start from R700 →",
  "Join Free →"
);

fs.writeFileSync('app/ai-income/page.tsx', c);
console.log('Done');
