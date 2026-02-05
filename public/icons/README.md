# PWA Icons

This directory contains icons for the Progressive Web App. 

## Required Icons

For full PWA support, you need to provide:

### App Icons
- `icon-192.png` - 192x192px (Android, maskable-safe)
- `icon-192-maskable.png` - 192x192px (Android Adaptive Icon format)
- `icon-512.png` - 512x512px (Android, maskable-safe)
- `icon-512-maskable.png` - 512x512px (Android Adaptive Icon format)
- `icon-apple-180.png` - 180x180px (iOS Home Screen)

### Shortcut Icons
- `ngn-96.png` - 96x96px (GBP→NGN shortcut)
- `ghs-96.png` - 96x96px (GBP→GHS shortcut)

## Icon Specifications

### For Android (192x192 and 512x512)
- Format: PNG with transparency or solid background
- Safe zone: 66px padding from all edges (for adaptive icons)
- Recommended: Use `icon-*-maskable.png` for better Adaptive Icon support

### For iOS (180x180)
- Format: PNG with solid background (no transparency)
- Corner radius: Will be applied by iOS automatically
- Background: Should match your theme color (#2563eb)

### For Shortcuts (96x96)
- Format: PNG with transparency
- Style: Keep consistent with main app icon

## How to Generate Icons

### Option 1: Using ImageMagick
```bash
# From a source image (e.g., icon-1024.png)
convert icon-1024.png -resize 192x192 icon-192.png
convert icon-1024.png -resize 512x512 icon-512.png
convert icon-1024.png -resize 180x180 icon-apple-180.png
convert icon-1024.png -resize 96x96 ngn-96.png
```

### Option 2: Online Tools
- https://www.pwabuilder.com/
- https://icon.kitchen/
- https://realfavicongenerator.net/

### Option 3: Design Tools
- Use Figma, Adobe XD, or Sketch
- Export at specified dimensions
- Ensure proper padding for maskable icons

## Maskable Icons (Android)

Maskable icons support the Android Adaptive Icon format which allows the system to apply dynamic theming.

Create maskable icons with:
- Safe zone circle: 66px radius centered on a 192x192 canvas
- All important content within the safe zone
- Background that extends to edges

## Testing

To test your PWA:

1. Open DevTools (F12)
2. Go to Application → Manifest
3. Verify all icons are showing correctly
4. Check that manifest.json is valid
5. Test "Add to Home Screen" on Android/iOS

## Lighthouse PWA Audit

Run `npm run build && npm start` then:
1. Open Chrome DevTools
2. Go to Lighthouse
3. Select "Progressive Web App"
4. Run audit

Look for:
- ✅ Installable
- ✅ Has a valid manifest
- ✅ Icons are correctly sized
- ✅ Service worker registered
