var fs = require('fs');
var y = fs.readFileSync('app/api/yoco/route.ts', 'utf8');

// Replace the ISP-only sponsor logic with full TSC/TLI + BFM gate
var OLD = `      // ISP commission for sponsor — full comp plan applies
      if (refCode) {
        const { data: sponsor } = await supabase
          .from('profiles')
          .select('id, paid_tier, full_name')
          .eq('referral_code', refCode)
          .single()

        if (sponsor) {
          const ispAmount = amountRands * (ISP_RATES[sponsor.paid_tier] || 0.10)

          await supabase.from('comp_earnings').insert({
            user_id:        sponsor.id,
            builder_name:   sponsor.full_name,
            earning_type:   'ISP',
            amount:         ispAmount,
            source_user_id: userId,
            status:         'confirmed',
            notes:          \`ISP on R\${amountRands} \${newTier} upgrade\`,
          })

          // Mark referral as converted
          await supabase
            .from('referrals')
            .update({ status: 'converted', converted_at: new Date().toISOString() })
            .eq('ref_code', refCode)
            .eq('referred_user_id', userId)
        }
      }`;

var NEW = `      // ── COMPENSATION ENGINE ─────────────────────────────────────
      // ISP = Individual Performance — NO BFM required
      // TSC = Team Sales Commission — BFM (active OR grace) required
      // TLI = Team Leadership Income — BFM (active OR grace) required
      if (refCode) {
        const { data: sponsor } = await supabase
          .from('profiles')
          .select('id, paid_tier, full_name, bfm_start_date, bfm_active, bfm_paid_month, referral_code')
          .eq('referral_code', refCode)
          .single()

        if (sponsor) {
          // ── ISP — no BFM required ──────────────────────────────
          const ispAmount = amountRands * (ISP_RATES[sponsor.paid_tier] || 0.10)
          await supabase.from('comp_earnings').insert({
            user_id:        sponsor.id,
            builder_name:   sponsor.full_name,
            earning_type:   'ISP',
            amount:         ispAmount,
            source_user_id: userId,
            status:         'confirmed',
            notes:          \`ISP on R\${amountRands} \${newTier} upgrade — no BFM required\`,
          })

          // ── BFM QUALIFICATION CHECK for TSC + TLI ─────────────
          const now          = new Date()
          const bfmStart     = sponsor.bfm_start_date ? new Date(sponsor.bfm_start_date) : null
          const inGrace      = bfmStart ? (now.getTime() - bfmStart.getTime()) < (60 * 24 * 60 * 60 * 1000) : false
          const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM
          const bfmQualified = inGrace || (sponsor.bfm_active && sponsor.bfm_paid_month === currentMonth)

          // ── TSC — requires BFM qualification ──────────────────
          if (bfmQualified && ['bronze','copper','silver','gold','platinum'].includes(sponsor.paid_tier)) {
            const tscAmount = amountRands * (ISP_RATES[sponsor.paid_tier] || 0.18)
            await supabase.from('comp_earnings').insert({
              user_id:        sponsor.id,
              builder_name:   sponsor.full_name,
              earning_type:   'TSC',
              amount:         tscAmount,
              source_user_id: userId,
              status:         'confirmed',
              notes:          \`TSC on R\${amountRands} \${newTier} — BFM qualified\`,
            })
          } else if (!bfmQualified) {
            // Log disqualified TSC
            await supabase.from('comp_earnings').insert({
              user_id:        sponsor.id,
              builder_name:   sponsor.full_name,
              earning_type:   'TSC',
              amount:         0,
              source_user_id: userId,
              status:         'disqualified',
              notes:          \`TSC disqualified — BFM not active or grace expired\`,
            })
          }

          // ── TLI — requires BFM + Copper tier minimum ──────────
          const tliTiers = ['copper','silver','gold','platinum']
          if (bfmQualified && tliTiers.includes(sponsor.paid_tier)) {
            // TLI is paid as leadership milestone — record eligibility
            await supabase.from('comp_earnings').insert({
              user_id:        sponsor.id,
              builder_name:   sponsor.full_name,
              earning_type:   'TLI',
              amount:         0, // TLI amount calculated separately based on team size
              source_user_id: userId,
              status:         'pending_calculation',
              notes:          \`TLI trigger — team sale recorded. BFM qualified. Calculate milestone.\`,
            })
          }

          // ── Mark referral converted ────────────────────────────
          await supabase
            .from('referrals')
            .update({ status: 'converted', converted_at: new Date().toISOString() })
            .eq('ref_code', refCode)
            .eq('referred_user_id', userId)
        }
      }`;

if (y.includes('// ISP commission for sponsor')) {
  y = y.replace(OLD, NEW);
  console.log('Replacement done');
} else {
  console.log('Pattern not found — checking...');
  var idx = y.indexOf('ISP commission for sponsor');
  console.log('Found at index:', idx);
}

fs.writeFileSync('app/api/yoco/route.ts', y);
console.log('Done');
