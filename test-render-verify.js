import { chromium } from 'playwright';

async function testRenderVerify() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== PULSECHECKS RENDERING VERIFICATION ===\n');

    // Navigate directly to opportunity 21
    console.log('1. Navigating to opportunity 21 (Grupo Bolívar)...');
    await page.goto('http://localhost:5173/oportunidad/21', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Check for the opportunity content
    const pageContent = await page.textContent('body');
    const checks = {
      hasGrupoBolivar: pageContent.includes('Grupo Bolívar'),
      hasPowerPlatform: pageContent.includes('Power Platform'),
      hasNegociacion: pageContent.includes('negociación'),
      hasPartnerResponse: pageContent.includes('aprobó') || pageContent.includes('Cliente aprobó'),
      hasHistorialSection: pageContent.includes('Historial'),
    };

    console.log('2. Page content checks:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`   ${value ? '✓' : '✗'} ${key}`);
    });

    // Click to open the pulse check chat
    console.log('\n3. Opening pulse check chat...');
    const buttons = await page.locator('button').all();
    let opened = false;

    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text.toLowerCase().includes('pulse') || text.toLowerCase().includes('enviar')) {
        await btn.click({ timeout: 3000 });
        await page.waitForTimeout(1000);
        opened = true;
        console.log(`   ✓ Clicked button: "${text.trim()}"`);
        break;
      }
    }

    if (!opened) {
      console.log('   ⚠️  Could not open pulse chat');
    }

    // Check for chat messages in the DOM
    console.log('\n4. Checking for rendered messages:');
    const pageTextAfter = await page.textContent('body');

    const messageChecks = {
      'First message "¿cómo va el proceso"': pageTextAfter.includes('¿cómo va el proceso'),
      'Second message "¿Hay avances"': pageTextAfter.includes('¿Hay avances'),
      'Partner response "En negociación"': pageTextAfter.includes('En negociación'),
      'Full response text': pageTextAfter.includes('Cliente aprobó presupuesto'),
      'Chat header': pageTextAfter.includes('Conversación'),
    };

    Object.entries(messageChecks).forEach(([key, value]) => {
      console.log(`   ${value ? '✓' : '✗'} ${key}`);
    });

    // Verify message structure in DOM
    console.log('\n5. Checking message structure:');
    const messageElements = await page.locator('[class*="message"], [class*="chat"], div:has-text("¿cómo va")').all();
    console.log(`   Found ${messageElements.length} message-related elements`);

    // Verify the condition logic by checking what's actually rendered
    console.log('\n6. Verifying conditional rendering logic:');
    const hasMessages = await page.evaluate(() => {
      const containers = document.querySelectorAll('[class*="message"], [class*="chat"]');
      for (const container of containers) {
        const text = container.textContent;
        if (text.includes('negociación') || text.includes('aprobó')) {
          return true;
        }
      }
      // Also check for the empty state message
      const emptyState = document.textContent.includes('No hay historial');
      return !emptyState;
    });

    if (hasMessages) {
      console.log('   ✓ Messages are being rendered (not empty state)');
    } else {
      console.log('   ⚠️  Empty state might be showing, or messages not rendered yet');
    }

    // Take screenshot
    console.log('\n7. Taking screenshot of chat...');
    await page.screenshot({ path: 'chat-render-verification.png', fullPage: true });
    console.log('   ✓ Screenshot saved: chat-render-verification.png');

    console.log('\n=== VERIFICATION COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testRenderVerify();
