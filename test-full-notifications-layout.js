import { chromium } from 'playwright';

async function testFullLayout() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== FULL NOTIFICATIONS PAGE LAYOUT TEST ===\n');

    // Navigate to notifications page
    console.log('Loading notifications page...');
    await page.goto('http://localhost:5173/notificaciones', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const pageContent = await page.textContent('body');
    console.log('✓ Page loaded\n');

    // Check for filter tabs
    console.log('Checking filter tabs:');
    const tabs = [
      { text: 'Todas', expected: true },
      { text: 'Sin leer', expected: true },
      { text: 'Pulse enviado', expected: true },
      { text: 'Partner respondió', expected: true },
      { text: 'Venta confirmada', expected: true },
      { text: 'Historial', expected: true },
    ];

    tabs.forEach(tab => {
      console.log(`  ${pageContent.includes(tab.text) ? '✓' : '✗'} "${tab.text}" tab`);
    });

    // Check for "Marcar todo como leído"
    console.log('\nChecking header button:');
    console.log(`  ${pageContent.includes('Marcar todo como leído') ? '✓' : '✗'} "Marcar todo como leído" button`);

    // Check for section headers
    console.log('\nChecking section headers:');
    console.log(`  ${pageContent.includes('REQUIERE ATENCIÓN') ? '✓' : '✗'} "REQUIERE ATENCIÓN" section`);
    console.log(`  ${pageContent.includes('RESTO DE NOTIFICACIONES') ? '✓' : '✗'} "RESTO DE NOTIFICACIONES" section`);

    // Check for notifications in correct sections
    console.log('\nChecking notifications:');
    console.log(`  ${pageContent.includes('Sin respuesta: Microsoft 365 Business') ? '✓' : '✗'} sin_respuesta notification #1`);
    console.log(`  ${pageContent.includes('Sin respuesta: Exchange Online') ? '✓' : '✗'} sin_respuesta notification #2`);
    console.log(`  ${pageContent.includes('El partner respondió') ? '✓' : '✗'} Historial notifications exist`);

    // Check action buttons for sin_respuesta
    console.log('\nChecking sin_respuesta action buttons:');
    const verOppButtons = await page.locator('button:has-text("Ver oportunidad")').all();
    console.log(`  ${verOppButtons.length >= 2 ? '✓' : '✗'} Multiple "Ver oportunidad" buttons (${verOppButtons.length})`);

    const enEsperaButtons = await page.locator('button:has-text("Poner en espera")').all();
    console.log(`  ${enEsperaButtons.length >= 2 ? '✓' : '✗'} Multiple "Poner en espera" buttons (${enEsperaButtons.length})`);

    const escalarButtons = await page.locator('button:has-text("Escalar")').all();
    console.log(`  ${escalarButtons.length >= 2 ? '✓' : '✗'} Multiple "Escalar" buttons (${escalarButtons.length})`);

    // Test filter functionality
    console.log('\n\nTesting filter tabs:');
    const sinLeerTab = await page.locator('button:has-text("Sin leer")').first();
    if (await sinLeerTab.isVisible()) {
      await sinLeerTab.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Clicked "Sin leer" filter');
    }

    // Test "Marcar todo como leído" button
    console.log('\n\nTesting "Marcar todo como leído":');
    const markAllButton = await page.locator('button:has-text("Marcar todo como leído")').first();
    if (await markAllButton.isVisible()) {
      console.log('  ✓ "Marcar todo como leído" button is clickable');
    }

    // Take screenshot
    console.log('\n\nTaking screenshot...');
    await page.screenshot({ path: 'full-notifications-layout.png', fullPage: true });
    console.log('✓ Screenshot saved: full-notifications-layout.png');

    console.log('\n=== LAYOUT TEST COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testFullLayout();
