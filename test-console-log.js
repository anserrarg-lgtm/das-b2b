import { chromium } from 'playwright';

async function testConsoleLogs() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleLogs = [];

  // Capture console messages
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  try {
    console.log('=== TESTING PULSECHECKS CONSOLE LOGGING ===\n');

    // Load home
    console.log('1. Loading home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Click on Grupo Bolívar
    console.log('2. Clicking on Grupo Bolívar...');
    const grupoLink = await page.locator('text=/Grupo Bolívar/i').first();
    await grupoLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    // Find and log all pulseChecks console messages
    console.log('\n3. Checking console logs for pulseChecks:');
    const pulseLogsFound = consoleLogs.filter(log => log.text.includes('pulseChecks'));

    if (pulseLogsFound.length > 0) {
      console.log(`\n✓ Found ${pulseLogsFound.length} pulseChecks log(s):`);
      pulseLogsFound.forEach((log, i) => {
        console.log(`  [${i}] ${log.text}`);
      });
    } else {
      console.log('⚠️  No pulseChecks logs found');
    }

    // Try navigating to other opportunities
    console.log('\n4. Testing other opportunities...');
    const testIds = ['20', '19', '21'];
    for (const id of testIds) {
      console.log(`\n   Navigating to opportunity ${id}...`);
      await page.goto(`http://localhost:5173/oportunidad/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    }

    // Filter all pulseChecks logs
    const allPulseLogs = consoleLogs.filter(log => log.text.includes('pulseChecks'));
    console.log(`\n5. Total pulseChecks logs across all opportunities: ${allPulseLogs.length}`);

    // Check if we see the expected structure
    console.log('\n6. Checking for expected pulseChecks structure:');
    allPulseLogs.forEach(log => {
      if (log.text.includes('pp1') || log.text.includes('pp2')) {
        console.log('  ✓ Found structured pulseChecks with pp1/pp2 ids');
      }
      if (log.text.includes('respondido') || log.text.includes('Respondido')) {
        console.log('  ✓ Found respondido status in pulseChecks');
      }
      if (log.text.includes('partnerResponse')) {
        console.log('  ✓ Found partnerResponse in pulseChecks');
      }
    });

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testConsoleLogs();
