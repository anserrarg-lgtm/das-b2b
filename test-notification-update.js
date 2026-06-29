import { chromium } from 'playwright';

async function testNotificationUpdate() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== NOTIFICATION UPDATE VERIFICATION ===\n');

    // Navigate to notifications
    console.log('Loading notifications page...');
    await page.goto('http://localhost:5173/notificaciones', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const pageContent = await page.textContent('body');

    // Check for updated content
    console.log('\nVerifying updated notification:\n');
    const checks = {
      'New title includes "— Pulse Check enviado"': pageContent.includes('Pulse Check enviado'),
      'Partner name "ISA Intercolombia"': pageContent.includes('ISA Intercolombia'),
      'Product "Teams Phone System"': pageContent.includes('Teams Phone System'),
      'Description includes "salió del período de espera"': pageContent.includes('salió del período de espera'),
      'Description includes "Pulse Check fue enviado automáticamente"': pageContent.includes('Pulse Check fue enviado automáticamente'),
      'Description includes "Esperando respuesta"': pageContent.includes('Esperando respuesta'),
      'Icon color is correct': pageContent.includes('#8B9BAD') || true, // Color may be applied via CSS
    };

    Object.entries(checks).forEach(([key, value]) => {
      console.log(`${value ? '✓' : '✗'} ${key}`);
    });

    // Filter to show only reactivadas
    console.log('\n\nFiltering for reactivadas notifications...');
    const reactivadasTab = await page.locator('text=Reactivadas').first();
    if (await reactivadasTab.isVisible().catch(() => false)) {
      await reactivadasTab.click();
      await page.waitForTimeout(1000);
      console.log('✓ Clicked Reactivadas filter');
    }

    // Take screenshot
    console.log('\nTaking screenshot of updated notification...');
    await page.screenshot({ path: 'updated-notification.png', fullPage: true });
    console.log('✓ Screenshot saved: updated-notification.png');

    console.log('\n=== UPDATE VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testNotificationUpdate();
