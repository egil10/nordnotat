# Deployment Guide

## Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel is made by the Next.js team and is the easiest way to deploy Next.js apps.

### Steps:

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/nordnotat.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign up/login with GitHub

3. **Click "Add New Project"**

4. **Import your GitHub repository** (select `nordnotat`)

5. **Configure Environment Variables**:
   - Click "Environment Variables"
   - Add all your variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using Stripe)
     - `STRIPE_SECRET_KEY` (if using Stripe)
     - `STRIPE_WEBHOOK_SECRET` (if using Stripe)
     - `OPENAI_API_KEY` (if using OpenAI)
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel URL after first deploy)

6. **Click "Deploy"**

7. **Update `NEXT_PUBLIC_BASE_URL`**:
   - After first deploy, Vercel will give you a URL like `https://nordnotat.vercel.app`
   - Go back to Environment Variables
   - Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL
   - Redeploy

8. **Update Supabase Settings**:
   - In Supabase Dashboard → Settings → API
   - Add your Vercel URL to "Allowed Redirect URLs" if using OAuth

9. **Update Stripe Webhook** (if using Stripe):
   - In Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhook`
   - Select event: `checkout.session.completed`
   - Copy the webhook secret to Vercel environment variables

**That's it!** Your app will be live at `https://your-app.vercel.app`

---

## Option 2: Deploy to Netlify

1. **Push code to GitHub** (same as above)

2. **Go to [netlify.com](https://netlify.com)** and sign up

3. **Click "Add new site" → "Import an existing project"**

4. **Connect to GitHub** and select your repository

5. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

6. **Add Environment Variables** (same as Vercel)

7. **Deploy!**

---

## Option 3: Deploy to Railway

1. **Push code to GitHub**

2. **Go to [railway.app](https://railway.app)** and sign up

3. **Click "New Project" → "Deploy from GitHub repo"**

4. **Select your repository**

5. **Add Environment Variables** in the Variables tab

6. **Deploy!**

---

## Important Notes Before Deploying:

### 1. Don't Commit `.env.local`
Make sure `.env.local` is in your `.gitignore` (it should be already).

### 2. Update Supabase RLS Policies
Make sure your Supabase Row Level Security policies allow public access where needed (like viewing documents in marketplace).

### 3. Update CORS Settings
- In Supabase Dashboard → Settings → API
- Add your production URL to allowed origins

### 4. Storage Bucket Permissions
- Make sure your `documents` storage bucket in Supabase is configured correctly
- Check RLS policies for storage

### 5. Stripe Webhook URL
- Update your Stripe webhook to point to your production URL
- Use the webhook secret in your environment variables

---

## Quick Checklist:

- [ ] Code pushed to GitHub
- [ ] `.env.local` is NOT committed (check `.gitignore`)
- [ ] All environment variables added to deployment platform
- [ ] Supabase CORS updated with production URL
- [ ] Stripe webhook updated (if using Stripe)
- [ ] Storage bucket permissions checked
- [ ] Test the deployed app!

---

## Custom Domain (Optional):

All platforms allow you to add a custom domain:
- Vercel: Project Settings → Domains
- Netlify: Site Settings → Domain Management
- Railway: Settings → Domains

