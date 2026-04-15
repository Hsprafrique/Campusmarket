# Campus Deal Spot — Supabase Edition

A campus marketplace for Nigerian students, fully migrated from base44 to Supabase.

---

## ⚡ Quick Start

### 1. Create Your Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** from Settings → API

### 2. Run the Database Schema
1. In Supabase Dashboard → **SQL Editor**, open a new query
2. Paste the entire contents of **`supabase-schema.sql`** and run it
3. This creates all tables, RLS policies, indexes, and triggers

### 3. Create Storage Buckets
In Supabase Dashboard → **Storage** → New Bucket, create:
| Bucket Name | Public |
|---|---|
| `listing-images` | ✅ Yes |
| `store-assets` | ✅ Yes |
| `avatars` | ✅ Yes |

### 4. Set Up Environment Variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install & Run
```bash
npm install
npm run dev
```

---

## 🔐 Authentication

The app uses **Supabase Auth** with:
- **Email/Password** sign-up and sign-in
- **Google OAuth** (enable in Supabase → Authentication → Providers → Google)

On first login, users are routed to `/Onboarding` to complete their profile (campus, matric number, user type).

---

## 🗄️ Database Tables

| Table | Description |
|---|---|
| `profiles` | Extended user data (campus, matric, user_type, subscription_plan) |
| `listings` | All product/service listings with 30-day expiry |
| `stores` | Seller stores with logo, banner, contact info |
| `conversations` | Chat threads between buyers and sellers |
| `messages` | Individual chat messages with real-time support |
| `featured_listings` | Featured listing purchase records |

---

## ⏰ Listing Expiry (30 Days)

Listings automatically expire 30 days after admin approval.

**To automate expiry**, deploy the Edge Function:
```bash
# Install Supabase CLI first
supabase functions deploy expire-listings

# Then schedule it hourly in SQL Editor:
select cron.schedule('expire-listings', '0 * * * *', $$
  select net.http_post(
    url := 'https://<your-project-ref>.supabase.co/functions/v1/expire-listings',
    headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
  )
$$);
```

---

## 🏪 Stores

Sellers can create a store from the **My Store** page (accessible from the dropdown menu).

Each store has:
- Name, description, campus
- Logo and banner images
- WhatsApp & Instagram contact
- All their listings displayed together

---

## 👑 Admin Access

To make a user an admin, run this SQL in the Supabase SQL editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

Admins can access:
- `/AdminListings` — approve/reject pending listings
- `/AdminMonetization` — view revenue and user stats

---

## 💳 Payment Integration

The Pricing page and Feature Listing page are wired for payment but use a `window.confirm()` placeholder.

To integrate **Paystack** or **Flutterwave**, replace the `handleUpgrade` and `handlePurchase` functions in:
- `src/pages/Pricing.jsx`
- `src/pages/FeatureListing.jsx`

---

## 📁 Key Files

```
src/
  api/
    supabaseApi.js      ← All DB operations (auth, listings, stores, messages)
  lib/
    supabase.js         ← Supabase client initialisation
    AuthContext.jsx     ← Auth state provider (useAuth hook)
  pages/
    Auth.jsx            ← Sign in / Sign up (email + Google OAuth)
    Onboarding.jsx      ← First-time profile setup
    Home.jsx            ← Landing page
    Browse.jsx          ← Browse all listings with filters
    CreateListing.jsx   ← Upload and submit a listing
    MyListings.jsx      ← Manage your listings
    MyStore.jsx         ← Create/edit your seller store
    Messages.jsx        ← Conversations list
    Chat.jsx            ← Real-time chat
    Profile.jsx         ← User profile settings
    Pricing.jsx         ← Subscription plans
    FeatureListing.jsx  ← Feature a listing
    AdminListings.jsx   ← Admin: approve listings
    AdminMonetization.jsx ← Admin: revenue dashboard
  components/
    listings/ListingCard.jsx
    chat/ChatButton.jsx
    home/ ...
supabase/
  functions/
    expire-listings/index.ts  ← Edge Function for auto-expiry
supabase-schema.sql     ← Full DB schema (run this first!)
.env.example            ← Environment variable template
```
