# Progressive Web App (PWA) Setup

This document describes the PWA features integrated into the Money Transfer Comparison app.

## Overview

The app is now a Progressive Web App (PWA), allowing users to:
- ✅ Install on home screen (iOS, Android, Windows)
- ✅ Work offline with cached content
- ✅ Load faster with service worker caching
- ✅ Support for future Play Store submission

## Files Added

### Core PWA Files

1. **`public/manifest.json`**
   - Web app manifest with metadata
   - App name, icons, theme colors
   - Shortcuts for quick access
   - Share target configuration

2. **`public/sw.js`**
   - Service worker for offline support
   - Caching strategies:
     - **Offline Shell**: Pre-cache key pages on install
     - **Network-First**: API calls with cache fallback
     - **Cache-First**: Static assets with network fallback
   - Automatic cache cleanup
   - Background sync support (future)

3. **`src/lib/pwa.ts`**
   - Service worker registration utility
   - PWA detection functions
   - Install prompt handling
   - Update checking

4. **`src/components/PWAInit.tsx`**
   - Client component for PWA initialization
   - Registers service worker on app load
   - Detects installation status
   - Listens for install prompts

5. **`public/browserconfig.xml`**
   - Windows tile configuration
   - Microsoft-specific PWA settings

### Configuration Updates

6. **`src/app/layout.tsx`**
   - Added PWA meta tags (viewport, theme-color, apple-web-app)
   - Apple and Android installation support
   - Manifest link
   - Icon references

7. **`next.config.ts`**
   - Added cache headers for:
     - Service worker (no caching)
     - Manifest (1 hour cache)
     - Icons (permanent cache)

## Installation Methods

### Android
1. Open app in Chrome/Edge
2. Browser shows "Install" prompt
3. Tap "Install" → Added to home screen
4. Works offline, supports all PWA features

### iOS (12+)
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App installs with icon
5. Works in full-screen standalone mode

### Windows (via Microsoft Edge)
1. Open app in Edge
2. Browser shows "Install" option
3. App installs to Start Menu
4. Can be published to Microsoft Store

## Offline Features

### Cached Pages (Offline Shell)
The following pages are cached and available offline:
- `/` (home)
- `/gbp-to-ngn`, `/gbp-to-ghs`, `/gbp-to-zar`, `/gbp-to-usd`, `/gbp-to-eur`, `/gbp-to-cad`

Cached data allows users to:
- View previously loaded corridors
- See historical/cached rates
- Navigate between pages

### API Calls
- **Network-First**: Always tries to fetch fresh data
- **Fallback**: Shows cached data if offline
- **Error State**: Displays "offline" message with cached data

### Static Assets
- JavaScript, CSS, images cached aggressively
- Automatically updated when service worker updates

## Icon Setup

Icons are placeholder references. Before publishing, generate real icons:

### Required Sizes
- 192x192 px (Android)
- 512x512 px (Android, splash screens)
- 180x180 px (iOS home screen)
- 96x96 px (shortcuts)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Icon Kitchen](https://icon.kitchen/)
- [RealFavicon Generator](https://realfavicongenerator.net/)

See `public/icons/README.md` for detailed instructions.

## Testing PWA Features

### Lighthouse Audit
```bash
npm run build
npm start
# Then in Chrome DevTools → Lighthouse → Progressive Web App
```

### Local Testing
```bash
# Development with SW
NEXT_PUBLIC_SW_DEBUG=1 npm run dev

# Or disable SW in dev:
# export DISABLE_SW=true && npm run dev
```

### Browser DevTools
1. Open `Application` tab
2. Check:
   - ✅ Manifest valid
   - ✅ Service Worker registered
   - ✅ Icons displaying
   - ✅ Offline simulation works

### Mobile Testing
- Open `http://localhost:3000` on Android phone
- Should show "Install" prompt
- Test offline mode with DevTools

## Caching Strategy

```
User visits corridor page
    ↓
Service Worker intercepts fetch
    ↓
    ├─ API Call? → Network-First
    │   ├─ Try fetch
    │   └─ Cache if successful
    │   └─ Use cached data if offline
    │
    ├─ Static Asset? → Cache-First
    │   ├─ Check cache
    │   └─ Fetch if missing
    │
    └─ Navigation? → Network-First
        ├─ Try fetch
        └─ Use cached page if offline
```

## Offline Indicators

Currently, the app doesn't show explicit offline indicators. To add:

1. Listen to `navigator.onLine` changes
2. Show toast/banner when offline
3. Disable certain features (like "Send with X" links)
4. Display "Cached data" notice

Example:
```tsx
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

if (!isOnline) {
  return <div className="bg-yellow-100">⚠️ You're offline</div>;
}
```

## Play Store Submission

For Google Play Store submission:

1. ✅ App must have valid manifest
2. ✅ 192x192 and 512x512 icons required
3. ✅ Service worker for offline support
4. ✅ Installability detection
5. ✅ Privacy policy page
6. ✅ Terms of service page

Use [PWA Builder](https://www.pwabuilder.com/) to generate:
- Android APK/AAB
- Signing certificates
- Store listings

## App Store (iOS)

Note: iOS PWA support is limited compared to Android:
- No direct App Store distribution
- Can be added to home screen via Safari
- Limited background sync
- Limited notification support

To publish on iOS App Store:
- Wrap PWA in native iOS app (e.g., using Swift)
- Or use services like [Capacitor](https://capacitorjs.com/)

## Monitoring

To monitor PWA health:

1. **Service Worker Updates**
   - App checks for updates every 12 hours
   - Logs new version availability
   - Dispatches custom event for UI notification

2. **Cache Management**
   - Old caches automatically deleted on activation
   - Cache size monitored in storage quota

3. **Error Handling**
   - Failed icon caching logged but doesn't break install
   - API failures handled gracefully

## Future Enhancements

1. **Periodic Background Sync**
   - Sync exchange rates when online
   - Update cache in background

2. **Notifications**
   - Rate alerts (e.g., "Best rate for GBP→NGN!")
   - New features available

3. **Offline Forms**
   - Queue transfer requests while offline
   - Sync when reconnected

4. **Native-like UX**
   - Share routes between web and native
   - Deep linking support

## Troubleshooting

### Service Worker not updating
- Force refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache in DevTools → Application → Clear storage
- Check DevTools → Application → Service Workers for error

### Icons not showing
- Verify paths in manifest.json are correct
- Icons must be in `public/` directory
- Check DevTools → Application → Manifest for errors

### Offline page not showing
- Service worker must be registered
- Page must be in offline assets list (update sw.js)
- Check if fetch intercepted correctly

### Install prompt not showing
- App must be HTTPS (or localhost)
- Must have valid manifest.json
- Must have service worker
- Must meet installability criteria

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google: Web Fundamentals - PWA](https://web.dev/progressive-web-apps/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Spec](https://w3c.github.io/ServiceWorker/)
