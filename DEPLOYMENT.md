# 🌐 DEPLOYMENT GUIDE

## Deploy to Vercel (Recommended - FREE)

Vercel is the easiest way to deploy your Next.js app. It's free and takes 5 minutes!

### Prerequisites:
- GitHub account
- Your code pushed to GitHub
- Supabase project set up

### Step-by-Step Deployment:

#### 1. Push to GitHub (if not done)

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Z2B Table Banquet"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/yourusername/z2b-podcast.git
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/Login (use your GitHub account)
3. Click "Add New..." > "Project"
4. Import your GitHub repository
5. Vercel will detect it's a Next.js app automatically

#### 3. Configure Environment Variables

In Vercel deployment settings, add these 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
```

**Important:** For `NEXT_PUBLIC_APP_URL`, use your Vercel URL (you'll get it after first deploy)

#### 4. Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. Your site is LIVE! 🎉

#### 5. Update App URL

After first deployment:
1. Copy your Vercel URL (e.g., `https://z2b-podcast.vercel.app`)
2. Go to Vercel > Your Project > Settings > Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
4. Redeploy (Vercel > Deployments > Three dots > Redeploy)

### Custom Domain (Optional)

Want your own domain like `z2btablebanquet.com`?

1. Buy domain (Namecheap, Google Domains, etc.)
2. In Vercel: Settings > Domains > Add Domain
3. Follow DNS instructions
4. Wait 5-10 minutes for DNS propagation
5. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## 🔄 Auto-Deploy on Git Push

Vercel automatically deploys when you push to GitHub!

```bash
# Make changes to your code
git add .
git commit -m "Update homepage"
git push

# Vercel automatically deploys! 🚀
```

## 📊 Monitoring Your Site

### Vercel Dashboard:
- Real-time deployments
- Error logs
- Performance metrics
- Analytics (free)

### Supabase Dashboard:
- Database queries
- User signups
- Storage usage
- API requests

## 🔐 Security Checklist

Before going live:

✅ Changed default passwords
✅ Updated admin email in database
✅ Tested signup/login flow
✅ Verified RLS policies are working
✅ Tested referral tracking
✅ Content uploads work
✅ Social sharing works

## 💰 Cost Estimate

**Free Tier (Good for 0-1000 users):**
- Vercel: FREE
  - Unlimited deployments
  - 100GB bandwidth/month
  - SSL certificate included
- Supabase: FREE
  - 500MB database
  - 1GB file storage
  - 50GB bandwidth/month
  - Unlimited API requests
- Cloudinary (for media): FREE
  - 25GB storage
  - 25GB bandwidth

**Total: $0/month** 🎉

**Scaling Up (1000-10,000 users):**
- Vercel: Still FREE
- Supabase Pro: $25/month
  - 8GB database
  - 100GB storage
  - Daily backups
- Cloudinary: $0-49/month

**Total: ~$25-75/month**

## 🚨 Troubleshooting

### Build Failures:

**Error: "Module not found"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
git add .
git commit -m "Fix dependencies"
git push
```

**Error: "Environment variable not found"**
- Check Vercel > Settings > Environment Variables
- Make sure all 3 variables are set
- Redeploy after adding variables

### Site Works Locally But Not on Vercel:

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Make sure `.env.local` is in `.gitignore`
4. Check Supabase URL is accessible publicly

### Supabase Connection Issues:

1. Verify API keys in Vercel settings
2. Check Supabase project is active
3. Test API keys with curl:
```bash
curl https://your-project.supabase.co/rest/v1/profiles \
  -H "apikey: your-anon-key"
```

## 📱 Mobile App (Future)

Want native mobile apps? Consider:

- React Native + Expo
- Flutter
- Use same Supabase backend

The current web app works great on mobile browsers!

## 🎯 Performance Tips

### Optimize Images:
- Use WebP format
- Compress before uploading
- Use Cloudinary auto-optimization

### Speed Up Loading:
- Enable Vercel Edge caching
- Use Next.js Image component
- Lazy load videos

### Database Performance:
- Indexes are already set up (in SQL file)
- Monitor slow queries in Supabase
- Archive old referral clicks if needed

## 🔄 Updating Your Site

```bash
# Make changes
npm run dev  # Test locally

# Commit and push
git add .
git commit -m "Added new feature"
git push

# Vercel deploys automatically!
```

## 📧 Set Up Custom Email Domain

For professional emails (info@z2btablebanquet.com):

1. Use Zoho Mail (FREE for 5 users)
2. Or Google Workspace ($6/user/month)
3. Configure DNS records
4. Update Supabase email settings

## 🎉 Launch Checklist

Before announcing to your team:

- [ ] Site deployed and accessible
- [ ] Custom domain set up (optional)
- [ ] Admin account working
- [ ] Upload at least 3 pieces of content
- [ ] Test signup flow with referral code
- [ ] Test content sharing
- [ ] Verify analytics tracking
- [ ] Test on mobile devices
- [ ] Check loading speeds
- [ ] Backup database (Supabase auto-backups Pro plan)

---

**Congratulations! Your podcast platform is LIVE! 🚀**

Share your referral link and start building your community!
