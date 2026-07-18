const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://qyvera.web.app';
const targetDir = path.join(__dirname, 'firebase-landing', 'public');

// Create directories
fs.mkdirSync(path.join(targetDir, 'assets'), { recursive: true });

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(`Failed to download ${url}: ${response.statusCode}`);
      }
    }).on('error', reject);
  });
}

async function scrape() {
  console.log('Downloading index.html...');
  await downloadFile(`${baseUrl}/`, path.join(targetDir, 'index.html'));
  
  const indexHtml = fs.readFileSync(path.join(targetDir, 'index.html'), 'utf8');
  
  // Extract asset URLs using regex
  const regex = /(?:src|href)="(\/assets\/[^"]+)"/g;
  let match;
  const assets = [];
  while ((match = regex.exec(indexHtml)) !== null) {
    assets.push(match[1]);
  }
  
  assets.push('/qyvera-logo.png'); // Add known logo
  
  for (const asset of assets) {
    console.log(`Downloading ${asset}...`);
    try {
      const destPath = path.join(targetDir, asset);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      await downloadFile(`${baseUrl}${asset}`, destPath);
    } catch (e) {
      console.error(e);
    }
  }
  
  console.log('Done downloading assets!');
  
  // Inject redirect script into index.html
  let newHtml = indexHtml.replace('</body>', `
  <script>
    document.addEventListener('click', function(e) {
      let target = e.target;
      while(target && target !== document.body) {
        const text = (target.innerText || '').toLowerCase();
        if (text.includes('try qyvera') || text.includes('generate')) {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = 'https://qyvera.vercel.app';
          return;
        }
        target = target.parentElement;
      }
    }, true); // use capturing phase
  </script>
</body>`);

  fs.writeFileSync(path.join(targetDir, 'index.html'), newHtml);
  console.log('Injected redirect script.');
}

scrape().catch(console.error);
