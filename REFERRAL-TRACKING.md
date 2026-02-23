# 🔗 Referral Tracking Guide - "Who Invited Who"

## Overview

Your Z2B Table Banquet platform now includes **complete referral tracking** so you can see exactly who invited who, track referral performance, and reward your best advocates!

## Access Referral Analytics

**Admin URL:** `/admin/referrals`

**How to get there:**
1. Log in as admin
2. Click "Admin" in navigation
3. Click "Referrals" button

## Dashboard Features

### 📊 Key Statistics (Top Cards)

**1. Total Referrals**
- Total number of members invited by others
- Shows growth from referral program
- Updates in real-time

**2. Top Referrer**
- Name/email of your best advocate
- Person who brought in most members
- Great for recognition/rewards

**3. Average Per Member**
- Average referrals per member
- Indicates program effectiveness
- Industry standard: 0.5-2.0 is good

**4. Conversion Rate**
- % of members who came via referral
- Shows program success
- Higher = more viral growth

### 🏆 Referral Leaderboard (Left Panel)

Shows all members who have made referrals, ranked by performance.

**Information Displayed:**
- 🥇 Rank (1, 2, 3, etc.)
- Member name & email
- Referral code
- Total referrals
- Active referrals (still using platform)
- Paid referrals (upgraded to premium)

**Features:**
- 🔍 **Search bar** - Find specific referrers
- 📥 **Export button** - Download as CSV
- 🖱️ **Click any member** - See who they invited

**Ranking:**
- Sorted by total referrals (highest first)
- Scroll to see all referrers
- Visual ranking with numbered badges

### 🌳 Referral Tree (Right Panel)

**Shows exactly who invited who!**

**How to use:**
1. Click any member in the leaderboard
2. See detailed breakdown:
   - Referrer info (highlighted in royal purple)
   - Complete list of who they invited
   - Status of each referral (Active/Suspended/Paid)
   - Join dates
   - Multi-level referrals

**Example View:**
```
👑 REFERRER: John Doe (john@example.com)
   Code: ABC12345

📋 INVITED MEMBERS (5):
   
   → Sarah Smith (sarah@example.com)
     Active | 👑 Paid | Joined Feb 1, 2026
     Has 2 referrals [View →]
   
   → Mike Johnson (mike@example.com)
     Active | Free | Joined Feb 3, 2026
   
   → Lisa Williams (lisa@example.com)
     Suspended | Free | Joined Feb 5, 2026
```

**Multi-Level Tracking:**
- If an invited member has referrals, click "View →"
- See their referral tree
- Track growth across generations
- Understand viral spread

## Understanding the Data

### Referral Chain Example

```
Alice (Original Member)
  ├─ Bob (invited by Alice)
  │   ├─ Charlie (invited by Bob)
  │   └─ Diana (invited by Bob)
  ├─ Eve (invited by Alice)
  └─ Frank (invited by Alice)
      └─ Grace (invited by Frank)
```

**In the dashboard:**
- Alice shows: 3 total referrals (Bob, Eve, Frank)
- Bob shows: 2 total referrals (Charlie, Diana)
- Frank shows: 1 total referral (Grace)

### Member Badges

**Status Badges:**
- 🟢 **Active** - Can access platform
- 🟡 **Suspended** - Temporarily blocked
- 🔴 **Deleted** - Account deactivated

**Membership Badges:**
- 👑 **Paid** - Premium member (gold badge)
- 🎁 **Free** - Basic member (gray badge)

### Referral Quality Metrics

**Active Referrals:**
- Members still using the platform
- Status = "Active"
- Higher = better quality referrals

**Paid Referrals:**
- Members who upgraded to paid
- Most valuable referrals
- Track for commission/rewards

## Export Referral Data

### CSV Export

Click **"Export"** button to download:

**Included Columns:**
1. Referrer Name
2. Referrer Email
3. Referral Code
4. Total Referrals
5. Active Referrals
6. Paid Referrals

**Use Cases:**
- Reward top referrers
- Import to spreadsheet
- Commission calculations
- Marketing analysis

**Filename:**
`z2b-referrals-2026-02-11.csv`

## Finding Specific Information

### "Who invited this person?"

**Method 1: Search in Members Page**
1. Go to `/admin/members`
2. Find the member
3. Look at their row - shows referral code
4. Go to `/admin/referrals`
5. Search for that referral code

**Method 2: Database Query**
```sql
SELECT 
  p1.email as member,
  p2.email as invited_by
FROM profiles p1
LEFT JOIN profiles p2 ON p1.referred_by = p2.referral_code
WHERE p1.email = 'member@example.com';
```

### "Who did this person invite?"

**Method 1: Referral Dashboard**
1. Go to `/admin/referrals`
2. Search for the member's name/email
3. Click their row
4. See complete list in referral tree

**Method 2: Database Query**
```sql
SELECT 
  email, 
  full_name, 
  status,
  membership_type,
  created_at
FROM profiles
WHERE referred_by = 'ABC12345'
ORDER BY created_at DESC;
```

### "Show me all orphan members (no referrer)"

**Database Query:**
```sql
SELECT 
  email, 
  full_name, 
  created_at
FROM profiles
WHERE referred_by IS NULL
ORDER BY created_at DESC;
```

These are direct sign-ups without referral code.

### "Show me multi-generational referrals"

**Database Query:**
```sql
-- Level 1: Direct referrals
WITH RECURSIVE referral_tree AS (
  SELECT 
    id,
    email,
    referral_code,
    referred_by,
    1 as level
  FROM profiles
  WHERE referral_code = 'ABC12345'
  
  UNION ALL
  
  -- Level 2+: Indirect referrals
  SELECT 
    p.id,
    p.email,
    p.referral_code,
    p.referred_by,
    rt.level + 1
  FROM profiles p
  INNER JOIN referral_tree rt ON p.referred_by = rt.referral_code
  WHERE rt.level < 5
)
SELECT * FROM referral_tree ORDER BY level, email;
```

## Reward System Ideas

### Automatic Recognition

**Top Referrer Badge:**
```javascript
// Award badge to #1 referrer
const topReferrer = leaderboard[0]
await supabase
  .from('profiles')
  .update({ badge: 'top_referrer' })
  .eq('id', topReferrer.id)
```

**Milestones:**
- 5 referrals → Bronze badge
- 10 referrals → Silver badge
- 25 referrals → Gold badge
- 50 referrals → Platinum badge

### Commission Tracking

**Example: $10 per paid referral**
```javascript
const commissions = leaderboard.map(member => ({
  member: member.email,
  paid_referrals: member.paid_referrals,
  commission: member.paid_referrals * 10
}))
```

Export this to pay affiliates!

### Contests & Leaderboards

**Monthly Contest:**
- Track referrals by date range
- Announce winner
- Award prizes

**Sample Query:**
```sql
SELECT 
  p1.email as referrer,
  COUNT(*) as new_referrals_this_month
FROM profiles p1
JOIN profiles p2 ON p2.referred_by = p1.referral_code
WHERE p2.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p1.email
ORDER BY new_referrals_this_month DESC
LIMIT 10;
```

## Analytics & Insights

### Referral Program Health

**Good Signs:**
- Conversion rate > 20%
- Average per member > 1.0
- Growing leaderboard
- Multiple paid referrals

**Warning Signs:**
- Conversion rate < 10%
- Most referrals inactive/deleted
- Few paid conversions
- Declining trend

### Track Over Time

**Monthly Referral Growth:**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as referrals,
  SUM(CASE WHEN membership_type = 'paid' THEN 1 ELSE 0 END) as paid_referrals
FROM profiles
WHERE referred_by IS NOT NULL
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Referral Source Analysis

**Which members bring quality referrals?**
```sql
SELECT 
  p1.email as referrer,
  COUNT(*) as total_referrals,
  SUM(CASE WHEN p2.status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN p2.membership_type = 'paid' THEN 1 ELSE 0 END) as paid,
  ROUND(
    100.0 * SUM(CASE WHEN p2.status = 'active' THEN 1 ELSE 0 END) / COUNT(*),
    1
  ) as retention_rate
FROM profiles p1
JOIN profiles p2 ON p2.referred_by = p1.referral_code
GROUP BY p1.email
HAVING COUNT(*) >= 5
ORDER BY retention_rate DESC;
```

## Integration Ideas

### Email Notifications

**Notify referrer when someone signs up:**
```javascript
// In signup flow
if (referralCode) {
  const { data: referrer } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('referral_code', referralCode)
    .single()
  
  // Send email
  await sendEmail({
    to: referrer.email,
    subject: 'Someone joined through your link! 🎉',
    body: `Great news! You just referred a new member to Z2B Table Banquet.`
  })
}
```

### Referral Milestones

**Celebrate achievements:**
```javascript
// When member hits 10 referrals
if (member.total_referrals === 10) {
  await sendEmail({
    to: member.email,
    subject: '🏆 You hit 10 referrals!',
    body: 'Congratulations! You are now a Z2B Champion...'
  })
}
```

### Leaderboard Widget

**Show top referrers publicly:**
```javascript
// Public leaderboard page
export async function getTopReferrers() {
  const { data } = await supabase
    .from('profiles')
    .select('full_name, total_referrals')
    .gt('total_referrals', 0)
    .order('total_referrals', { ascending: false })
    .limit(10)
  
  return data
}
```

## Privacy Considerations

### What to Show Publicly

**✅ Safe to show:**
- First name only
- Referral counts
- General rankings

**❌ Keep private:**
- Full email addresses
- Referral codes (admin only)
- Detailed referral trees
- Personal information

### GDPR Compliance

**Member data rights:**
- Right to see who they referred
- Right to see who referred them
- Right to opt out of leaderboard

**Implementation:**
```sql
-- Add privacy flag
ALTER TABLE profiles
ADD COLUMN show_in_leaderboard BOOLEAN DEFAULT TRUE;

-- Filter leaderboard
SELECT * FROM profiles
WHERE total_referrals > 0
AND show_in_leaderboard = TRUE;
```

## Troubleshooting

### Referral count doesn't match

**Check database:**
```sql
-- Recalculate all referral counts
UPDATE profiles p
SET total_referrals = (
  SELECT COUNT(*)
  FROM profiles
  WHERE referred_by = p.referral_code
);
```

### Missing referrals in tree

**Verify referral code:**
```sql
SELECT 
  email,
  referred_by
FROM profiles
WHERE referred_by = 'ABC12345';
```

### Export button not working

**Solutions:**
- Check browser pop-up blocker
- Try different browser
- Check console for errors

## Best Practices

### ✅ Do:

1. **Review regularly** - Check leaderboard weekly
2. **Reward top referrers** - Recognition motivates
3. **Track quality** - Not just quantity
4. **Monitor inactive referrals** - Improve retention
5. **Use insights** - Make data-driven decisions

### ❌ Don't:

1. **Ignore context** - Some periods naturally higher
2. **Obsess over numbers** - Quality > quantity
3. **Forget privacy** - Respect member data
4. **Neglect communication** - Thank your referrers
5. **Manipulate rankings** - Be transparent

## Quick Reference

### Key URLs
- Referral dashboard: `/admin/referrals`
- Member management: `/admin/members`
- Content management: `/admin`

### Key Metrics
- **Good conversion rate:** 20%+
- **Good retention:** 70%+ active
- **Good paid conversion:** 10%+

### Database Tables
- `profiles` - Member data
- `referral_clicks` - Click tracking
- `referred_by` field - Links members

---

**You now have complete visibility into your referral network!** 🔗

See exactly who invited who, reward your best advocates, and grow your community exponentially! 👑🚀
