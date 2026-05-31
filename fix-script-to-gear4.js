var fs = require('fs');
var c = fs.readFileSync('app/ai-income/gear/4/page.tsx', 'utf8');

// 1. Add script_intake to step type
c = c.replace(
  "type PageStep = 'loading'|'evaluating'|'review'|'confirmed'|'error'",
  "type PageStep = 'loading'|'evaluating'|'review'|'confirmed'|'error'|'script_intake'"
);

// 2. Add script intake states
c = c.replace(
  "  const [intent,       setIntent]     = useState<IntentDefinition | null>(null)",
  "  const [intent,       setIntent]     = useState<IntentDefinition | null>(null)\n  const [scriptTitle,  setScriptTitle]  = useState('')\n  const [scriptAud,    setScriptAud]    = useState('')\n  const [scriptPrice,  setScriptPrice]  = useState('299')\n  const [scriptFormat, setScriptFormat] = useState('course')"
);

// 3. Add script_intake check
c = c.replace(
  "      if (!loadedIntent || !loadedDraft || !sid) {\n        setErrorMsg('Could not load product data. Please return to Gear 3.')\n        setStep('error')\n        return\n      }",
  "      const scriptContent = sessionStorage.getItem('v3_script_content')\n      if ((!loadedIntent || !loadedDraft) && scriptContent) {\n        setStep('script_intake')\n        return\n      }\n      if (!loadedIntent || !loadedDraft || !sid) {\n        setErrorMsg('Could not load product data. Please return to Gear 3.')\n        setStep('error')\n        return\n      }"
);

fs.writeFileSync('app/ai-income/gear/4/page.tsx', c);
console.log('Done');
