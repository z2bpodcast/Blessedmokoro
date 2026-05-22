var fs = require('fs');
var c = fs.readFileSync('app/store/[slug]/academy/page.tsx', 'utf8');

// Remove the second set of duplicate state declarations (lines 84-90)
var duplicate = `  const [tests,        setTests]        = useState<any[]>([])
  const [testAnswers,  setTestAnswers]  = useState<Record<string,string>>({})
  const [testResult,   setTestResult]   = useState<{score:number,passed:boolean}|null>(null)
  const [exercises,    setExercises]    = useState<any[]>([])
  const [exerciseText, setExerciseText] = useState('')
  const [exerciseSent, setExerciseSent] = useState(false)
  const [discussions,  setDiscussions]  = useState<any[]>([])
  const [newComment,   setNewComment]   = useState('')`;

// Replace first occurrence only — keep one, remove second
var idx = c.indexOf(duplicate);
var idx2 = c.indexOf(duplicate, idx + duplicate.length);
if (idx2 > -1) {
  c = c.slice(0, idx2) + c.slice(idx2 + duplicate.length);
  console.log('Duplicate removed');
} else {
  console.log('No duplicate found');
}

fs.writeFileSync('app/store/[slug]/academy/page.tsx', c);
