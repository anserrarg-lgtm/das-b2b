import { chromium } from 'playwright';

async function testAutoScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // Find and click on opportunity id 21 (Grupo Bolívar)
    console.log('Looking for opportunity with Grupo Bolívar...');

    // Wait for opportunities to load and click on one
    const opportunityCards = await page.locator('[data-test-id*="opportunity"]').count();
    console.log(`Found ${opportunityCards} opportunity cards`);

    // Click on the opportunity that contains "Grupo Bolívar"
    const grupoBolivarCard = await page.locator('text=Grupo Bolívar').first();
    await grupoBolivarCard.click();
    await page.waitForLoadState('networkidle');

    console.log('Opened opportunity detail...');

    // Wait a moment for the detail to load
    await page.waitForTimeout(1000);

    // Look for and click the pulse check / chat button
    const pulseButton = await page.locator('button:has-text("Pulse Check")').first();
    if (await pulseButton.isVisible()) {
      console.log('Found and clicking Pulse Check button...');
      await pulseButton.click();
      await page.waitForTimeout(1000);
    }

    // Check if the messages container exists and get its scroll position
    const messagesContainer = await page.locator('.pulse-chat-messages, [class*="message"]').first();

    if (await messagesContainer.isVisible()) {
      const scrollTop = await messagesContainer.evaluate(el => el.scrollTop);
      const scrollHeight = await messagesContainer.evaluate(el => el.scrollHeight);
      const clientHeight = await messagesContainer.evaluate(el => el.clientHeight);

      console.log(`\nScroll status:
  - scrollTop: ${scrollTop}
  - scrollHeight: ${scrollHeight}
  - clientHeight: ${clientHeight}
  - isAtBottom: ${Math.abs(scrollTop + clientHeight - scrollHeight) < 10}`);

      if (Math.abs(scrollTop + clientHeight - scrollHeight) < 10) {
        console.log('✓ Chat is auto-scrolled to bottom');
      } else {
        console.log('✗ Chat is NOT at bottom');
      }
    } else {
      console.log('Messages container not found');
    }

    // Take a screenshot
    await page.screenshot({ path: 'test-autoscroll.png' });
    console.log('Screenshot saved: test-autoscroll.png');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAutoScroll();
