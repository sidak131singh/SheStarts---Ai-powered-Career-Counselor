# SheStarts Career Compass — Setup & Deployment Guide

## 🚀 Quick Start (Local Development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Demo Flow for Client Presentation

### Option A — Quick Demo (No Setup Required)
1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"View Priya's Story"** → Auto-populates Priya's profile
3. Explore: Dashboard → Career Paths → Score → Roadmap → Chat

### Option B — Full User Flow
1. Click **"Start Free Assessment"** on landing page
2. Complete all 8 steps (about 8 minutes)
3. Gets redirected to Dashboard with personalized results
4. Explore all features from the sidebar

---

## 🤖 Enabling Real AI (Anthropic)

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Update `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-real-key-here
   ```
3. Restart dev server — the AI counselor (Prerna) will use real Claude responses

**Without API key:** The app uses intelligent fallback responses (still impressive for demos!)

---

## ☁️ Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add -A
git commit -m "feat: complete SheStarts Career Compass implementation"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: `.` (project root)

### Step 3: Set Environment Variables in Vercel
In your Vercel project settings → Environment Variables:

| Key | Value | Required |
|-----|-------|---------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Yes (for AI features) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` | Yes |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Yes |

### Step 4: Deploy
Vercel auto-deploys on every push to `main`.

### ⚠️ Important Vercel Note
Vercel serverless functions have **ephemeral file systems** — the `.data/` folder doesn't persist between requests. 

**The app handles this gracefully:**
- All user data is stored in **browser localStorage**
- API routes compute results from data passed in requests
- For production, connect Supabase (see below)

---

## 🗄️ Production Database (Supabase)

For a production deployment that stores user data across sessions:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `docs/architecture.md` in Supabase SQL editor
3. Add to Vercel environment variables:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   DATABASE_URL=postgresql://postgres:...
   ```

---

## 🎯 All Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, testimonials, FAQ |
| `/login` | Sign in (email + name → localStorage UUID) |
| `/signup` | Create account |
| `/assessment` | 8-step career assessment wizard |
| `/dashboard` | Main hub with score, tasks, quick actions |
| `/results` | AI career path recommendations |
| `/score` | Employability score breakdown |
| `/roadmap` | Interactive 30/60/90-day plan |
| `/counselor` | AI chat with "Prerna" (streaming) |
| `/progress` | Study time tracker + milestones |
| `/resume` | Resume analyzer + ATS score |
| `/demo` | One-click demo with Priya's profile |

---

## 🛠️ Architecture Decisions

- **No auth required for demo**: Uses localStorage UUID for user identification
- **Stateless APIs**: All computation done server-side from profile data passed in requests
- **Graceful AI fallback**: Works with or without Anthropic API key
- **localStorage-first**: Profile stored locally → works on Vercel without database
- **Local JSON for dev**: `.data/app-data.json` for development persistence
