var fs = require('fs');
var c = fs.readFileSync('app/register/page.tsx', 'utf8');

// Add auto-redirect if user already logged in as FAM
c = c.replace(
  "const [fullName, setFullName] = useState('')",
  `// Auto-redirect logged-in FAM members straight to payment
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('paid_tier')
        .eq('id', user.id)
        .single()
      const t = profile?.paid_tier ?? 'fam'
      // If already paid tier, go to dashboard
      if (t !== 'fam' && t !== 'free') {
        router.push('/dashboard')
        return
      }
      // FAM user — skip registration, go straight to payment
      router.push('/ai-income/payment?tier=' + tier + '&amount=' + info.price + '&name=' + encodeURIComponent(tierName))
    })
  }, [])

  const [fullName, setFullName] = useState('')`
);

fs.writeFileSync('app/register/page.tsx', c);
console.log('Done');
