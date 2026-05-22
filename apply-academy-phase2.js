var fs = require('fs');
var c = fs.readFileSync('app/store/[slug]/academy/page.tsx', 'utf8');

// Add state variables
c = c.replace(
  "const [saveMsg,    setSaveMsg]    = useState('')",
  `const [saveMsg,    setSaveMsg]    = useState('')
  const [tests,        setTests]        = useState<any[]>([])
  const [testAnswers,  setTestAnswers]  = useState<Record<string,string>>({})
  const [testResult,   setTestResult]   = useState<{score:number,passed:boolean}|null>(null)
  const [exercises,    setExercises]    = useState<any[]>([])
  const [exerciseText, setExerciseText] = useState('')
  const [exerciseSent, setExerciseSent] = useState(false)
  const [discussions,  setDiscussions]  = useState<any[]>([])
  const [newComment,   setNewComment]   = useState('')`
);

// Add loadLesson function before submitLead
c = c.replace(
  "  async function submitLead()",
  `  async function loadLesson(lesson: any) {
    setSelLesson(lesson)
    setTestAnswers({})
    setTestResult(null)
    setExerciseText('')
    setExerciseSent(false)
    setNewComment('')
    const sb = supabase as any
    const [testsRes, exRes, discRes] = await Promise.all([
      sb.from('academy_tests').select('*').eq('lesson_id', lesson.id),
      sb.from('academy_exercises').select('*').eq('lesson_id', lesson.id),
      sb.from('academy_discussions').select('*').eq('lesson_id', lesson.id).order('created_at', { ascending: true }),
    ])
    setTests(testsRes.data ?? [])
    setExercises(exRes.data ?? [])
    setDiscussions(discRes.data ?? [])
  }

  async function submitTest() {
    const total   = tests.length
    if (total === 0) return
    const correct = tests.filter((t: any) => testAnswers[t.id] === t.answer).length
    const score   = Math.round((correct / total) * 100)
    const passed  = score >= (tests[0]?.pass_mark ?? 70)
    const sb      = supabase as any
    await sb.from('academy_test_results').upsert({
      lesson_id: selLesson!.id,
      user_id:   user.id,
      score, passed,
      answers:   testAnswers,
    }, { onConflict: 'lesson_id,user_id' })
    setTestResult({ score, passed })
    if (passed) markComplete(selLesson!.id)
  }

  async function submitExercise() {
    if (!exerciseText.trim() || !user) return
    const sb = supabase as any
    await sb.from('academy_submissions').insert({
      exercise_id:  exercises[0]?.id,
      lesson_id:    selLesson!.id,
      user_id:      user.id,
      student_name: user.user_metadata?.full_name ?? 'Student',
      response:     exerciseText,
    })
    setExerciseSent(true)
  }

  async function postComment() {
    if (!newComment.trim() || !user) return
    const sb = supabase as any
    await sb.from('academy_discussions').insert({
      lesson_id:   selLesson!.id,
      user_id:     user.id,
      author_name: user.user_metadata?.full_name ?? 'Student',
      content:     newComment,
      is_builder:  isBuilder,
    })
    setNewComment('')
    const { data } = await (sb.from as any)('academy_discussions')
      .select('*').eq('lesson_id', selLesson!.id).order('created_at', { ascending: true })
    setDiscussions(data ?? [])
  }

  async function submitLead()`
);

// Replace setSelLesson(lesson) calls with loadLesson(lesson) in lesson rows
c = c.split('canAccess && setSelLesson(lesson)').join('canAccess && loadLesson(lesson)');

// Add test/exercise/discussion after mark complete button
c = c.replace(
  "            </div>\n          </div>\n        )}\n\n        {/* ══ MY LEARNING TAB ══ */}",
  `            </div>

            {/* ── COMPREHENSION TEST ── */}
            {tests.length > 0 && (
              <div style={{ marginTop:28, padding:20, borderRadius:14, background:SURF, border:\`1px solid \${accent}20\` }}>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:accent, marginBottom:16 }}>
                  📝 Comprehension Test
                </div>
                {testResult ? (
                  <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <div style={{ fontSize:36, marginBottom:12 }}>{testResult.passed ? '🎉' : '❌'}</div>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color: testResult.passed ? GREEN : '#EF4444', marginBottom:8 }}>
                      {testResult.score}% — {testResult.passed ? 'Passed!' : 'Not passed yet'}
                    </div>
                    <div style={{ fontSize:13, color:MUTED }}>
                      {testResult.passed ? 'Lesson marked complete.' : \`Pass mark is \${tests[0]?.pass_mark ?? 70}%. Try again.\`}
                    </div>
                    {!testResult.passed && (
                      <button onClick={() => { setTestResult(null); setTestAnswers({}) }}
                        style={{ marginTop:14, padding:'10px 24px', borderRadius:8, background:\`\${accent}18\`, border:\`1px solid \${accent}30\`, color:accent, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        Try Again →
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {tests.map((test: any, ti: number) => (
                      <div key={test.id} style={{ marginBottom:20 }}>
                        <div style={{ fontSize:14, color:W, fontWeight:700, marginBottom:12 }}>{ti+1}. {test.question}</div>
                        {test.type === 'true_false' ? (
                          <div style={{ display:'flex', gap:10 }}>
                            {['True','False'].map(opt => (
                              <button key={opt} onClick={() => setTestAnswers({...testAnswers,[test.id]:opt})}
                                style={{ flex:1, padding:'10px', borderRadius:8, border:\`2px solid \${testAnswers[test.id]===opt ? accent : accent+'30'}\`, background: testAnswers[test.id]===opt ? \`\${accent}15\` : 'transparent', color: testAnswers[test.id]===opt ? accent : MUTED, cursor:'pointer', fontWeight:700, fontSize:13 }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {(test.options ?? []).map((opt: string) => (
                              <button key={opt} onClick={() => setTestAnswers({...testAnswers,[test.id]:opt})}
                                style={{ padding:'10px 14px', borderRadius:8, border:\`2px solid \${testAnswers[test.id]===opt ? accent : accent+'30'}\`, background: testAnswers[test.id]===opt ? \`\${accent}15\` : 'transparent', color: testAnswers[test.id]===opt ? accent : MUTED, cursor:'pointer', textAlign:'left', fontSize:13 }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button onClick={submitTest} disabled={Object.keys(testAnswers).length < tests.length}
                      style={{ width:'100%', padding:13, borderRadius:10, background:\`linear-gradient(135deg,\${accent},\${accent}cc)\`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor: Object.keys(testAnswers).length < tests.length ? 'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity: Object.keys(testAnswers).length < tests.length ? 0.5:1 }}>
                      Submit Test →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── EXERCISE ── */}
            {exercises.length > 0 && (
              <div style={{ marginTop:20, padding:20, borderRadius:14, background:SURF, border:\`1px solid \${accent}20\` }}>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:accent, marginBottom:12 }}>✏️ Exercise</div>
                <div style={{ fontSize:14, color:\`\${W}cc\`, lineHeight:1.8, marginBottom:16 }}>{exercises[0]?.instruction}</div>
                {exerciseSent ? (
                  <div style={{ textAlign:'center', padding:'16px 0', color:GREEN, fontWeight:700 }}>
                    ✓ Submitted! Your builder will review and give feedback.
                  </div>
                ) : (
                  <>
                    <textarea rows={5} value={exerciseText} onChange={e => setExerciseText(e.target.value)}
                      placeholder="Write your response here..."
                      style={{ width:'100%', padding:'12px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:\`1px solid \${accent}20\`, color:W, fontFamily:'Georgia,serif', fontSize:13, outline:'none', resize:'vertical', marginBottom:12 }} />
                    <button onClick={submitExercise} disabled={!exerciseText.trim()}
                      style={{ width:'100%', padding:12, borderRadius:10, background:\`linear-gradient(135deg,\${accent},\${accent}cc)\`, color:BG, fontWeight:900, fontSize:13, border:'none', cursor:!exerciseText.trim()?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:!exerciseText.trim()?0.5:1 }}>
                      Submit Exercise →
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── DISCUSSION ── */}
            <div style={{ marginTop:20, padding:20, borderRadius:14, background:SURF, border:\`1px solid \${accent}20\` }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:accent, marginBottom:16 }}>
                💬 Discussion ({discussions.length})
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                {discussions.length === 0 ? (
                  <div style={{ fontSize:13, color:MUTED, textAlign:'center', padding:'16px 0' }}>No comments yet — be the first!</div>
                ) : discussions.map((d: any) => (
                  <div key={d.id} style={{ padding:'12px 14px', borderRadius:10, background: d.is_builder ? \`\${accent}10\` : 'rgba(255,255,255,0.03)', border:\`1px solid \${d.is_builder ? accent+'30' : 'rgba(255,255,255,0.06)'}\` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, fontWeight:700, color: d.is_builder ? accent : W }}>{d.is_builder ? '👑 ' : ''}{d.author_name ?? 'Student'}</span>
                      <span style={{ fontSize:10, color:MUTED }}>{new Date(d.created_at).toLocaleDateString('en-ZA')}</span>
                    </div>
                    <div style={{ fontSize:13, color:\`\${W}cc\`, lineHeight:1.7 }}>{d.content}</div>
                  </div>
                ))}
              </div>
              {user ? (
                <div>
                  <textarea rows={3} value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Ask a question or share your thoughts..."
                    style={{ width:'100%', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:\`1px solid \${accent}20\`, color:W, fontFamily:'Georgia,serif', fontSize:13, outline:'none', resize:'vertical', marginBottom:10 }} />
                  <button onClick={postComment} disabled={!newComment.trim()}
                    style={{ padding:'9px 20px', borderRadius:8, background:accent, color:BG, fontWeight:900, fontSize:12, border:'none', cursor:!newComment.trim()?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:!newComment.trim()?0.5:1 }}>
                    Post Comment →
                  </button>
                </div>
              ) : (
                <div style={{ fontSize:12, color:MUTED, textAlign:'center' }}>
                  <a href="/login" style={{ color:accent }}>Sign in</a> to join the discussion
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MY LEARNING TAB ══ */}`
);

fs.writeFileSync('app/store/[slug]/academy/page.tsx', c);
console.log('Done');
