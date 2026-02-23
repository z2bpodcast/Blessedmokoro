# 📱 PWA (Progressive Web App) Setup Guide

## What is a PWA?

Your Z2B Table Banquet platform is now a **Progressive Web App**! This means members can:

✅ **Install it like a native app** on their phone/tablet/desktop
✅ **Add to home screen** with a beautiful icon
✅ **Access offline** (cached content)
✅ **Faster loading** after first visit
✅ **Full-screen experience** (no browser bars)
✅ **Push notifications** (ready for future updates)

## How Members Can Install

### 📱 On iPhone/iPad (iOS):

1. Open Safari (must use Safari!)
2. Go to your Z2B website
3. Tap the **Share** button (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"**
6. The Z2B app icon will appear on their home screen!

### 🤖 On Android:

**Method 1: Install Prompt (Automatic)**
- After 10 seconds on the site, a prompt will appear
- Tap **"Install App"**
- The app installs to home screen

**Method 2: Manual Install**
- Open Chrome browser
- Go to your Z2B website
- Tap the **3-dot menu** (top right)
- Tap **"Add to Home screen"** or **"Install app"**
- Tap **"Install"**

### 💻 On Desktop (Chrome/Edge):

**Method 1: Install Prompt**
- A prompt appears in the address bar
- Click **"Install"**

**Method 2: Manual Install**
- Click the **install icon** in address bar (computer with arrow)
- Or go to **Menu → Install Z2B Table Banquet**
- App opens in its own window

## PWA Features Enabled

### 1. **Offline Access**
- Service worker caches key resources
- Members can browse previously viewed content offline
- Graceful fallback when no internet

### 2. **App-Like Experience**
- No browser chrome (address bar, tabs)
- Full-screen immersive experience
- Native app feel on all devices

### 3. **Fast Loading**
- Resources cached after first visit
- Instant loading on subsequent visits
- Improved performance

### 4. **Home Screen Icon**
- Beautiful Z2B logo icon
- Quick access from home screen
- Looks like a native app

### 5. **App Shortcuts** (Android)
Long-press the app icon to see:
- Go to Library
- Go to Dashboard

### 6. **Push Notifications** (Ready)
- Service worker configured for push notifications
- Easy to enable in future for:
  - New content alerts
  - Referral notifications
  - Special announcements

## Files Created

```
/public/
  ├── manifest.json          # PWA configuration
  ├── service-worker.js      # Offline functionality
  ├── icon-192.png          # App icon (small)
  └── icon-512.png          # App icon (large)

/components/
  └── PWAInstallPrompt.tsx  # Smart install prompt

/app/
  └── layout.tsx            # PWA meta tags added
```

## Customization

### Change App Name/Description

Edit `public/manifest.json`:
```json
{
  "name": "Your Full App Name",
  "short_name": "Short Name",
  "description": "Your description"
}
```

### Change Theme Color

Edit `public/manifest.json`:
```json
{
  "theme_color": "#6b21a8",
  "background_color": "#ffffff"
}
```

### Update Icons

Replace these files with your custom icons:
- `/public/icon-192.png` - 192x192px PNG
- `/public/icon-512.png` - 512x512px PNG

**Icon Requirements:**
- Square (1:1 ratio)
- PNG format
- Transparent background recommended
- Simple, recognizable design

### Modify Cache Strategy

Edit `public/service-worker.js`:

```javascript
// Add more URLs to cache
const urlsToCache = [
  '/',
  '/logo.jpg',
  '/your-file.css'
];
```

## Testing PWA

### Test Install Prompt:

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** (left sidebar)
4. Verify manifest loads correctly
5. Click **Service Workers**
6. Verify service worker is active

### Test Offline Mode:

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Reload page
5. App should still load basic content

### Test on Real Devices:

**iOS:**
- Use Safari only (Chrome doesn't support PWA on iOS)
- Test "Add to Home Screen"
- Verify icon and splash screen

**Android:**
- Test install prompt appears
- Verify app installs correctly
- Test app shortcuts (long-press icon)

**Desktop:**
- Test Chrome install prompt
- Verify app window (no browser chrome)

## Deployment Notes

### Vercel (Automatic):
- PWA works automatically on Vercel
- HTTPS required (Vercel provides this)
- Service worker registers on first visit

### Important: HTTPS Required
- PWA requires HTTPS (secure connection)
- Development: Use `localhost` (works without HTTPS)
- Production: Vercel provides free HTTPS

### Update Service Worker

When you update content:
1. Change version in `service-worker.js`:
   ```javascript
   const CACHE_NAME = 'z2b-banquet-v2'; // Increment version
   ```
2. Deploy changes
3. Service worker updates automatically

## Member Experience

### First Visit:
1. Member visits your site
2. Service worker registers (background)
3. After 10 seconds, install prompt appears
4. Member can install or dismiss

### After Install:
1. App icon on home screen
2. Tap icon → Opens full-screen app
3. No browser bars
4. Fast loading (cached)
5. Works partially offline

### Updating the App:
- When you deploy updates, service worker updates automatically
- Members get new version on next visit
- No manual updates needed

## Analytics

Track PWA installs:

```javascript
// In your analytics
window.addEventListener('appinstalled', () => {
  // Track install event
  analytics.track('PWA Installed');
});
```

## Future Enhancements

### Enable Push Notifications:

1. Get VAPID keys from web-push library
2. Add to Supabase edge functions
3. Subscribe users to notifications
4. Send alerts for new content

### Add Background Sync:

```javascript
// In service-worker.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-content') {
    event.waitUntil(syncContent());
  }
});
```

### Add Download for Offline:

Allow members to download content for offline viewing:
```javascript
// Download button functionality
const downloadForOffline = async (contentId) => {
  const cache = await caches.open('z2b-content');
  await cache.add(`/content/${contentId}`);
};
```

## Troubleshooting

### Install Prompt Not Showing:

**Checklist:**
- [ ] Using HTTPS (or localhost)
- [ ] manifest.json is valid
- [ ] Service worker registered
- [ ] Not already installed
- [ ] Using supported browser (Chrome, Edge, Safari)

**Force Show Prompt:**
- Open DevTools
- Application → Manifest
- Click "Add to home screen" button

### Service Worker Not Registering:

1. Check browser console for errors
2. Verify service-worker.js is accessible at `/service-worker.js`
3. Check HTTPS is enabled
4. Clear cache and try again

### Icons Not Showing:

1. Verify icon files exist in `/public/`
2. Check icon paths in manifest.json
3. Icons should be square (1:1 ratio)
4. Use PNG format

### App Not Working Offline:

1. Check service worker is active (DevTools → Application)
2. Verify URLs are added to cache
3. Test with simple pages first
4. Dynamic content needs special handling

## Best Practices

### ✅ Do:
- Keep app name short (< 12 characters)
- Use simple, recognizable icons
- Cache essential resources only
- Test on real devices
- Update service worker version on changes

### ❌ Don't:
- Cache too many resources (slows install)
- Forget to update cache version
- Use complex icons (hard to recognize small)
- Block navigation with install prompt
- Ignore offline experience

## Member Communication

### Announce PWA Feature:

**Email/Post:**
```
🎉 NEW: Install Z2B Table Banquet as an App!

You can now install Z2B as an app on your phone, tablet, or computer!

Benefits:
✨ Instant access from your home screen
✨ Faster loading
✨ No browser bars - full screen experience
✨ Works partially offline

How to Install:
📱 iPhone: Safari → Share → Add to Home Screen
🤖 Android: Look for the install prompt, or Chrome → Menu → Install app
💻 Desktop: Click the install icon in your browser

Try it now at: [your-url]
```

## Support

Members having issues? Common fixes:

1. **Can't find install option**: Make sure using Chrome/Safari
2. **Prompt not showing**: Can dismiss and install manually from browser menu
3. **Icon not showing**: Try reinstalling, check icon files exist
4. **Offline not working**: Some content requires internet (videos, PDFs)

---

**Your Z2B Table Banquet PWA is ready to install! 📱✨**

Members can now enjoy an app-like experience with quick access from their home screen!
