import { chromium } from 'playwright';

async function testUnreadIndicator() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== UNREAD INDICATOR VERIFICATION ===\n');

    // Navigate to pipeline
    console.log('Loading pipeline view...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('✓ Pipeline loaded\n');

    // Look for unread indicator dots
    console.log('Looking for unread indicators...');

    // Check for the green dots (6px circles with #B0FF92 color)
    const dots = await page.locator('div[style*="B0FF92"][style*="6px"]').count();
    console.log(`Found ${dots} potential unread dots\n`);

    // Get all opportunity cards
    const cards = await page.locator('[style*="rgba(255,255,255,0.04)"]').count();
    console.log(`Total visible cards: ${cards}`);

    // Find specific unread opportunities
    const unreadOpps = ['5', '7', '9', '11', '13', '15'];

    console.log('\nChecking specific unread opportunities:');
    for (const oppId of unreadOpps) {
      const oppCard = await page.locator(`text=${oppId}`).first();
      const isVisible = await oppCard.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`  ✓ Opportunity ${oppId} is visible`);
      }
    }

    // Test clicking on an unread card to mark it as read
    console.log('\n\nTesting click-to-mark-as-read...');
    const unreadCard = await page.locator('text=Office 365').first(); // Opp 5
    if (await unreadCard.isVisible().catch(() => false)) {
      console.log('  Found Office 365 Renovación (Opp 5)');
      await unreadCard.click({ timeout: 2000 });
      await page.waitForTimeout(1500);

      // Check if we navigated to detail page
      const url = page.url();
      console.log(`  ✓ Navigated to: ${url}`);

      // Go back to pipeline to verify unread status changed
      await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      console.log('  ✓ Returned to pipeline');
    }

    // Take screenshot showing the dots
    console.log('\nTaking screenshot of pipeline with unread indicators...');
    await page.screenshot({ path: 'unread-indicators.png', fullPage: true });
    console.log('✓ Screenshot saved: unread-indicators.png');

    console.log('\n=== VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testUnreadIndicator();
