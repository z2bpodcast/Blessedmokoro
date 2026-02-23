# 🚀 QUICK START GUIDE - Z2B TABLE BANQUET

## Get Running in 15 Minutes!

### Step 1: Supabase Setup (5 minutes)

1. Go to https://supabase.com and sign up
2. Click "New Project"
   - Name: Z2B Table Banquet
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to you
   - Click "Create new project"
3. Wait 2-3 minutes for setup
4. Click "SQL Editor" (left sidebar)
5. Click "New Query"
6. Open `supabase-setup.sql` in this project
7. Copy ALL the SQL code
8. Paste into Supabase SQL Editor
9. Click "RUN" button
10. Success! ✅ Tables created

### Step 2: Get Your API Keys (2 minutes)

1. In Supabase, click the ⚙️ "Project Settings" (bottom left)
2. Click "API" in left menu
3. You'll see two important things:

**Copy these:**
```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Set Up Project (3 minutes)

1. Open terminal in this folder
2. Run:
```bash
npm install
```

3. Create `.env.local` file (copy from `.env.local.example`):
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` with your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Start the App! (1 minute)

```bash
npm run dev
```

Open browser: http://localhost:3000

### Step 5: Create Your Admin Account (2 minutes)

1. Sign up on the website with your email
2. Go back to Supabase
3. Click "SQL Editor"
4. Run this (replace with YOUR email):
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
```
5. Refresh the website - you now have an "Admin" button! 🎉

### Step 6: Upload Your First Content (2 minutes)

1. Click "Admin" button
2. Click "Upload New Content"
3. Fill in:
   - Title: "Welcome Video"
   - Description: "Introduction to Z2B"
   - Type: Video
   - File URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   - Check "Make this content public"
4. Click "Upload Content"

Done! Your first content is live! 🎬

## 🎯 What You Can Do Now:

✅ Browse your homepage
✅ View content in the media player
✅ Go to Dashboard and see your referral link
✅ Share content with social buttons
✅ Upload more videos, audio, or PDFs
✅ Make content public or members-only
✅ **Install as PWA app on your device**

## 📱 PWA Features

Your platform is now a **Progressive Web App**!

**Members can:**
- Install the app on iPhone, Android, or Desktop
- Add Z2B icon to their home screen
- Access the app offline (cached content)
- Enjoy full-screen, app-like experience

**How to install:**
- **iPhone**: Safari → Share → Add to Home Screen
- **Android**: Install prompt appears, or Chrome → Menu → Install app
- **Desktop**: Click install icon in browser address bar

See [PWA-GUIDE.md](PWA-GUIDE.md) for complete PWA documentation.

## 📤 Where to Host Your Files:

**Videos:**
- YouTube (easiest): Upload video, copy link
- Google Drive: Upload, right-click > Get link > Set to "Anyone with link"

**Audio:**
- SoundCloud: Upload, copy track URL
- Google Drive: Same as videos

**PDFs:**
- Google Drive: Upload, share link
- Dropbox: Upload, create share link

## 🚀 Deploy to Production:

When ready to launch:

1. Push code to GitHub
2. Go to vercel.com
3. Import your GitHub repo
4. Add the 3 environment variables
5. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Deploy!

Your site will be live in 2 minutes! 🌍

## 💡 Pro Tips:

- **Free hosting**: Use Vercel (free) + Supabase (free tier)
- **Cost**: $0/month for small audience, scales as you grow
- **Referral system**: Every member automatically gets a unique code
- **Analytics**: Track who brings in new members
- **Members-only**: Lock content behind sign-up

## 🆘 Need Help?

**Common Issues:**

- **"Invalid API key"**: Double-check `.env.local` file, restart server
- **Can't login**: Check Supabase > Authentication > Users
- **Content not showing**: Verify URL is publicly accessible
- **Not admin**: Run the UPDATE query in Supabase SQL Editor

---

**You're all set! Start uploading and sharing! 🎉**
