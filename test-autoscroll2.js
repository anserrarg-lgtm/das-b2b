import { chromium } from 'playwright';

async function testAutoScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // Log the page title
    console.log('Page title:', await page.title());

    // Get all text on the page
    const pageText = await page.textContent('body');
    if (pageText.includes('Grupo Bolívar')) {
      console.log('✓ Found "Grupo Bolívar" on the page');
    } else {
      console.log('✗ "Grupo Bolívar" not found on page');
    }

    // Try to click on Grupo Bolívar link
    const links = await page.locator('a, button').all();
    console.log(`Found ${links.length} clickable elements`);

    // Direct navigation to opportunity 21
    console.log('\nNavigating directly to opportunity 21...');
    await page.goto('http://localhost:5173/oportunidad/21');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Opportunity detail page loaded');

    // Check if we're on the right page
    const clientName = await page.textContent('.opportunity-detail-container, [class*="detail"]');
    console.log('Page content includes:', clientName?.substring(0, 100));

    // Look for chat or pulse check elements
    const pulseButtons = await page.locator('button:has-text("Pulse Check"), button:has-text("Chat")').all();
    console.log(`Found ${pulseButtons.length} pulse check buttons`);

    if (pulseButtons.length > 0) {
      console.log('Clicking first pulse button...');
      await pulseButtons[0].click();
      await page.waitForTimeout(1500);
    }

    // Look for messages
    const allText = await page.textContent('body');
    if (allText.includes('negociación') || allText.includes('proceso')) {
      console.log('✓ Found chat messages on page');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-autoscroll2.png' });
    console.log('Screenshot saved');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testAutoScroll();
