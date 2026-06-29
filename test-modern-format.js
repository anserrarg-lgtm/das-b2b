import { chromium } from 'playwright';

async function testModernFormat() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== MODERN FORMAT PULSECHECKS VERIFICATION ===\n');

    const testIds = ['5', '6', '10', '20', '23', '24', '25', '26'];
    const results = [];

    for (const id of testIds) {
      console.log(`Testing opportunity ${id}...`);
      await page.goto(`http://localhost:5173/oportunidad/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Check for errors in console
      const pageContent = await page.textContent('body');
      const hasContent = pageContent.length > 100;

      // Try to open pulse check
      const buttons = await page.locator('button').all();
      let hasChat = false;

      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text.toLowerCase().includes('pulse') || text.toLowerCase().includes('enviar')) {
          await btn.click({ timeout: 2000 });
          await page.waitForTimeout(800);
          hasChat = true;
          break;
        }
      }

      // Check if messages render
      const bodyText = await page.textContent('body');
      const hasMessages = bodyText.includes('Carlos') || bodyText.includes('mensaje') || bodyText.includes('¿');

      results.push({
        id,
        pageLoads: hasContent ? '✓' : '✗',
        chatOpened: hasChat ? '✓' : '✗',
        messagesRender: hasMessages ? '✓' : '✗'
      });

      console.log(`  ✓ ID ${id} processed`);
    }

    console.log('\n=== RESULTS ===\n');
    results.forEach(r => {
      console.log(`ID ${r.id}: Page=${r.pageLoads} Chat=${r.chatOpened} Messages=${r.messagesRender}`);
    });

    const allPass = results.every(r => r.pageLoads === '✓' && r.chatOpened === '✓' && r.messagesRender === '✓');
    console.log(`\n${allPass ? '✓ ALL TESTS PASSED' : '⚠️  Some tests failed'}`);

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testModernFormat();
