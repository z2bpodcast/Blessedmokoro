var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');

// Add supabase import
c = c.replace(
  "import { useState, useEffect } from 'react'",
  "import { useState, useEffect } from 'react'\nimport { supabase } from '@/lib/supabase'"
);

// Add profile ref code logic after searchParams line
c = c.replace(
  "  const refCode = searchParams.get('ref') ?? ''",
  `  const urlRef = searchParams.get('ref') ?? ''
  const [refCode, setRefCode] = useState(urlRef)

  useEffect(() => {
    if (urlRef) { setRefCode(urlRef); return }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await (supabase as any)
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single()
      if (data?.referral_code) setRefCode(data.referral_code)
    })
  }, [])`
);

fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
