# Z2B Table Banquet - Premium Podcast Platform

A complete podcast/learning platform with member authentication, content management, referral tracking, and social sharing.

## 🎯 Features

### ✅ Core Features (MVP Ready)
- ✅ **Content Upload System** - Upload videos, audio, and PDFs
- ✅ **Public/Private Content** - Control which content is members-only
- ✅ **Member Authentication** - Sign up, login, member profiles
- ✅ **Referral Tracking** - Unique member referral codes
- ✅ **Social Sharing** - Share content with referral links (Facebook, Twitter, LinkedIn)
- ✅ **Referral Analytics** - Track clicks and conversions
- ✅ **Admin Dashboard** - Manage all content
- ✅ **Responsive Design** - Works on desktop, tablet, mobile
- ✅ **Smart Media Player** - Video/audio player with controls
- ✅ **PWA (Progressive Web App)** - Installable on all devices, works offline

### 🚀 Phase 2 Features (Coming Soon)
- Auto-generated captions (OpenAI Whisper integration)
- Video thumbnails auto-generation
- File upload directly to platform (currently uses external URLs)
- Email notifications
- Advanced analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Auth, Storage)
- **Media Player**: React Player
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

1. **Node.js** 18+ installed ([Download](https://nodejs.org/))
2. **Supabase Account** (free tier works!) ([Sign up](https://supabase.com/))
3. **Git** installed

## 🚀 Quick Setup (3 Steps)

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com/) and create a new account
2. Create a new project (choose any name, password, and region)
3. Wait 2-3 minutes for your project to be ready
4. Go to **SQL Editor** in the left sidebar
5. Click **New Query**
6. Copy and paste the entire content of `supabase-setup.sql`
7. Click **Run** to create all tables and policies

### Step 2: Get Your API Keys

1. In Supabase, go to **Project Settings** (gear icon)
2. Click **API** in the left menu
3. Copy these two values:
   - `Project URL` (looks like: https://xxxxx.supabase.co)
   - `anon public` key (under "Project API keys")

### Step 3: Configure & Run the App

1. **Clone/Download this project**
   ```bash
   cd z2b-podcast
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Go to `http://localhost:3000`
   - Sign up with your email
   - You're ready! 🎉

## 👤 Create Your Admin Account

After signing up, you need to make yourself an admin:

1. Go to Supabase **SQL Editor**
2. Run this query (replace with your email):
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
   ```
3. Refresh the app - you'll now see the "Admin" button

## 📤 Uploading Content

### Option 1: Use External URLs (Easiest)

Upload your files to any of these services and use the URL:

**For Videos:**
- YouTube (make unlisted if needed): `https://youtube.com/watch?v=...`
- Vimeo: `https://vimeo.com/...`
- Google Drive: Share link (set to "Anyone with link")

**For Audio:**
- SoundCloud: Track URL
- Google Drive: Share link
- Any direct MP3 URL

**For PDFs:**
- Google Drive: Share link
- Dropbox: Share link
- Any direct PDF URL

### Option 2: Cloudinary (Recommended for Direct Hosting)

1. Sign up at [cloudinary.com](https://cloudinary.com/) (free tier: 25GB)
2. Upload your files through their dashboard
3. Copy the public URL
4. Paste in admin panel

## 🔗 Referral System

### How It Works:

1. Each member gets a unique referral code (e.g., `ABC12345`)
2. Their referral link: `yoursite.com/signup?ref=ABC12345`
3. When someone signs up through their link:
   - The referral is tracked
   - Dashboard shows clicks & conversions
4. Members can share content with their referral code embedded

### Sharing Content:

Members can share any public content with social share buttons that include their referral code, so you know who brought in each new member!

## 📊 Analytics

Access your referral analytics in the **Dashboard**:
- Total referral link clicks
- Total conversions (sign-ups)
- Conversion rate percentage

## 🎨 Customization

### Change Colors/Branding:

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Change these values to your brand colors
    600: '#d946ef', // Main color
    700: '#c026d3', // Hover color
  },
}
```

### Change Site Name:

Edit these files:
- `app/layout.tsx` - Update metadata title
- All page files - Update "Z2B TABLE BANQUET" text

## 🚀 Deployment

### Deploy to Vercel (Recommended - Free):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com/)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
6. Click "Deploy"

Your site will be live in ~2 minutes!

## 📱 Features Guide

### For Members:
1. **Browse Content** - View public content on homepage
2. **Sign Up** - Create account (with optional referral code)
3. **Access Library** - View all content (including members-only)
4. **Share & Earn** - Get unique referral link, share content
5. **Track Referrals** - See clicks and conversions in dashboard
6. **Install as App** - Download PWA to home screen on any device

### For Admins:
1. **Upload Content** - Add videos, audio, PDFs
2. **Set Visibility** - Make content public or members-only
3. **Manage Content** - Edit, delete, toggle privacy
4. **View Analytics** - See all referral stats
5. **Member Management** - Activate, suspend, delete members
6. **Payment Tracking** - Monitor paid vs free members
7. **Export Data** - Download member list as CSV

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Members can only see their own referral data
- Only admins can upload/edit/delete content
- Passwords hashed by Supabase Auth

## 💰 Cost Breakdown (Under $50/month)

**Free Tier (Recommended for MVP):**
- Supabase: FREE (500MB database, 1GB storage, 50GB bandwidth)
- Vercel: FREE (unlimited deployments)
- Cloudinary: FREE (25GB storage, 25GB bandwidth)
- **Total: $0/month** 🎉

**If You Outgrow Free Tier:**
- Supabase Pro: $25/month (8GB database, 100GB storage)
- Cloudinary Plus: $0 (upgrade as needed)
- Vercel stays free
- **Total: ~$25/month**

## 🐛 Troubleshooting

### "Invalid API key" error:
- Double-check your `.env.local` file
- Make sure you copied the correct values from Supabase
- Restart the dev server after changing `.env.local`

### Can't log in:
- Check Supabase **Authentication** > **Users** to see if account exists
- Try "Forgot password" flow
- Check email for confirmation link

### Content not showing:
- Verify content was created in Supabase **Table Editor** > **content**
- Check if `is_public` is set correctly
- Make sure file URLs are publicly accessible

### Referral link not working:
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Check profile has a `referral_code` in database

## 📞 Support

Need help? Common issues:

1. **Database setup** - Make sure you ran the entire `supabase-setup.sql` file
2. **Environment variables** - Restart dev server after changing `.env.local`
3. **Admin access** - Run the UPDATE query to make yourself admin

## 🗺️ Roadmap

**Phase 1 (Current - MVP):**
- ✅ All core features complete

**Phase 2 (Next 30 days):**
- Auto-generated captions with OpenAI Whisper
- Direct file upload to Supabase Storage
- Thumbnail auto-generation for videos
- Email notifications for new content

**Phase 3 (Future):**
- Mobile apps (iOS/Android)
- Advanced analytics dashboard
- Payment integration for premium content
- Community features (comments, discussions)

## 📄 License

This project is built for Z2B Table Banquet. All rights reserved.

---

**Built with ❤️ for Z2B Table Banquet**

Ready to launch your podcast platform in 3 days! 🚀
