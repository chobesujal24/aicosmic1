const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(3000);
  console.log('Clicking selector...');
  await page.click('[data-testid="model-selector"]');
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[role="option"]'));
    const item = items.find(el => el.textContent.includes('Mistral Large 3 (NIM)'));
    if (item) {
        console.log('FOUND Mistral Large 3 (NIM)');
        item.click();
    } else {
        console.log('Available items:', items.map(el => el.textContent).join(', '));
    }
  });
  await page.waitForTimeout(2000);
  await browser.close();
})();
