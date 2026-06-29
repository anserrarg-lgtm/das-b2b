import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to notifications page
    await page.goto('http://localhost:5173/notificaciones');
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    await page.screenshot({ path: 'notifications-padding-check.png', fullPage: true });
    console.log('Screenshot saved: notifications-padding-check.png');
  } finally {
    await browser.close();
  }
})();
