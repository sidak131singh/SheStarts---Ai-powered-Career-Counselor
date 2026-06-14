# SheStarts Career Compass — Architecture Document
**Version 1.0 | June 2026**

---

## 1. System Design

### Overview

SheStarts is a stateless, serverless web application built on Next.js 16 (App Router). It requires no traditional database — all user data is persisted in the browser's `localStorage`, making it fully deployable on Vercel's free tier without any backend infrastructure costs.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Landing  │  │Assessment│  │Dashboard │  │  AI Counselor │   │
│  │  Page    │  │ 8 Steps  │  │  Pages   │  │   (Prerna)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │              │                │           │
│       └──────────────┴──────────────┴────────────────┘          │
│                          Zustand State + localStorage            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / SSE
┌──────────────────────────────▼──────────────────────────────────┐
│                   NEXT.JS SERVER (Vercel Edge)                   │
│                                                                 │
│  ┌─────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ /api/assessment │  │ /api/counselor│  │ /api/employability│  │
│  │  (save/load)    │  │ /stream (SSE) │  │  -score          │  │
│  └─────────────────┘  └───────┬───────┘  └──────────────────┘  │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │ HTTPS API Call
┌───────────────────────────────▼─────────────────────────────────┐
│                     GOOGLE GEMINI 2.5 FLASH                      │
│              generativelanguage.googleapis.com                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Rendering | Next.js App Router (SSR + client components) | SEO for landing page, interactivity for dashboard |
| Data Storage | localStorage (no DB) | Zero cost, works on Vercel free tier, sufficient for demo |
| AI Streaming | Server-Sent Events (SSE) | Real-time token streaming without WebSocket overhead |
| State Management | Zustand | Minimal boilerplate, works with Next.js hydration |
| Styling | Tailwind CSS v4 + inline styles | Rapid UI iteration, no CSS-in-JS runtime cost |

---

## 2. AI Workflow

### Gemini Integration — Counselor API (`/api/counselor/stream`)

```
User types message
        │
        ▼
POST /api/counselor/stream
        │
        ▼
┌───────────────────────────────┐
│  1. Validate Gemini API Key   │
│  2. Build personalised system │
│     prompt with user profile  │
│  3. Clean chat history        │
│     (ensure starts with user) │
└──────────────┬────────────────┘
               │
               ▼
       Try Gemini 2.5 Flash
               │
       ┌───────┴────────┐
       │ Success        │ Failure (404/500)
       ▼                ▼
  Stream SSE       Try Gemini 2.0 Flash
  tokens to             │
  client          ┌─────┴──────┐
                  │ Success    │ Failure
                  ▼            ▼
             Stream SSE   Keyword-based
             tokens       fallback response
```

### Scoring Engine (`lib/scoring/employabilityEngine.ts`)

The 6-dimension score is calculated entirely client-side from the assessment profile:

| Dimension | Weight | Inputs Used |
|---|---|---|
| Skill Readiness | 25% | currentSkills vs. target role requirements |
| Experience Relevance | 20% | yearsOfExperience, lastJobTitle, industry |
| Market Demand | 20% | targetCareerPaths, location, preferredIndustries |
| Gap Management | 15% | gapDurationMonths, gapActivities |
| Learning Trajectory | 10% | dailyStudyHours, targetTimelineMonths |
| Confidence Readiness | 10% | selfConfidenceLevel, clarityOfGoals |

---

## 3. Data Flow

### Assessment → Results Pipeline

```
User fills 8-step form
        │
        ▼
assessmentStore (Zustand)
        │
POST /api/assessment ──────────► .data/app-data.json (local dev)
        │                        localStorage (Vercel production)
        ▼
generateUserResults(profile)
        │
        ├──► employabilityEngine.ts  ──► EmployabilityScore (6 dimensions)
        ├──► careerPaths.ts          ──► Top 5 matched CareerPath[]
        └──► roadmapGenerator.ts     ──► 90-day RoadmapPhase[]
        │
        ▼
Dashboard / Results / Score / Roadmap pages
(all read from localStorage, no repeat API calls)
```

### Chat Message Flow

```
User message (string)
        │
        ▼
counselor/page.tsx
  - append userMessage to messages[]
  - append empty assistantMessage placeholder
  - POST to /api/counselor/stream with:
      { userId, messages[], userProfile }
        │
        ▼
/api/counselor/stream (SSE)
  - builds system prompt with target career path
  - sends to Gemini as streaming chat
        │
        ▼
ReadableStream → SSE chunks → EventSource reader
  - parse `data: { type: 'text', content: '...' }`
  - append each chunk to assistantMessage.content
  - triggers React re-render on every token (live typing effect)
```

---

## 4. Prompt Design

### System Prompt Strategy

The system prompt is dynamically built at request time and injects the full user profile:

```
YOU ARE: Prerna, empathetic AI career counselor for women restarting careers.

CRITICAL PERSONALISATION:
- Target career path: [from user profile]
- ALL advice, courses, companies MUST be specific to [target path]
- Reference actual skills: [user's currentSkills]
- Account for career gap: [durationMonths] months, reason: [reason]

USER CONTEXT:
- Last role: [lastJobTitle] at [lastCompany]
- Years experience: [yearsOfExperience]
- Daily study capacity: [dailyStudyHours] hours
- Target timeline: [targetTimelineMonths] months

RESPONSE RULES:
- 2-3 paragraphs max
- Always end with a concrete next step or question
- Suggest real platforms (Coursera, LinkedIn Learning, NPTEL)
- Never generic advice — always field-specific
```

### Why This Design Works
- **Role injection** prevents Gemini from giving generic career advice
- **Skills injection** makes suggestions immediately actionable
- **Timeline injection** ensures realistic recommendations
- **Ending with a question** keeps users engaged in the conversation

---

## 5. Technology Choices

| Technology | Version | Why Chosen |
|---|---|---|
| **Next.js** | 16.2.9 | App Router + SSR + API routes in one framework |
| **Google Gemini 2.5 Flash** | Latest | Best speed/quality ratio; free tier available; streaming support |
| **Zustand** | 5.x | Smallest bundle size state manager for Next.js |
| **Tailwind CSS v4** | 4.x | Utility-first; zero runtime; v4 uses native CSS variables |
| **Barlow Condensed** | Google Fonts | Bold, uppercase headings matching Women Who Code aesthetic |
| **localStorage** | Browser native | No infrastructure cost; sufficient for MVP/demo |
| **Vercel** | Free tier | Zero-config Next.js deployment; edge functions included |
| **TypeScript** | 5.x | Type safety across the full scoring + recommendation pipeline |
