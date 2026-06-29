import { chromium } from 'playwright';

async function testMultipleOpportunities() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== MULTI-OPPORTUNITY AUTO-SCROLL TEST ===\n');

    // Test opening multiple opportunities and verifying auto-scroll on each
    const opportunities = [
      { name: 'Grupo Bolívar', id: '21' },
      { name: 'OtherCorp', id: '20' }, // Using id 20 as alternate
    ];

    // Load home
    console.log('Loading home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    for (const opp of opportunities) {
      console.log(`\n📍 Testing opportunity: ${opp.name} (ID: ${opp.id})`);

      // Navigate directly to opportunity
      await page.goto(`http://localhost:5173/oportunidad/${opp.id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Try to open chat/pulse
      const buttons = await page.locator('button').all();
      let chatOpened = false;

      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text.toLowerCase().includes('pulse') || text.toLowerCase().includes('chat') || text.toLowerCase().includes('enviar')) {
          try {
            await btn.click({ timeout: 3000 });
            await page.waitForTimeout(800);
            chatOpened = true;
            break;
          } catch (e) {
            // Button might not be clickable
          }
        }
      }

      if (chatOpened) {
        // Check scroll position
        const scrollStatus = await page.evaluate(() => {
          const containers = document.querySelectorAll('[class*="message"], [class*="chat"], [class*="pulse"]');
          for (const container of containers) {
            if (container.scrollHeight > container.clientHeight) {
              const isAtBottom = Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) < 50;
              return {
                isAtBottom: isAtBottom,
                scrollTop: container.scrollTop,
                scrollHeight: container.scrollHeight,
                clientHeight: container.clientHeight
              };
            }
          }
          return { isAtBottom: true, info: 'No scrollable container (content fits)' };
        });

        if (scrollStatus.info) {
          console.log(`  ✓ Chat opened - ${scrollStatus.info}`);
        } else {
          console.log(`  ✓ Chat opened - Auto-scroll: ${scrollStatus.isAtBottom ? '✓ AT BOTTOM' : '✗ NOT AT BOTTOM'}`);
          console.log(`    Position: ${scrollStatus.scrollTop}/${scrollStatus.scrollHeight}`);
        }
      } else {
        console.log('  ⚠️  Could not open chat for this opportunity');
      }
    }

    // Now test switching between opportunities rapidly
    console.log('\n\n📍 Testing rapid opportunity switching...');
    const ids = ['21', '20', '19'];

    for (const id of ids) {
      await page.goto(`http://localhost:5173/oportunidad/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const pageText = await page.textContent('body');
      const hasContent = pageText.length > 100;
      console.log(`  ID ${id}: Page renders = ${hasContent ? '✓' : '✗'}`);
    }

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testMultipleOpportunities();
