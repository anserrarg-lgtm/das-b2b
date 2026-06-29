import { chromium } from 'playwright';

async function testFilteredView() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== FILTERED VIEW LAYOUT TEST ===\n');

    // Navigate to pipeline
    console.log('1. Loading pipeline board...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('✓ Pipeline board loaded\n');

    // Check initial state - should show kanban board
    console.log('2. Checking initial kanban board (filter: Todas)...');
    const initialContent = await page.textContent('body');
    console.log(`  ${initialContent.includes('Nueva') ? '✓' : '✗'} Shows kanban board columns`);

    // Click on a filter button
    console.log('\n3. Clicking "Esperando respuesta" filter...');
    const filterButton = await page.locator('button:has-text("Esperando respuesta")').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(1500);
      console.log('  ✓ Clicked filter');

      // Check filtered view
      const filteredContent = await page.textContent('body');
      const hasCards = filteredContent.includes('Expansión') || filteredContent.includes('Microsoft') || filteredContent.includes('Power');
      console.log(`  ${hasCards ? '✓' : '✗'} Shows filtered cards`);
    }

    // Test another filter
    console.log('\n4. Clicking "Sin respuesta" filter...');
    const sinRespuestaButton = await page.locator('button:has-text("Sin respuesta")').first();
    if (await sinRespuestaButton.isVisible()) {
      await sinRespuestaButton.click();
      await page.waitForTimeout(1500);
      console.log('  ✓ Clicked filter');

      const sinRespuestaContent = await page.textContent('body');
      console.log(`  ${sinRespuestaContent.includes('SharePoint') ? '✓' : '✗'} Shows sin respuesta opportunities`);
    }

    // Go back to "Todas" to check kanban
    console.log('\n5. Clicking "Todas" to restore kanban board...');
    const allButton = await page.locator('button:has-text("Todas")').first();
    if (await allButton.isVisible()) {
      await allButton.click();
      await page.waitForTimeout(1500);
      console.log('  ✓ Clicked "Todas" filter');

      const kanbanContent = await page.textContent('body');
      console.log(`  ${kanbanContent.includes('Nueva') ? '✓' : '✗'} Kanban board restored`);
    }

    // Take screenshot of filtered view
    console.log('\n6. Taking screenshot of filtered view...');
    await page.screenshot({ path: 'filtered-view.png', fullPage: true });
    console.log('✓ Screenshot saved: filtered-view.png');

    console.log('\n=== FILTERED VIEW TEST COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testFilteredView();
