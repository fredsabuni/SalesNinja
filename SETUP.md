# Lead Generation Tool - MVP Setup Guide

## Quick Setup (5 minutes)

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql` and run it
4. Go to **Settings > API** and copy your:
   - Project URL
   - Anon public key

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Install and Run

```bash
npm install
npm run dev
```

## Usage

### For Dealers (Admins)

1. Go to `/login`
2. Enter email: `dealer@example.com` (from sample data)
3. Manage officers at `/admin/officers`

### For Officers (Lead Collection)

1. Go to `/` (home page)
2. Click "Add New Lead"
3. Follow the 3-step process:
   - Select Officer
   - Enter Route Info (with optional GPS)
   - Enter Lead Details

## Database Schema

The app uses 3 simple tables:

- **dealers**: Admin users who manage officers
- **officers**: Sales people who collect leads
- **leads**: Lead data collected by officers

## Features

✅ **Simple Authentication**: Email-based login for dealers  
✅ **Officer Management**: Add, view, delete officers  
✅ **Lead Collection**: 3-step mobile-first form  
✅ **GPS Capture**: Optional location tracking  
✅ **Offline Ready**: Works without internet  
✅ **Mobile First**: Optimized for phones/tablets  

## Next Steps

1. Add your real dealer data to the `dealers` table
2. Have dealers add their officers
3. Start collecting leads!

## Support

This is an MVP - keep it simple! The focus is on:
- Easy lead collection
- Simple officer management  
- Clean mobile experience

No complex features needed for now.