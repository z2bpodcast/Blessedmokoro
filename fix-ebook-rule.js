var fs = require('fs');

// ── FIX 1: book-payment route — pass ebook choice in custom_str4 ──
var bp = fs.readFileSync('app/api/book-payment/route.ts', 'utf8');

// Add ebook_choice to request destructuring
bp = bp.replace(
  "const { fullName, email, phone, pkg, ref, password } = await req.json()",
  "const { fullName, email, phone, pkg, ref, password, ebook_choice } = await req.json()"
);

// Add 4M package properly
bp = bp.replace(
  "r700: { amount: '700.00', item: 'Zero2Billionaires Full Book System', tier: 'starter' },\n  r700_4m: { amount: '700.00', item: 'The 4M Machine — Complete eBook + Starter Pack', tier: 'starter' },",
  "r700:    { amount: '700.00', item: 'Zero2Billionaires Full Book System', tier: 'starter' },\n  r700_4m: { amount: '700.00', item: 'The 4M Machine — Complete eBook + Starter Pack', tier: 'starter' },"
);

// Pass ebook choice in custom_str4
bp = bp.replace(
  "custom_str3:  pkg,",
  "custom_str3:  pkg,\n      custom_str4:  ebook_choice || (pkg === 'r700_4m' ? '4m_machine' : 'zero2billionaires'),"
);

fs.writeFileSync('app/api/book-payment/route.ts', bp);
console.log('book-payment route updated');

// ── FIX 2: PayFast webhook — save ebook choice + Bronze unlocks both ──
var pf = fs.readFileSync('app/api/payfast/route.ts', 'utf8');

// Find where paid_tier is updated and add ebook logic
pf = pf.replace(
  "const userId    = params.custom_str1  // We pass user_id as custom_str1\n    const refCode   = params.custom_str2  // referral code as custom_str2",
  "const userId      = params.custom_str1  // user_id\n    const refCode     = params.custom_str2  // referral code\n    const pkg         = params.custom_str3  // package\n    const ebookChoice = params.custom_str4  // ebook choice"
);

// Add ebook choice to profile update
pf = pf.replace(
  "paid_tier:      newTier,",
  "paid_tier:      newTier,\n        ebook_choice:   ebookChoice || (pkg === 'r700_4m' ? '4m_machine' : 'zero2billionaires'),"
);

// Add Bronze+ unlock of second ebook
var bronzeUnlock = `
    // Bronze+ gets BOTH ebooks
    if (['bronze','copper','silver','gold','platinum'].includes(newTier)) {
      await supabase.from('profiles')
        .update({ ebook_choice: 'both' })
        .eq('id', userId)
    }
`;

pf = pf.replace(
  "const newTier = AMOUNT_TO_TIER[amount] || 'bronze'",
  "const newTier = AMOUNT_TO_TIER[amount] || 'bronze'\n" + bronzeUnlock
);

fs.writeFileSync('app/api/payfast/route.ts', pf);
console.log('payfast webhook updated');
