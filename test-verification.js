import { chromium } from 'playwright';

async function testAutoScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== AUTO-SCROLL VERIFICATION TEST ===\n');

    // Load home page
    console.log('1️⃣  Loading home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('✓ Home page loaded');

    // Find and click opportunity 21
    console.log('\n2️⃣  Clicking on Grupo Bolívar opportunity...');
    const grupoLink = await page.locator('text=/Grupo Bolívar/i').first();
    await grupoLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    console.log('✓ Clicked on opportunity');

    // Verify we're on the right page
    const url = page.url();
    if (url.includes('oportunidad/21')) {
      console.log('✓ Navigated to opportunity/21');
    } else {
      console.log(`⚠️  Current URL: ${url}`);
    }

    // Look for pulse check / chat related content
    console.log('\n3️⃣  Checking for pulse check content...');
    const pageText = await page.textContent('body');
    const hasPulseContent = pageText.includes('negociación') || pageText.includes('Grupo Bolívar');
    console.log(`✓ Page contains pulse check messages: ${hasPulseContent}`);

    // Check if there's a message container with scroll
    console.log('\n4️⃣  Checking message container auto-scroll...');
    const scrollData = await page.evaluate(() => {
      const containers = [
        // Search for message containers
        ...document.querySelectorAll('[class*="message"]'),
        ...document.querySelectorAll('[class*="chat"]'),
        ...document.querySelectorAll('[class*="pulse"]'),
      ];

      const results = [];
      containers.forEach((el, i) => {
        const isScrollable = el.scrollHeight > el.clientHeight;
        const isAtBottom = isScrollable && Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) < 50;

        if (isScrollable) {
          results.push({
            index: i,
            className: el.className.substring(0, 40),
            scrollHeight: el.scrollHeight,
            scrollTop: el.scrollTop,
            clientHeight: el.clientHeight,
            isAtBottom: isAtBottom
          });
        }
      });

      return results;
    });

    if (scrollData.length > 0) {
      console.log(`✓ Found ${scrollData.length} scrollable message container(s)`);
      scrollData.forEach((container, i) => {
        const status = container.isAtBottom ? '✓ AUTO-SCROLLED' : '✗ NOT AT BOTTOM';
        console.log(`  [${i}] ${status} - position: ${container.scrollTop}/${container.scrollHeight}`);
      });
    } else {
      console.log('⚠️  No scrollable message containers found (this may be normal if chat is closed)');
    }

    // Try to trigger the chat view by clicking relevant buttons
    console.log('\n5️⃣  Trying to open pulse chat...');
    const buttons = await page.locator('button').all();
    let chatOpened = false;

    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text.toLowerCase().includes('pulse') || text.toLowerCase().includes('chat')) {
        console.log(`  Clicking button: "${text.trim()}"`);
        await btn.click({ timeout: 3000 });
        await page.waitForTimeout(1000);
        chatOpened = true;
        break;
      }
    }

    if (!chatOpened) {
      console.log('⚠️  No chat/pulse button found - this may be normal if chat is accessed differently');
    }

    // Check scroll position again if chat opened
    if (chatOpened) {
      console.log('\n6️⃣  Checking scroll after opening chat...');
      await page.waitForTimeout(500);

      const scrollDataAfter = await page.evaluate(() => {
        const container = document.querySelector('[class*="message"], [class*="chat"]');
        if (!container) return null;

        const isAtBottom = Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) < 50;
        return {
          scrollTop: container.scrollTop,
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          isAtBottom: isAtBottom
        };
      });

      if (scrollDataAfter) {
        console.log(`✓ Chat opened - Auto-scroll status: ${scrollDataAfter.isAtBottom ? '✓ AT BOTTOM' : '✗ NOT AT BOTTOM'}`);
        console.log(`  Scroll position: ${scrollDataAfter.scrollTop}/${scrollDataAfter.scrollHeight}`);
      }
    }

    // Take screenshot for reference
    console.log('\n7️⃣  Taking screenshot...');
    await page.screenshot({ path: 'verification-result.png', fullPage: true });
    console.log('✓ Screenshot saved: verification-result.png');

    console.log('\n=== VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testAutoScroll();
