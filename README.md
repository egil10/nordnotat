# NordNotes

A modern Scandinavian student platform combining a notes/document marketplace, GPA & course analytics, and AI-powered study tools.

## Features

- 📚 **Notes Marketplace**: Buy and sell high-quality study notes
- 📊 **GPA Analytics**: Track grades and visualize academic progress
- 🤖 **AI Study Tools**: Generate flashcards, summaries, and study guides
- 💳 **Payment Integration**: Stripe Connect for secure transactions (Vipps placeholder included)
- 🎨 **Modern UI**: Dark mode, responsive design with Nordic minimalist aesthetic

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe Connect
- **AI**: OpenAI GPT-4o-mini
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Stripe account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nordnotat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your `.env` file with:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_BASE_URL`: Your app URL (e.g., `http://localhost:3000`)

4. Set up Supabase:

   a. Create a new Supabase project
   
   b. Run the SQL schema from `src/db/schema.sql` in your Supabase SQL editor
   
   c. Create a storage bucket named `documents`:
      - Go to Storage in Supabase dashboard
      - Create a new bucket called `documents`
      - Set it to public (or configure RLS policies)

5. Set up Stripe:

   a. Create a Stripe account
   
   b. Get your API keys from the Stripe dashboard
   
   c. Set up a webhook endpoint pointing to `https://your-domain.com/api/webhook`
   
   d. Listen for `checkout.session.completed` events

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
  app/                    # Next.js app router pages
    auth/                 # Authentication pages
    dashboard/            # Dashboard pages
    marketplace/          # Marketplace pages
    api/                  # API routes
  components/             # React components
    ui/                   # shadcn/ui components
  lib/                    # Utility functions
    supabase.ts          # Supabase client
    stripe.ts            # Stripe integration
    ai.ts                # AI functions
  types/                  # TypeScript types
  db/                     # Database schema
```

## Key Features Implementation

### Document Upload Flow

1. User uploads PDF via `/upload`
2. PDF text is extracted using `pdf-parse`
3. AI generates:
   - Summary
   - Tags (5-10)
   - Course codes
   - Difficulty rating (1-5)
   - Flashcards
4. File is stored in Supabase Storage
5. Metadata is saved to database

### Payment Flow

1. User clicks "Buy Document" on marketplace detail page
2. Stripe checkout session is created
3. User completes payment
4. Webhook saves purchase to database
5. Platform fee (10%) and seller payout (90%) are calculated

### GPA Analytics

- Users can add grades for courses
- GPA is calculated automatically
- Grade distribution is visualized with charts
- Course comparison features (coming soon)

## Database Schema

See `src/db/schema.sql` for the complete database schema. Key tables:

- `profiles`: User profiles
- `documents`: Marketplace documents
- `purchases`: Transaction records
- `flashcards`: AI-generated study cards
- `user_grades`: User grade tracking
- `courses`: Course catalog
- `course_stats`: Course statistics

## Environment Variables

All required environment variables are listed in `.env.example`. Make sure to set them all before running the application.

## Development

- Run `npm run dev` to start the development server
- Run `npm run build` to build for production
- Run `npm run start` to start the production server

## License

MIT
