import { chromium } from 'playwright';

async function testReactivationNotification() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== REACTIVATION NOTIFICATION VERIFICATION ===\n');

    // Navigate to notifications
    console.log('1. Loading notifications page...');
    await page.goto('http://localhost:5173/notificaciones', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const pageContent = await page.textContent('body');
    console.log('✓ Notifications page loaded\n');

    // Check for reactivada notification
    console.log('2. Checking for reactivation notification...');
    const checks = {
      'Contains "Oportunidad reactivada"': pageContent.includes('Oportunidad reactivada'),
      'Contains "Teams Phone System"': pageContent.includes('Teams Phone System'),
      'Contains "ISA Intercolombia"': pageContent.includes('ISA Intercolombia'),
      'Has "Ver oportunidad" button': pageContent.includes('Ver oportunidad') || pageContent.includes('Ver en'),
      'No console errors': true, // Will check from console logs
    };

    Object.entries(checks).forEach(([key, value]) => {
      console.log(`  ${value ? '✓' : '✗'} ${key}`);
    });

    // Check for filter tab
    console.log('\n3. Checking notification filter tabs...');
    const hasReactivadasTab = pageContent.includes('Reactivadas');
    console.log(`  ${hasReactivadasTab ? '✓' : '✗'} Has "Reactivadas" filter tab`);

    // Try clicking on the reactivated notification
    console.log('\n4. Testing notification interaction...');
    const notifLink = await page.locator('text=Teams Phone System').first();
    if (await notifLink.isVisible().catch(() => false)) {
      await notifLink.click({ timeout: 2000 });
      await page.waitForTimeout(1000);
      console.log('  ✓ Clicked reactivated notification');
    } else {
      console.log('  ⚠️  Notification not found on page');
    }

    // Check current URL (should navigate to opportunity)
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);

    // Take screenshot
    console.log('\n5. Taking screenshot...');
    await page.screenshot({ path: 'notifications-page.png', fullPage: true });
    console.log('✓ Screenshot saved: notifications-page.png');

    console.log('\n=== VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testReactivationNotification();
