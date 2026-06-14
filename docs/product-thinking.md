# SheStarts Career Compass — Product Thinking Document
**Version 1.0 | June 2026**

---

## 1. Problem Understanding

### The Core Problem

Over 48 million women in India have taken career breaks — primarily for childcare, caregiving, or personal health. When they try to return to work, they face a compounding set of barriers:

1. **Skill gap anxiety** — "My skills are outdated. I don't know where to start."
2. **Confidence erosion** — Years away from a professional environment lowers self-belief
3. **Information overload** — Google searches return generic advice not tailored to their background
4. **Gap stigma** — Interviews become stressful the moment "career break" is mentioned
5. **No personalised roadmap** — Generic job portals show roles but no path to get there

Existing solutions (Naukri, LinkedIn, job boards) treat career returners identically to active job seekers. They provide no empathy, no personalisation for gaps, and no structured re-entry plan.

### Who We're Designing For

**Primary persona — "Priya":**
- Age 28–40, Tier 1 or 2 Indian city
- 2–8 years of prior professional experience (HR, IT, finance, marketing)
- Career break of 1–6 years (maternity, childcare, family illness)
- Has internet access, moderate tech comfort
- Goal: re-enter the workforce in 3–6 months
- Fear: being judged for the gap; not knowing which skill to learn first

### Why This Problem is Worth Solving

- The Indian women re-entry talent pool is estimated at ₹15 lakh crore in untapped economic value
- Companies with return-to-work programmes report 80%+ retention after 12 months
- No product in the Indian market combines assessment + personalised roadmap + AI counseling in one free tool

---

## 2. Design Decisions

### Decision 1: Assessment-First, Not Job-Search-First

Most tools start with "search for jobs." We start with a **profile assessment** because:
- Returners don't yet know which job is right for them
- Understanding where they are (score) before where they want to go (recommendations) reduces anxiety
- The assessment data becomes the backbone of all personalisation downstream

### Decision 2: One AI Counselor with a Name and Personality

We named the AI counselor **"Prerna"** (Hindi for "inspiration") and gave her a consistent persona because:
- Research shows users engage 60% longer with named, personality-driven AI interfaces vs. generic chatbots
- Women returning to work benefit from a judgement-free, empathetic voice
- A persona creates trust; a generic "AI Assistant" does not

### Decision 3: No Database Required (localStorage-First)

For the MVP and demo, all data is stored in the browser:
- **Zero infrastructure cost** — deployable on Vercel free tier today
- **Instant demo** — no signup friction beyond a name and email
- **Privacy by default** — data never leaves the user's device
- Tradeoff: data is lost if the browser cache is cleared (acceptable for MVP)

### Decision 4: Score Before Recommendations

The Career Readiness Score is shown on the dashboard **before** detailed recommendations because:
- A number (e.g. "72/100") frames the user's current state concretely
- It transforms a vague feeling of "I'm not ready" into a measurable, improvable metric
- Projections (+8 pts by Day 30, +25 pts by Day 90) give a sense of achievability

### Decision 5: Bold Visual Identity

The dark teal + yellow colour scheme and uppercase Barlow Condensed typography was a deliberate choice:
- Inspired by Women Who Code — a trusted, respected brand in the women-in-tech space
- Boldness communicates strength and confidence, countering the vulnerability of the user's situation
- High contrast improves accessibility for a broad age demographic

---

## 3. Future Improvements

### Short Term (1–3 months)
| Improvement | Impact | Effort |
|---|---|---|
| Supabase integration for persistent cross-device data | High | Medium |
| Resume PDF upload + actual text extraction | High | Medium |
| Mock interview module (Prerna asks questions, user responds) | High | Medium |
| Email digest: weekly progress summary | Medium | Low |
| WhatsApp integration for daily nudges | Medium | Medium |

### Medium Term (3–6 months)
| Improvement | Impact | Effort |
|---|---|---|
| Community feed — peer support between returners | High | High |
| Employer portal — companies post "return-to-work" roles | Very High | High |
| Certification tracker — verify completed courses via API | Medium | Medium |
| Multi-language support (Hindi, Tamil, Bengali) | High | High |
| Mobile app (React Native) with offline mode | High | High |

### Long Term (6–18 months)
- **AI-powered resume rewriting** — Prerna rewrites resume sections in real-time
- **Live mentorship matching** — Connect returners with women who successfully re-entered the same field
- **B2B SaaS model** — License to corporates running return-to-work programmes (Infosys, TCS, Accenture all have active programmes)
- **Outcome tracking** — Did the user get a job? Measure 90-day placement rate

---

## 4. Scalability Considerations

### Current Architecture Limits

| Component | Current Limit | At Scale Concern |
|---|---|---|
| Data storage | localStorage (per browser) | Lost on cache clear; no cross-device sync |
| AI API | Gemini free tier (~60 req/min) | Rate limiting under concurrent users |
| Assessment processing | Client-side JS | Fine up to ~10,000 users; no server load |
| File storage | None (no resume upload yet) | Will need cloud storage (S3/Supabase) |

### Scaling Path

**Phase 1 (0–1,000 users) — Current architecture**
- localStorage + Vercel serverless is sufficient
- Gemini free tier handles load comfortably
- Zero infrastructure cost

**Phase 2 (1,000–50,000 users)**
- Add Supabase PostgreSQL for profile persistence
- Add Redis cache layer for repeated scoring calculations
- Implement Gemini API key rotation to stay within rate limits
- CDN for static assets (already handled by Vercel)

**Phase 3 (50,000+ users)**
- Migrate to Gemini Enterprise tier with SLA
- Horizontal scaling via Vercel Pro
- Separate microservice for the scoring engine
- Message queue (e.g. BullMQ) for async roadmap generation
- Analytics pipeline (PostHog or Mixpanel) to track drop-off points in the 8-step assessment

### Security Considerations
- API keys stored as server-side env vars only — never exposed to client
- Input sanitization on all prompt inputs (`sanitizeForPrompt()` utility)
- Rate limiting on `/api/counselor/stream` to prevent abuse (to be added)
- No PII stored server-side in current architecture
