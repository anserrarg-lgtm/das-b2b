import { chromium } from 'playwright';

async function testAutoScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Capture errors
  page.on('error', err => console.log('PAGE ERROR:', err));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`HTTP Error: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('Loading home page...');
    const response = await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    console.log(`Home page response: ${response.status()}`);

    await page.waitForTimeout(2000);

    // Check for React app
    const hasRoot = await page.locator('#root').count();
    console.log(`Root element count: ${hasRoot}`);

    // List all visible elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    console.log(`Buttons: ${buttons}, Links: ${links}`);

    // Try finding Grupo Bolívar
    const grupoExists = await page.locator('text=/Grupo Bolívar/i').count();
    console.log(`"Grupo Bolívar" elements: ${grupoExists}`);

    if (grupoExists > 0) {
      console.log('Clicking on Grupo Bolívar...');
      const grupoLink = await page.locator('text=/Grupo Bolívar/i').first();
      await grupoLink.click({ timeout: 5000 });
      console.log('Clicked successfully');

      await page.waitForTimeout(3000);
      console.log('Waited 3 seconds after click');

      // Check URL
      const url = page.url();
      console.log(`Current URL: ${url}`);

      const hasContent = await page.locator('body').evaluate(el => el.textContent.length);
      console.log(`Page content length: ${hasContent}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    console.log('Closing browser');
    await browser.close();
  }
}

testAutoScroll();
