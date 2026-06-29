import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to notifications page
    await page.goto('http://localhost:5173/notificaciones');
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    await page.screenshot({ path: 'notifications-page.png', fullPage: true });
    console.log('Screenshot saved: notifications-page.png');
    
    // Get page content to verify structure
    const content = await page.content();
    
    // Check for key elements
    const hasTitle = content.includes('Notificaciones');
    const hasSubtitle = content.includes('Todo lo que pasó');
    const hasFilterTabs = content.includes('Todas') && content.includes('Pulse enviado');
    const hasMarkAllButton = content.includes('Marcar todo como leído');
    const hasRequiereAtencion = content.includes('REQUIERE ATENCIÓN');
    const hasRestoNotificaciones = content.includes('RESTO DE NOTIFICACIONES');
    
    console.log('\nStructure verification:');
    console.log('✓ Has "Notificaciones" title:', hasTitle);
    console.log('✓ Has subtitle:', hasSubtitle);
    console.log('✓ Has filter tabs:', hasFilterTabs);
    console.log('✓ Has "Marcar todo como leído" button:', hasMarkAllButton);
    console.log('✓ Has "REQUIERE ATENCIÓN" section:', hasRequiereAtencion);
    console.log('✓ Has "RESTO DE NOTIFICACIONES" section:', hasRestoNotificaciones);
  } finally {
    await browser.close();
  }
})();
