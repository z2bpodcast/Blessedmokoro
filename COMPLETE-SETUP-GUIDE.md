# 🚀 COMPLETE STEP-BY-STEP SETUP GUIDE
## From Zero to Fully Functional Z2B Table Banquet

Follow these steps EXACTLY in order. This will take about 30-45 minutes total.

---

## ✅ BEFORE YOU START - CHECK REQUIREMENTS

You need these installed on your computer:

### 1. **Node.js** (JavaScript runtime)
- Go to: https://nodejs.org/
- Download the **LTS version** (left button, green)
- Run the installer
- Click "Next" through everything
- **Test it worked:**
  - Open Terminal/Command Prompt
  - Type: `node --version`
  - Should show: `v18.x.x` or higher ✅

### 2. **VS Code** (Code editor)
- Go to: https://code.visualstudio.com/
- Download for your OS
- Install it
- Open VS Code

### 3. **Git** (Version control - optional but helpful)
- Go to: https://git-scm.com/
- Download and install
- Default options are fine

---

## 📥 STEP 1: DOWNLOAD & EXTRACT THE PROJECT (5 minutes)

### A. Download the file
1. Click the download link for `z2b-podcast-complete.tar.gz`
2. Save it to your **Desktop** or **Downloads** folder

### B. Extract the file

**On Mac:**
1. Find `z2b-podcast-complete.tar.gz` in Finder
2. **Double-click** it
3. A folder called `z2b-podcast` will appear ✅

**On Windows:**
1. Right-click `z2b-podcast-complete.tar.gz`
2. If you see **"Extract All"**: Click it, then "Extract"
3. If you DON'T see "Extract All":
   - Download 7-Zip: https://www.7-zip.org/
   - Install it
   - Right-click the file again
   - Choose **7-Zip → Extract Here**
4. A folder called `z2b-podcast` will appear ✅

### C. Verify extraction worked
Open the `z2b-podcast` folder. You should see:
```
✓ app/
✓ components/
✓ lib/
✓ public/
✓ package.json
✓ README.md
✓ etc...
```

---

## 💻 STEP 2: OPEN PROJECT IN VS CODE (2 minutes)

### Option A: Using VS Code Menu
1. Open **VS Code**
2. Click **File → Open Folder**
3. Navigate to and select the `z2b-podcast` folder
4. Click **"Select Folder"** or **"Open"**

### Option B: Using Terminal (Faster)
**Mac/Linux:**
```bash
cd ~/Desktop/z2b-podcast
code .
```

**Windows:**
```bash
cd Desktop\z2b-podcast
code .
```

### ✅ Verify
You should see the file explorer on the left with all project files.

---

## 📦 STEP 3: INSTALL DEPENDENCIES (5 minutes)

### A. Open VS Code Terminal
1. In VS Code, click **Terminal → New Terminal** (top menu)
2. Or press: `Ctrl + ` ` (backtick key)

A terminal panel will open at the bottom.

### B. Install packages
In the terminal, type:
```bash
npm install
```

**Press Enter**

### What happens:
- You'll see lots of text scrolling
- Says "installing packages..."
- Takes 2-5 minutes
- When done, you'll see your prompt again

### ✅ Verify
You should see a new `node_modules/` folder appear in the file explorer.

**⚠️ Troubleshooting:**
- **"npm not found"**: Install Node.js (see requirements above)
- **"Permission denied"**: Try `sudo npm install` (Mac/Linux)
- **Errors about Python**: Ignore them, it's fine
- **Stuck?**: Close terminal, open new one, try again

---

## 🗄️ STEP 4: SET UP SUPABASE DATABASE (10 minutes)

Supabase is your free database. It stores members, content, referrals.

### A. Create Supabase Account
1. Go to: https://supabase.com/
2. Click **"Start your project"**
3. Sign up with GitHub or Email (GitHub is faster)
4. Verify your email if needed

### B. Create New Project
1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in:
   - **Name**: `Z2B Table Banquet`
   - **Database Password**: Create a STRONG password
     - Example: `Z2b!Secure#2026$Pass`
     - ⚠️ **SAVE THIS PASSWORD!** You'll need it later
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
4. Click **"Create new project"**

### C. Wait for setup (2-3 minutes)
You'll see "Setting up your project..."
☕ Take a quick break!

### D. Set up database tables
1. When ready, click **"SQL Editor"** in left sidebar
2. Click **"+ New query"**
3. Go back to VS Code
4. Open the file: `supabase-setup.sql`
5. **Select ALL the text** (Ctrl+A or Cmd+A)
6. **Copy it** (Ctrl+C or Cmd+C)
7. Go back to Supabase browser tab
8. **Paste** into the SQL editor (Ctrl+V or Cmd+V)
9. Click the **"RUN"** button (green, bottom right)

### ✅ Verify
You should see: "Success. No rows returned"

This created all your database tables! 🎉

### E. Get your API keys
1. In Supabase, click the **⚙️ Settings** icon (bottom left)
2. Click **"API"** in the left menu
3. You'll see two important things:

**Copy these NOW:**

📋 **Project URL**
```
https://abcdefghijk.supabase.co
```

📋 **anon public key** (long string starting with "eyJ...")
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

Keep these safe! You'll need them in the next step.

---

## 🔑 STEP 5: CONFIGURE YOUR APP (3 minutes)

### A. Create environment file
In VS Code terminal:

**Mac/Linux:**
```bash
cp .env.local.example .env.local
```

**Windows (Command Prompt):**
```bash
copy .env.local.example .env.local
```

**Windows (PowerShell):**
```bash
Copy-Item .env.local.example .env.local
```

### B. Edit the file
1. In VS Code file explorer (left), click `.env.local`
2. You'll see:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Replace the values:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Save the file** (Ctrl+S or Cmd+S)

### ✅ Verify
Make sure:
- No spaces around the `=` sign
- URL starts with `https://`
- Key is the LONG string (several lines)
- No quote marks around values

---

## 🚀 STEP 6: RUN THE APP! (2 minutes)

### A. Start development server
In VS Code terminal:
```bash
npm run dev
```

### What you'll see:
```
ready - started server on 0.0.0.0:3000
wait  - compiling...
event - compiled client and server successfully
```

### B. Open in browser
1. Open your web browser
2. Go to: **http://localhost:3000**

### 🎉 YOU SHOULD SEE YOUR Z2B TABLE BANQUET WEBSITE!

With:
- Your golden table logo
- Royal purple header
- The banquet table hero image
- "Join the Banquet" button

---

## 👤 STEP 7: CREATE YOUR ADMIN ACCOUNT (5 minutes)

### A. Sign up
1. On the website, click **"Join Now"**
2. Fill in:
   - **Full Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
3. Click **"Join the Banquet"**

### B. Make yourself admin
1. Go back to **Supabase** in your browser
2. Click **"SQL Editor"** (left sidebar)
3. Click **"+ New query"**
4. Type this (replace with YOUR email):
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```
5. Click **"RUN"**

### ✅ Verify
Should say: "Success. 1 row(s) affected"

### C. Refresh your website
1. Go back to http://localhost:3000
2. Press **F5** or refresh
3. You should now see **"Admin"** button in the header! 🎉

---

## 📤 STEP 8: UPLOAD YOUR FIRST CONTENT (5 minutes)

Now let's add some content for your team!

### A. Upload a video to YouTube (or use existing)
For testing, you can use ANY YouTube video.
Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

### B. Add content to your platform
1. Click **"Admin"** button
2. Click **"Upload New Content"**
3. Fill in:
   - **Title**: "Welcome to Z2B"
   - **Description**: "Introduction video"
   - **Type**: Video
   - **File URL**: Paste your YouTube URL
   - **Thumbnail**: (optional - leave blank)
   - ✅ Check **"Make this content public"**
4. Click **"Upload Content"**

### 🎉 Your first content is live!

### C. View it
1. Go back to homepage (click logo)
2. Scroll down to "Featured Content"
3. You should see your video!
4. Click it to play

---

## 👥 STEP 9: INVITE YOUR TEAM MEMBERS (5 minutes)

### A. Get your referral link
1. Click **"Dashboard"**
2. See your **"Your Royal Referral Link"**
3. Click **"Copy Link"**

### B. Share with team
Send them the link via:
- Email
- Slack
- WhatsApp
- Text message

### C. Team members sign up
When they:
1. Click your link
2. Sign up with their email
3. They're automatically tracked as YOUR referral! 🎯

### D. Track who signed up
1. Go to **Admin → Referrals**
2. See everyone who joined through your link!
3. Track who invited who

---

## 📱 STEP 10: INSTALL AS PWA (Optional - 3 minutes)

Your team can install it like an app!

### On iPhone:
1. Open http://localhost:3000 in **Safari**
2. Tap the **Share** button
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. Z2B icon appears on home screen! 📱

### On Android:
1. After 10 seconds on the site, install prompt appears
2. Tap **"Install App"**
3. Done! 🎉

### On Desktop (Chrome):
1. Look for install icon in address bar
2. Click it
3. Click **"Install"**
4. Opens in own window!

---

## 🌐 STEP 11: DEPLOY TO INTERNET (Optional - 10 minutes)

Right now it only works on YOUR computer. To share with team worldwide:

### A. Push to GitHub
1. Go to: https://github.com
2. Sign in (or create account)
3. Click **"New repository"**
4. Name: `z2b-table-banquet`
5. Make it **Private**
6. Click **"Create repository"**

### B. Upload your code
In VS Code terminal:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/z2b-table-banquet.git
git push -u origin main
```

(Replace YOUR-USERNAME with your GitHub username)

### C. Deploy to Vercel (FREE)
1. Go to: https://vercel.com/
2. Click **"Sign Up"** → Use GitHub
3. Click **"Add New"** → **"Project"**
4. **Import** your `z2b-table-banquet` repository
5. In **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_key
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   ```
6. Click **"Deploy"**

### ⏱️ Wait 2-3 minutes...

### 🎉 YOU'RE LIVE!

You'll get a URL like: `https://z2b-table-banquet.vercel.app`

Share THIS link with your team!

### D. Update your Supabase URL
1. Go back to Vercel after deployment
2. Copy your live URL (e.g., `https://z2b-table-banquet.vercel.app`)
3. In Vercel → Settings → Environment Variables
4. Edit `NEXT_PUBLIC_APP_URL`
5. Change to your live URL
6. Redeploy (Vercel → Deployments → 3 dots → Redeploy)

---

## ✅ FINAL CHECKLIST

You should now have:

- ✅ Website running locally (http://localhost:3000)
- ✅ Admin account created
- ✅ At least 1 piece of content uploaded
- ✅ Your referral link ready to share
- ✅ Database set up in Supabase
- ✅ (Optional) Live website on Vercel

---

## 🎯 WHAT YOU CAN DO NOW

### As Admin:
1. **Upload Content**
   - Admin → Upload New Content
   - Add videos, audio, PDFs
   - Toggle public/private

2. **Manage Members**
   - Admin → Members
   - Activate/Suspend/Delete
   - Upgrade to paid

3. **Track Referrals**
   - Admin → Referrals
   - See who invited who
   - Export data

### Your Team Can:
1. Sign up (with your referral link)
2. Browse content
3. Watch videos
4. Get their own referral links
5. Share with THEIR networks
6. Install as PWA app

---

## 🆘 TROUBLESHOOTING

### "npm install" fails
**Solution:**
```bash
# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Website shows blank page
**Check:**
1. Is dev server running? (`npm run dev`)
2. Are you going to `http://localhost:3000`?
3. Check browser console (F12) for errors

### "Invalid Supabase URL"
**Check:**
1. `.env.local` file exists
2. Values have NO quotes
3. URL starts with `https://`
4. Restart dev server (Ctrl+C, then `npm run dev`)

### Database errors
**Solution:**
1. Go to Supabase SQL Editor
2. Run `supabase-setup.sql` again
3. Make sure it says "Success"

### Admin button doesn't appear
**Check:**
1. Did you run the UPDATE profiles SQL?
2. Did you use YOUR email?
3. Did you refresh the page?
4. Log out and log back in

### Can't upload content
**Solution:**
1. Use YouTube/Vimeo URLs for videos
2. Use SoundCloud for audio
3. Use Google Drive share links for PDFs
4. Make sure links are PUBLIC

---

## 📞 QUICK REFERENCE

### Start the app:
```bash
cd z2b-podcast
npm run dev
```

### Open website:
```
http://localhost:3000
```

### Admin pages:
- Content: `http://localhost:3000/admin`
- Members: `http://localhost:3000/admin/members`
- Referrals: `http://localhost:3000/admin/referrals`

### Stop the app:
Press `Ctrl + C` in terminal

### Restart the app:
```bash
npm run dev
```

---

## 🎉 CONGRATULATIONS!

You now have a fully functional Z2B Table Banquet platform!

**Next steps:**
1. Upload 3-5 pieces of content
2. Invite your first team members
3. Track who joins
4. Deploy to Vercel for worldwide access
5. Reward top referrers!

---

## 📚 DOCUMENTATION

Inside your project folder:
- **README.md** - Full documentation
- **QUICKSTART.md** - This guide
- **ADMIN-GUIDE.md** - Admin features
- **REFERRAL-TRACKING.md** - Referral system
- **PWA-GUIDE.md** - Mobile app features
- **DEPLOYMENT.md** - Deployment guide

---

**Need help? Check the documentation or re-read the relevant section above!**

Your Z2B Table Banquet is ready to transform knowledge! 👑✨
