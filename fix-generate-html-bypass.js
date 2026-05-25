var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Add bypass support
c = c.replace(
  `  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { sessionId } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  const { data: session } = await (sb.from as any)('gear_sessions')
    .select('intent_data, structure_data, content_draft, enhancement_assets, distribution_data, opportunity_data')
    .eq('id', sessionId)
    .eq('builder_id', user.id)
    .maybeSingle()`,
  `  const body = await req.json()
  const { sessionId, builderBypass } = body

  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  // Allow service bypass (for ZIP delivery)
  let session: any = null
  if (builderBypass) {
    const sbService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data } = await (sbService.from as any)('gear_sessions')
      .select('intent_data, structure_data, content_draft, enhancement_assets, distribution_data, opportunity_data')
      .eq('id', sessionId)
      .maybeSingle()
    session = data
  } else {
    const { user, sb } = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data } = await (sb.from as any)('gear_sessions')
      .select('intent_data, structure_data, content_draft, enhancement_assets, distribution_data, opportunity_data')
      .eq('id', sessionId)
      .eq('builder_id', user.id)
      .maybeSingle()
    session = data
  }`
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
