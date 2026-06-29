import { chromium } from 'playwright';

async function testReactivadasFilter() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== REACTIVADAS FILTER TEST ===\n');

    // Navigate to notifications
    console.log('1. Loading notifications page...');
    await page.goto('http://localhost:5173/notificaciones', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Click on "Reactivadas" filter
    console.log('\n2. Clicking on "Reactivadas" filter tab...');
    const reactivadasTab = await page.locator('text=Reactivadas').first();

    if (await reactivadasTab.isVisible().catch(() => false)) {
      await reactivadasTab.click();
      await page.waitForTimeout(1000);
      console.log('✓ Clicked Reactivadas tab');

      // Get page content after clicking
      const filteredContent = await page.textContent('body');

      console.log('\n3. Checking filtered content:');
      console.log(`  ✓ "Oportunidad reactivada": ${filteredContent.includes('Oportunidad reactivada')}`);
      console.log(`  ✓ "Teams Phone System": ${filteredContent.includes('Teams Phone System')}`);
      console.log(`  ✓ "ISA Intercolombia": ${filteredContent.includes('ISA Intercolombia')}`);
      console.log(`  ✓ Filter works: ${filteredContent.includes('Pulse enviado') ? '✗ Shows all types' : '✓ Shows only reactivadas'}`);

    } else {
      console.log('✗ Reactivadas tab not found');
    }

    // Get all notification titles
    console.log('\n4. Checking all notification types visible...');
    const pageText = await page.textContent('body');

    const notificationTypes = {
      'Oportunidad reactivada': pageText.includes('Oportunidad reactivada'),
      'Venta confirmada': pageText.includes('Venta confirmada'),
      'Pulse enviado': pageText.includes('Pulse enviado'),
      'Partner respondió': pageText.includes('Partner respondió'),
      'Requiere atención': pageText.includes('Requiere atención'),
    };

    Object.entries(notificationTypes).forEach(([type, present]) => {
      console.log(`  ${present ? '✓' : '  '} ${type}`);
    });

    // Take screenshot
    console.log('\n5. Taking screenshot of filtered view...');
    await page.screenshot({ path: 'reactivadas-filter.png', fullPage: true });
    console.log('✓ Screenshot saved: reactivadas-filter.png');

    console.log('\n=== FILTER TEST COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testReactivadasFilter();
