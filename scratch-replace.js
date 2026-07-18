const fs = require('fs');

const files = [
  'app/(chat)/layout.tsx',
  'app/(chat)/actions.ts',
  'app/(chat)/api/vote/route.ts',
  'app/(chat)/api/suggestions/route.ts',
  'app/(chat)/api/messages/route.ts',
  'app/(chat)/api/history/route.ts',
  'app/(chat)/api/document/route.ts',
  'app/(chat)/api/files/upload/route.ts',
  'app/(chat)/api/chat/route.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import\s+{\s*auth\s*}\s+from\s+["']@\/app\/\(auth\)\/auth["'];/g, 'import { auth } from "@/lib/firebase-admin";');
    content = content.replace(/import\s+{\s*auth\s*}\s+from\s+["']\.\.\/\(auth\)\/auth["'];/g, 'import { auth } from "@/lib/firebase-admin";');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
