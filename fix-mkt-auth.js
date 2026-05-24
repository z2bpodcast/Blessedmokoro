var fs = require('fs');
var c = fs.readFileSync('app/z2b-command-7x9k/marketplace/page.tsx', 'utf8');

var oldEffect = "  useEffect(() => {\n    // const session = sessionStorage.getItem('z2b_cmd_auth')\n    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }\n    loadAll()\n  }, [])";

var newEffect = "  useEffect(() => {\n    supabase.auth.getUser().then(async ({ data: { user } }) => {\n      if (!user) { router.push('/login'); return }\n      const { data: p } = await (supabase as any).from('profiles').select('user_role').eq('id', user.id).single()\n      const role = String(p && p.user_role ? p.user_role : '')\n      if (role !== 'ceo' && role !== 'superadmin' && role !== 'admin') { router.push('/dashboard'); return }\n      loadAll()\n    })\n  }, [])";

if (c.includes('// const session')) {
  c = c.replace(oldEffect, newEffect);
  console.log('Replaced');
} else {
  console.log('Pattern not found — check manually');
}

fs.writeFileSync('app/z2b-command-7x9k/marketplace/page.tsx', c);
