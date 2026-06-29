import { chromium } from 'playwright';

async function testAutoScroll() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    console.log('Starting auto-scroll verification...\n');

    // Step 1: Navigate to home
    console.log('Step 1: Loading app home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    let pageHasContent = false;
    try {
      const bodyText = await page.textContent('body', { timeout: 5000 });
      pageHasContent = bodyText && bodyText.length > 100;
    } catch (e) {
      console.log('Could not get body text');
    }

    if (!pageHasContent) {
      console.log('Page seems empty, trying to reload...');
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(3000);
    }

    // Check if we can find the pipeline board or opportunities
    const hasOpportunities = await page.locator('text=Grupo Bolívar').isVisible({ timeout: 5000 }).catch(() => false);

    if (hasOpportunities) {
      console.log('✓ Found opportunities on home page');
    } else {
      console.log('⚠️  Could not find opportunities, trying direct URL');
    }

    // Step 2: Navigate to specific opportunity
    console.log('\nStep 2: Navigating to Opportunity #21...');
    await page.goto('http://localhost:5173/oportunidad/21', { waitUntil: 'load' });
    await page.waitForTimeout(4000);

    // Verify we're on the right page
    const opportunityTitle = await page.textContent('h1, h2, [class*="heading"]').catch(() => null);
    console.log(`Page content: ${opportunityTitle || '(no title found)'}`);

    // Check for key elements
    const hasContent = await page.evaluate(() => document.body.textContent.length > 100);
    if (!hasContent) {
      console.log('⚠️  Page seems empty, this might be a React hydration issue');
      await page.screenshot({ path: 'empty-page.png' });
      console.log('Screenshot of empty page: empty-page.png');
    } else {
      console.log('✓ Page has content');
    }

    // Step 3: Look for and click pulse check elements
    console.log('\nStep 3: Looking for Pulse Check / Chat functionality...');

    // Wait for any interactive elements
    await page.waitForTimeout(2000);

    // Get all text to see what's there
    const fullText = await page.textContent('body');
    console.log('Page contains these keywords:');
    if (fullText.includes('Grupo Bolívar')) console.log('  ✓ Grupo Bolívar');
    if (fullText.includes('negociación') || fullText.includes('proceso')) console.log('  ✓ Chat messages');
    if (fullText.includes('Pulse Check') || fullText.includes('pulse')) console.log('  ✓ Pulse Check button');
    if (fullText.includes('Power Platform')) console.log('  ✓ Opportunity details');

    // Try to find and scroll message containers
    console.log('\nStep 4: Checking message container scroll position...');

    const scrollCheck = await page.evaluate(() => {
      const containers = document.querySelectorAll('[class*="message"], [class*="chat"], [class*="scroll"]');
      const results = [];

      containers.forEach((el, i) => {
        if (el.scrollHeight > el.clientHeight) { // Only containers with scroll
          results.push({
            index: i,
            className: el.className.substring(0, 50),
            scrollHeight: el.scrollHeight,
            scrollTop: el.scrollTop,
            clientHeight: el.clientHeight,
            isAtBottom: Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) < 50
          });
        }
      });

      return results;
    });

    if (scrollCheck.length > 0) {
      console.log(`Found ${scrollCheck.length} scrollable containers:`);
      scrollCheck.forEach((item, i) => {
        const status = item.isAtBottom ? '✓ AT BOTTOM' : '✗ NOT AT BOTTOM';
        console.log(`  [${i}] ${status} - scrollTop: ${item.scrollTop}/${item.scrollHeight} (visible: ${item.clientHeight})`);
      });
    } else {
      console.log('No scrollable message containers found');
    }

    // Take final screenshot
    console.log('\nStep 5: Capturing screenshots...');
    await page.screenshot({ path: 'opportunity-detail-screenshot.png', fullPage: true });
    console.log('✓ Full page screenshot: opportunity-detail-screenshot.png');

    // Also check the visible part
    await page.screenshot({ path: 'opportunity-detail-viewport.png' });
    console.log('✓ Viewport screenshot: opportunity-detail-viewport.png');

    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nTest error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'error-screenshot.png' }).catch(() => {});
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testAutoScroll();
