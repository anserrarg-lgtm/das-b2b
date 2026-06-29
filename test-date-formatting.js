import { chromium } from 'playwright';

async function testDateFormatting() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== DATE FORMATTING VERIFICATION ===\n');

    // Capture console messages for debugging
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    // Test esperando opportunities that were migrated
    const testIds = ['5', '6', '21'];

    for (const id of testIds) {
      console.log(`Testing opportunity ${id}...`);
      await page.goto(`http://localhost:5173/oportunidad/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Check for errors
      const hasErrors = consoleLogs.filter(log => log.includes('Error') || log.includes('Invalid')).length > 0;
      if (hasErrors) {
        console.log(`  ⚠️  Errors detected:`);
        consoleLogs.filter(log => log.includes('Error') || log.includes('Invalid')).forEach(log => {
          console.log(`     ${log}`);
        });
      }

      // Open pulse check
      const buttons = await page.locator('button').all();
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text.toLowerCase().includes('pulse') || text.toLowerCase().includes('enviar')) {
          await btn.click({ timeout: 2000 });
          await page.waitForTimeout(1000);
          break;
        }
      }

      // Check if dates are formatted correctly (should contain Spanish month names)
      const pageText = await page.textContent('body');
      const hasSpanishDates = pageText.includes('junio') || pageText.includes('mayo') ||
                              pageText.includes('Junio') || pageText.includes('Mayo') ||
                              pageText.includes('junio') || pageText.includes('septiembre') ||
                              pageText.includes('Septiembre');

      const hasInvalidDate = pageText.includes('Invalid Date');

      console.log(`  Page Loads: ✓`);
      console.log(`  Spanish Dates: ${hasSpanishDates ? '✓' : '✗'}`);
      console.log(`  No Invalid Dates: ${!hasInvalidDate ? '✓' : '✗'}`);

      if (hasErrors) {
        console.log(`  Errors: ✗`);
      } else {
        console.log(`  No Errors: ✓`);
      }
      console.log('');
    }

    console.log('=== VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testDateFormatting();
