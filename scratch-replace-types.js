const fs = require('fs');

const sessionFiles = [
  'lib/artifacts/server.ts',
  'lib/ai/tools/update-document.ts',
  'lib/ai/tools/request-suggestions.ts',
  'lib/ai/tools/edit-document.ts',
  'lib/ai/tools/create-document.ts'
];

for (const file of sessionFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import type { Session } from "next-auth";/g, 'type Session = { user: { id: string; email?: string } };');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

const userFiles = [
  'components/chat/sidebar-history.tsx',
  'components/chat/app-sidebar.tsx'
];

for (const file of userFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import type { User } from "next-auth";/g, 'import type { User } from "firebase/auth";');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
