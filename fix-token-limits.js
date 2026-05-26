var fs = require('fs');
var c = fs.readFileSync('lib/v3/orchestration-router.ts', 'utf8');

c = c.replace('opportunity_synthesis: {\n    provider:    \'gpt\',\n    maxTokens:   2000,', 
               'opportunity_synthesis: {\n    provider:    \'gpt\',\n    maxTokens:   3000,');

c = c.replace('intent_definition: {\n    provider:    \'gpt\',\n    maxTokens:   800,',
               'intent_definition: {\n    provider:    \'gpt\',\n    maxTokens:   2000,');

c = c.replace('structure_generation: {\n    provider:    \'gpt\',\n    maxTokens:   1500,',
               'structure_generation: {\n    provider:    \'gpt\',\n    maxTokens:   4000,');

c = c.replace('content_directive: {\n    provider:    \'gpt\',\n    maxTokens:   600,',
               'content_directive: {\n    provider:    \'gpt\',\n    maxTokens:   1500,');

c = c.replace('quality_evaluation: {\n    provider:    \'gpt\',\n    maxTokens:   1200,',
               'quality_evaluation: {\n    provider:    \'gpt\',\n    maxTokens:   3000,');

c = c.replace('quality_revision_directive: {\n    provider:    \'gpt\',\n    maxTokens:   800,',
               'quality_revision_directive: {\n    provider:    \'gpt\',\n    maxTokens:   1500,');

fs.writeFileSync('lib/v3/orchestration-router.ts', c);
console.log('Done');
