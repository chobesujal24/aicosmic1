const fs = require('fs');

const files = [
  'components/chat/sidebar-history.tsx',
  'components/chat/app-sidebar.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import type { User } from "firebase\/auth";/g, 'type User = { id?: string; email?: string | null; type?: string };');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
