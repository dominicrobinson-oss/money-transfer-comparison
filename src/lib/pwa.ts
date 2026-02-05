/**
 * Service Worker Registration Script
 * Call this from your layout to register the service worker
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  
  // Only register in production or on localhost
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname === '192.168.0.186');
  
  if (!isProduction && !isLocalhost) {
    console.log('Service Worker registration skipped (development environment)');
    return;
  }
  
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }
  
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Check for updates periodically (every 12 hours)
      setInterval(() => {
        registration.update();
      }, 12 * 60 * 60 * 1000);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, prompt user
            console.log('New Service Worker update available');
            
            // Dispatch custom event that your app can listen to
            window.dispatchEvent(
              new CustomEvent('sw-update-available', { 
                detail: { registration } 
              })
            );
          }
        });
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

/**
 * Check if app is installed (for PWA detection)
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if running in standalone mode (PWA installed)
  const isStandalone = (window.navigator as any).standalone === true;
  const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isPWAEnvironment = isStandalone || isDisplayStandalone;
  
  return isPWAEnvironment;
}

/**
 * Prompt for install (if supported)
 */
export function promptForInstall(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    
    let deferredPrompt: any = null;
    
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Install prompt is available
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('PWA install accepted');
            resolve(true);
          } else {
            console.log('PWA install rejected');
            resolve(false);
          }
          deferredPrompt = null;
        });
      }
    };
    
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    
    // If no prompt fires within 2 seconds, resolve false
    setTimeout(() => {
      if (!deferredPrompt) {
        resolve(false);
      }
    }, 2000);
  });
}

/**
 * Update Service Worker (useful for handling new versions)
 */
export async function updateServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  const registrations = await navigator.serviceWorker.getRegistrations();
  
  for (const registration of registrations) {
    try {
      await registration.update();
      console.log('Service Worker updated');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }
}
