# 👑 Admin Member Management Guide

## Overview

The Z2B Table Banquet admin panel now includes **comprehensive member management** capabilities. As an admin, you can:

✅ View all members with detailed information
✅ Activate, suspend, or delete member accounts
✅ Upgrade members from free to paid
✅ Track member status and payment information
✅ Monitor referral statistics
✅ Export member data to CSV
✅ Filter and search members

## Access Admin Panel

### Become an Admin

After signing up, make yourself an admin:

1. Go to Supabase SQL Editor
2. Run this query:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
```
3. Refresh the website
4. You'll see "Admin" button in navigation

### Admin URLs

- **Content Management**: `/admin`
- **Member Management**: `/admin/members`

## Member Management Dashboard

### 📊 Dashboard Stats

The member management page shows real-time statistics:

- **Total Members** - All registered users
- **Active** - Members with active accounts
- **Suspended** - Temporarily suspended accounts
- **Paid** - Premium members
- **Free** - Free tier members

### 🔍 Search & Filter

**Search Bar:**
- Search by email
- Search by name
- Search by referral code

**Status Filter:**
- All Status
- Active only
- Suspended only
- Deleted only

**Membership Filter:**
- All Types
- Paid members only
- Free members only

### 📋 Member Information

Each member row shows:

**Basic Info:**
- Full name
- Email address
- Referral code

**Status Badge:**
- 🟢 Active - Green badge
- 🟡 Suspended - Yellow badge
- 🔴 Deleted - Red badge

**Membership Badge:**
- 👑 Paid - Gold badge with crown
- 🎁 Free - Gray badge

**Statistics:**
- Total referrals generated
- Join date
- Subscription end date (for paid members)

## Member Actions

### ✅ Activate Member

**When to use:** Reactivate a suspended account

**Steps:**
1. Find suspended member
2. Click green ✓ icon
3. Confirm activation
4. Member can log in immediately

**Effect:**
- Status changes to "Active"
- Member regains full access
- Can log in and use all features

### 🚫 Suspend Member

**When to use:** Temporarily restrict access (violations, non-payment, etc.)

**Steps:**
1. Find active member
2. Click yellow ban icon
3. Confirm suspension
4. Member is logged out

**Effect:**
- Status changes to "Suspended"
- Cannot log in
- Cannot access content
- Shown "Access Denied" page
- Can be reactivated later

### 🗑️ Delete Member

**When to use:** Permanently remove account (serious violations, user request)

**Steps:**
1. Find member
2. Click red trash icon
3. Read warning
4. Confirm deletion

**Effect:**
- Status changes to "Deleted"
- Cannot log in
- Cannot access content
- Data retained in database (soft delete)
- Cannot be easily reversed

**⚠️ Important:** This is a soft delete. The account is marked as deleted but data is retained. For GDPR compliance, you may need to permanently delete data.

### 👑 Upgrade to Paid

**When to use:** Grant premium access to a member

**Steps:**
1. Find free member
2. Click gold crown icon
3. Confirm upgrade

**Effect:**
- Membership type changes to "Paid"
- Subscription end date set to 1 year from now
- Gets access to all premium content
- Shows gold badge

**Note:** In production, integrate with Stripe/PayPal for automatic upgrades.

## Member Status System

### Status Types

**Active:**
- ✅ Full access to platform
- ✅ Can log in
- ✅ Can view content
- ✅ Can use referral system

**Suspended:**
- ❌ No access to platform
- ❌ Cannot log in
- ❌ Shown "Access Denied" page
- ℹ️ Data retained
- ✅ Can be reactivated

**Deleted:**
- ❌ No access to platform
- ❌ Cannot log in
- ❌ Account deactivated
- ℹ️ Data retained (soft delete)
- ⚠️ Difficult to reverse

## Membership Types

### Free Members

**Access:**
- ✅ Public content
- ✅ Basic features
- ✅ Referral system
- ❌ Premium content

**Badge:** Gray with gift icon

### Paid Members

**Access:**
- ✅ All public content
- ✅ All premium content
- ✅ Advanced features
- ✅ Priority support

**Badge:** Gold with crown icon

**Subscription:**
- End date shown in member row
- Auto-set to 1 year when upgraded
- Manually extendable in database

## Export Data

### CSV Export

Click "Export CSV" button to download:

**Included Data:**
- Email address
- Full name
- Status
- Membership type
- Referral code
- Total referrals
- Join date

**Use Cases:**
- Backup member data
- Import to CRM
- Email marketing
- Analytics

**Filename Format:**
`z2b-members-2026-02-11.csv`

## Database Management

### Manual Database Queries

**View all members:**
```sql
SELECT 
  email, 
  full_name, 
  status, 
  membership_type, 
  total_referrals,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

**Count by status:**
```sql
SELECT 
  status, 
  COUNT(*) as count
FROM profiles
GROUP BY status;
```

**Find suspended members:**
```sql
SELECT email, full_name
FROM profiles
WHERE status = 'suspended';
```

**Extend subscription:**
```sql
UPDATE profiles
SET subscription_end_date = '2027-02-11'
WHERE email = 'user@example.com';
```

**Manually upgrade to paid:**
```sql
UPDATE profiles
SET 
  membership_type = 'paid',
  subscription_end_date = NOW() + INTERVAL '1 year'
WHERE email = 'user@example.com';
```

## Security & Access Control

### Row Level Security (RLS)

**Suspended/Deleted users:**
- Blocked by RLS policies
- Cannot access content table
- Cannot update their profile
- Shown access denied page

**Active users:**
- Full access to their profile
- Can view content based on membership
- Can update own information

**Admins:**
- Can view all profiles
- Can update any profile
- Full member management access

## Best Practices

### ✅ Do:

1. **Communicate before suspending**
   - Email user first
   - Explain reason
   - Give chance to resolve

2. **Document actions**
   - Keep notes on why accounts were suspended
   - Track in separate system if needed

3. **Review regularly**
   - Check suspended accounts monthly
   - Clean up deleted accounts periodically

4. **Use suspension first**
   - Suspend before deleting
   - Allows users to appeal

5. **Monitor paid subscriptions**
   - Check expiration dates
   - Send renewal reminders

### ❌ Don't:

1. **Don't delete without warning**
   - Always suspend first
   - Give users time to respond

2. **Don't forget to communicate**
   - Users should know why they're suspended
   - Provide contact information

3. **Don't abuse admin access**
   - Only use for legitimate reasons
   - Keep admin account secure

## Automation Ideas

### Future Enhancements

**Automatic Suspension:**
```javascript
// Suspend members with expired paid subscriptions
const expiredMembers = await supabase
  .from('profiles')
  .select('*')
  .eq('membership_type', 'paid')
  .lt('subscription_end_date', new Date().toISOString())
  
for (const member of expiredMembers) {
  await supabase
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('id', member.id)
  
  // Send email notification
}
```

**Payment Integration:**
```javascript
// Webhook from Stripe
stripe.webhooks.handle('customer.subscription.created', async (event) => {
  await supabase
    .from('profiles')
    .update({
      membership_type: 'paid',
      subscription_end_date: event.subscription.end_date
    })
    .eq('email', event.customer.email)
})
```

**Automatic Renewal Reminders:**
```javascript
// Run daily cron job
const expiringIn7Days = await supabase
  .from('profiles')
  .select('*')
  .eq('membership_type', 'paid')
  .gte('subscription_end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  .lte('subscription_end_date', new Date(Date.now() + 8 * 24 * 60 * 60 * 1000))

// Send renewal reminders
```

## Troubleshooting

### Member Can't Access After Activation

**Check:**
1. Verify status is "active" in database
2. Ask member to log out and log in again
3. Clear browser cache
4. Check RLS policies are correct

### Filter Not Working

**Solutions:**
1. Refresh the page
2. Clear search/filter and try again
3. Check browser console for errors

### Export CSV Empty

**Causes:**
- Filters too restrictive
- No members in database
- Browser blocking download

**Solutions:**
- Remove all filters
- Check pop-up blocker settings
- Try different browser

### Upgrade Not Showing

**Check:**
1. Database was updated: `membership_type = 'paid'`
2. Refresh page
3. Check subscription_end_date is set

## Member Support

### When Members Contact You

**"Why was I suspended?"**
- Check database for notes
- Review their activity
- Explain reason professionally
- Offer resolution path

**"Can I get a refund?"**
- Check membership type
- Review subscription date
- Process through payment provider
- Update membership status

**"I can't log in"**
- Check their status in admin panel
- If suspended/deleted, explain why
- Provide resolution steps
- Reactivate if appropriate

## Compliance & Privacy

### GDPR Right to Erasure

If user requests data deletion:

1. Export their data first
2. Delete from profiles table:
```sql
DELETE FROM profiles WHERE email = 'user@example.com';
```
3. Delete from referral_clicks
4. Delete from content if they created any
5. Document deletion

### Data Retention

**Recommended:**
- Active accounts: Keep indefinitely
- Suspended: Review after 90 days
- Deleted: Keep 30 days then permanently delete

## Analytics & Reporting

### Key Metrics to Track

1. **Growth Rate**
   - New members per week/month
   - Paid vs free ratio

2. **Churn**
   - Suspended accounts
   - Deleted accounts
   - Expired subscriptions

3. **Engagement**
   - Last login dates
   - Active vs inactive

4. **Revenue**
   - Total paid members
   - Subscription renewals
   - Average lifetime value

### Generate Reports

**Monthly Member Report:**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_members,
  SUM(CASE WHEN membership_type = 'paid' THEN 1 ELSE 0 END) as paid,
  SUM(CASE WHEN membership_type = 'free' THEN 1 ELSE 0 END) as free
FROM profiles
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

## Support Contact

If you need help with member management:
- Check this guide first
- Review Supabase dashboard
- Contact: support@z2btable.com

---

**You now have complete control over your Z2B Table Banquet member base!** 👑

Use these tools responsibly to maintain a healthy, engaged community.
