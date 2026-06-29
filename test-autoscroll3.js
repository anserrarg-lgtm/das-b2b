import { chromium } from 'playwright';

async function testAutoScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate directly to opportunity 21
    console.log('Navigating to opportunity 21...');
    await page.goto('http://localhost:5173/oportunidad/21', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Get the title/heading
    const heading = await page.locator('h1, h2, [class*="titulo"]').first();
    if (await heading.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✓ Page loaded');
      const text = await heading.textContent();
      console.log(`Heading: ${text}`);
    }

    // Check if Grupo Bolívar appears on page
    const hasGrupoBolivar = await page.textContent('body').then(t => t.includes('Grupo Bolívar'));
    if (hasGrupoBolivar) {
      console.log('✓ Found "Grupo Bolívar" on page');
    }

    // Look for pulse check button - try multiple selectors
    const pulseButtonSelectors = [
      'button:has-text("Pulse Check")',
      'button:has-text("pulse")',
      'button:has-text("Chat")',
      '[data-test*="pulse"]',
      '[class*="pulse"] button',
    ];

    let pulseClicked = false;
    for (const selector of pulseButtonSelectors) {
      const button = await page.locator(selector).first();
      if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✓ Found pulse button with selector: ${selector}`);
        await button.click();
        console.log('Clicked pulse button');
        pulseClicked = true;
        break;
      }
    }

    if (!pulseClicked) {
      console.log('⚠️  No pulse button found, trying direct locator search...');
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons total`);

      for (const btn of allButtons.slice(0, 10)) {
        const text = await btn.textContent();
        console.log(`Button: "${text?.trim()}"`);
      }
    }

    await page.waitForTimeout(1500);

    // Look for chat/message content
    const bodyText = await page.textContent('body');
    if (bodyText.includes('negociación') || bodyText.includes('proceso') || bodyText.includes('cliente')) {
      console.log('✓ Chat/message content found');
    }

    // Check scroll position of any message container
    const messageContainers = await page.locator('[class*="message"], [class*="chat"], [class*="pulse"]').all();
    console.log(`\nFound ${messageContainers.length} message-related containers`);

    for (let i = 0; i < Math.min(5, messageContainers.length); i++) {
      const container = messageContainers[i];
      if (await container.isVisible().catch(() => false)) {
        const scrollInfo = await container.evaluate(el => ({
          scrollHeight: el.scrollHeight,
          scrollTop: el.scrollTop,
          clientHeight: el.clientHeight,
        }));
        const isAtBottom = Math.abs(scrollInfo.scrollTop + scrollInfo.clientHeight - scrollInfo.scrollHeight) < 50;
        console.log(`Container ${i}: scrollTop=${scrollInfo.scrollTop}, scrollHeight=${scrollInfo.scrollHeight}, isAtBottom=${isAtBottom}`);
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'test-result.png', fullPage: true });
    console.log('\n✓ Screenshot saved: test-result.png');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testAutoScroll();
