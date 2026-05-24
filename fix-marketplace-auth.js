var fs = require('fs');
var c = fs.readFileSync('app/z2b-command-7x9k/marketplace/page.tsx', 'utf8');

// Replace sessionStorage check with Supabase role check
c = c.replace(
  `  useEffect(() => {
    const auth = sessionStorage.getItem('z2b_cmd_auth')
    if (auth !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k'); return }
    loadProducts()
  }, [])`,
  `  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await (supabase as any).from('profiles')
        .select('user_role').eq('id', user.id).single()
      const role = String(profile?.user_role || '')
      if (!['ceo','superadmin','admin'].includes(role)) { router.push('/dashboard'); return }
      loadProducts()
    })
  }, [])`
);

fs.writeFileSync('app/z2b-command-7x9k/marketplace/page.tsx', c);
console.log('Done');
