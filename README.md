# SheStarts Career Compass
### AI-Powered Career Counseling Platform for Women Returning to Work

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-blue)](https://aistudio.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is SheStarts?

SheStarts Career Compass is a full-stack AI web application that helps women restart their professional careers after a break — whether for childcare, health, or personal reasons. It provides a personalised 90-day roadmap, a career readiness score, AI-powered career matching, and a conversational AI counselor (Prerna) powered by Google Gemini 2.5 Flash.

**Live demo target:** Vercel · (https://careercompass-chi-two.vercel.app/)

---

## Features

| Feature | Description |
|---|---|
| **8-Step Assessment** | Collects education, experience, skills, career gap details, and preferences |
| **Career Readiness Score** | 6-dimension employability score (0–100) with breakdown and projections |
| **AI Career Matching** | Top 5 ranked career paths with match score, salary, and learning timeline |
| **90-Day Roadmap** | Personalised task-based plan with free resource links |
| **AI Counselor (Prerna)** | Streaming chatbot powered by Gemini 2.5 Flash with full user profile context |
| **Resume Analyzer** | ATS compatibility check with specific improvement suggestions |
| **Progress Tracker** | Study log, streak tracking, and milestone completions |
| **Dark Teal / Yellow Theme** | Bold, accessible UI inspired by Women Who Code |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Styling | Tailwind CSS v4, custom CSS variables, Barlow / Barlow Condensed fonts |
| State | Zustand (userStore, assessmentStore, progressStore) |
| AI | Google Gemini 2.5 Flash via `@google/generative-ai` SDK |
| Streaming | Server-Sent Events (SSE) via Next.js Route Handlers |
| Persistence | Browser `localStorage` (Vercel-compatible, no database required) |
| Deployment | Vercel (serverless) |

---

## Project Structure

```
zylentrix/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # All dashboard pages
│   │   ├── dashboard/         # Home dashboard
│   │   ├── assessment/        # 8-step assessment form
│   │   ├── results/           # Career path recommendations
│   │   ├── score/             # Career readiness score
│   │   ├── roadmap/           # 90-day task roadmap
│   │   ├── counselor/         # AI chat (Prerna)
│   │   ├── progress/          # Study tracker
│   │   └── resume/            # Resume analyzer
│   ├── api/
│   │   ├── assessment/        # Save/retrieve assessment profile
│   │   ├── counselor/stream/  # Gemini streaming SSE endpoint
│   │   ├── career-recommendations/
│   │   └── employability-score/
│   └── page.tsx               # Landing page
├── lib/
│   ├── scoring/               # 6-dimension employability engine
│   ├── results/               # Career matching algorithm
│   ├── prompts/               # LLM system prompts
│   └── utils/                 # Formatters, validators
├── store/                     # Zustand state stores
├── types/                     # TypeScript type definitions
└── public/images/             # 7 hero/testimonial images
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google AI Studio API key → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/sidak131singh/SheStarts---Ai-powered-Career-Counselor.git
cd SheStarts---Ai-powered-Career-Counselor

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add your Google AI Studio key to .env.local:
# GOOGLE_AI_API_KEY=your-key-here

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Required
GOOGLE_AI_API_KEY=your-google-ai-studio-key

# Optional (for extended auth features)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string
```

---

## AI Chatbot — Prerna

Prerna is the AI career counselor. She uses your assessment profile to give **field-specific advice**:

- If your target role is **IT / Software**, she suggests tech certifications, coding platforms, and IT companies hiring
- If your target is **HR / People Ops**, she recommends HRBP frameworks and People Analytics courses
- Responses stream in real-time via SSE

**Fallback chain:** Gemini 2.5 Flash → Gemini 2.0 Flash → Intelligent keyword-based fallback

---

## Deployment

See [Vercel deployment guide below](#deploy-to-vercel) or the quick steps:

1. Push this repo to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add `GOOGLE_AI_API_KEY` in Vercel Environment Variables
4. Deploy — done in ~2 minutes

---

## License

MIT © 2026 SheStarts / Zylentrix
