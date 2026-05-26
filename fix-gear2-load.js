var fs = require('fs');
var c = fs.readFileSync('app/ai-income/gear/2/page.tsx', 'utf8');

c = c.replace(
  `      // Load intent from sessionStorage (set by Gear 1 confirm)
      let loadedIntent: IntentDefinition | null = null
      try {
        const raw = sessionStorage.getItem('v3_gear1_intent')
        if (raw) loadedIntent = JSON.parse(raw)
      } catch (_) {}
      if (!loadedIntent || !sid) {
        setErrorMsg('Could not load intent from Gear 1. Please return and confirm.')
        setStep('error')
        return
      }`,
  `      // Load intent from sessionStorage OR database
      let loadedIntent: IntentDefinition | null = null
      try {
        const raw = sessionStorage.getItem('v3_gear1_intent')
        if (raw) loadedIntent = JSON.parse(raw)
      } catch (_) {}
      // Fallback — load from database if sessionStorage empty
      if (!loadedIntent && sid) {
        try {
          const { data: gs } = await (supabase as any).from('gear_sessions')
            .select('intent_data').eq('id', sid).maybeSingle()
          if (gs?.intent_data) {
            loadedIntent = typeof gs.intent_data === 'string'
              ? JSON.parse(gs.intent_data)
              : gs.intent_data
          }
        } catch(_) {}
      }
      if (!loadedIntent || !sid) {
        setErrorMsg('Could not load intent from Gear 1. Please return and confirm.')
        setStep('error')
        return
      }`
);

fs.writeFileSync('app/ai-income/gear/2/page.tsx', c);
console.log('Done');
