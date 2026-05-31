var fs = require('fs');
var c = fs.readFileSync('app/ai-income/ignition/page.tsx', 'utf8');

// FIX 1: Support .md, .docx, .txt file uploads
c = c.replace(
  "accept=\".pdf\"",
  "accept=\".pdf,.md,.docx,.txt\""
);

// FIX 2: Update tab labels and handler
c = c.replace(
  "['✍️ Type or Paste', '📎 Upload PDF'].map((tab, i) => (",
  "['✍️ Type or Paste', '📎 Upload File'].map((tab, i) => ("
);

// FIX 3: Handle multiple file types
c = c.replace(
  "if (file) { setPdfFile(file); setScriptInput('[PDF uploaded: ' + file.name + ']') }",
  `if (file) {
            setPdfFile(file)
            const ext = file.name.split('.').pop()?.toLowerCase()
            if (ext === 'txt' || ext === 'md') {
              const reader = new FileReader()
              reader.onload = (ev) => setScriptInput(ev.target?.result as string ?? '')
              reader.readAsText(file)
            } else {
              setScriptInput('[File uploaded: ' + file.name + ' — will be extracted automatically]')
            }
          }`
);

// FIX 4: Add text input option per persona field
c = c.replace(
  `                {field.options.map(opt => {
                  const selected = persona?.[field.id] === opt`,
  `                {/* Text input option */}
                <div style={{ marginBottom:8 }}>
                  <input
                    type="text"
                    placeholder={\`Or type custom \${field.label.toLowerCase()}...\`}
                    onChange={e => e.target.value && setPersona((p: any) => ({ ...p, [field.id]: e.target.value }))}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#F0F9FF', fontSize:12, outline:'none', boxSizing:'border-box' as const }}
                  />
                </div>
                {field.options.map(opt => {
                  const selected = persona?.[field.id] === opt`
);

fs.writeFileSync('app/ai-income/ignition/page.tsx', c);
console.log('Done');
