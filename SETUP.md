# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (takes ~2 minutes)

### 2.2 Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `src/db/schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### 2.3 Create Storage Bucket
1. Go to **Storage** in the Supabase dashboard
2. Click **New bucket**
3. Name it: `documents`
4. Make it **Public** (or configure RLS policies later)
5. Click **Create bucket**

### 2.4 Get Your Supabase Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

2. Fill in your `.env.local` file:
```env
# Supabase (from Step 2.4)
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe (optional for now - you can test without it)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (optional for now - AI features won't work without it)
OPENAI_API_KEY=sk-...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Note**: You can start with just Supabase keys and add Stripe/OpenAI later if you want to test basic functionality first.

## Step 4: Run the Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Ready in Xs
```

## Step 5: Open in Browser

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You'll See

1. **Homepage** (`/`) - Landing page with feature overview
2. **Register** (`/auth/register`) - Create an account
3. **Login** (`/auth/login`) - Sign in
4. **Marketplace** (`/marketplace`) - Browse documents (empty until you upload)
5. **Dashboard** (`/dashboard`) - After logging in

## Testing the App

### Without Stripe/OpenAI (Basic Testing)
- ✅ Can register/login
- ✅ Can view marketplace (empty)
- ✅ Can access dashboard
- ❌ Cannot upload documents (needs OpenAI for AI features)
- ❌ Cannot purchase documents (needs Stripe)

### With OpenAI Only
- ✅ Can upload documents
- ✅ AI features work (summary, tags, etc.)
- ❌ Cannot purchase documents (needs Stripe)

### With Both OpenAI + Stripe
- ✅ Full functionality!

## Quick Test Flow

1. **Register** a new account at `/auth/register`
2. **Login** at `/auth/login`
3. Go to **Dashboard** → **Upload Document**
4. Fill out the form and upload a PDF
5. View your upload in **My Uploads**
6. Check the **Marketplace** to see your document
7. Try the **Analytics** page to add grades

## Troubleshooting

### "Unauthorized" errors
- Make sure you're logged in
- Check that Supabase keys are correct
- Verify the database schema was run successfully

### Upload fails
- Check OpenAI API key is set
- Make sure the file is a PDF
- Check Supabase storage bucket exists and is accessible

### Can't see documents
- Make sure RLS policies allow public read access
- Check browser console for errors

### Stripe checkout doesn't work
- Make sure Stripe keys are set
- Use test mode keys (start with `pk_test_` and `sk_test_`)
- Check Stripe dashboard for webhook configuration

## Next Steps

Once it's running:
1. Upload a test PDF document
2. Test the marketplace search/filters
3. Add some grades in Analytics
4. Set up Stripe for payment testing
5. Configure OpenAI for AI features

