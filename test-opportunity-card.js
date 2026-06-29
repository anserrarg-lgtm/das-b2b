import { chromium } from 'playwright';

async function testOpportunityCard() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== OPPORTUNITY CARD PULSE DATE VERIFICATION ===\n');

    // Navigate to home to see opportunity cards
    console.log('Loading pipeline view...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('✓ Pipeline loaded\n');

    // Look for esperando status cards
    const pageText = await page.textContent('body');

    // Check for pulse dates in esperando opportunities
    const checks = {
      'Contains "Pulse enviado:"': pageText.includes('Pulse enviado:'),
      'Contains short date format (e.g., "20 jun")': /\d{1,2}\s+[a-z]{3}/i.test(pageText),
      'No "undefined" text': !pageText.includes('undefined'),
      'No "Invalid Date"': !pageText.includes('Invalid Date'),
      'Has esperando status': pageText.includes('esperando') || pageText.includes('Esperando'),
    };

    console.log('Verification Checks:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`  ${value ? '✓' : '✗'} ${key}`);
    });

    // Take a screenshot of the cards
    console.log('\nTaking screenshot...');
    await page.screenshot({ path: 'opportunity-cards.png', fullPage: true });
    console.log('✓ Screenshot saved: opportunity-cards.png');

    // Test specific esperando opportunities
    console.log('\nTesting specific esperando opportunities:');
    const testIds = ['5', '6', '10'];

    for (const id of testIds) {
      await page.goto(`http://localhost:5173/oportunidad/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const content = await page.textContent('body');
      const hasTitle = content.length > 100;

      console.log(`  ID ${id}: ${hasTitle ? '✓ Loads' : '✗ Failed'}`);
    }

    console.log('\n=== VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testOpportunityCard();
