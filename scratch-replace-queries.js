const fs = require('fs');

const file = 'lib/db/queries.ts';

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/map\(doc =>/g, 'map((doc: any) =>');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
