'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const QUOTES = [
  { text: 'YOUR CAREER IS YOUR MOST IMPORTANT INVESTMENT.', sub: 'Start building it today.' },
  { text: 'THE FUTURE BELONGS TO WOMEN WHO BELIEVE IN THEIR SKILLS.', sub: 'Know your worth.' },
  { text: 'EVERY EXPERT WAS ONCE A BEGINNER.', sub: 'Your journey starts now.' },
  { text: 'DON\'T WAIT FOR OPPORTUNITY. CREATE IT.', sub: 'SheStarts Career Compass.' },
];

const STATS = [
  { number: '94%', label: 'PLACEMENT RATE' },
  { number: '3.2X', label: 'SALARY GROWTH' },
  { number: '12,000+', label: 'WOMEN GUIDED' },
  { number: '180+', label: 'CAREER PATHS' },
];

const STEPS = [
  {
    num: '01',
    title: 'COMPLETE YOUR PROFILE',
    desc: 'Tell us about your background, education, skills, and the career you are aiming for. 8 simple steps.',
  },
  {
    num: '02',
    title: 'GET YOUR EMPLOYABILITY SCORE',
    desc: 'Our AI engine analyses 7 dimensions of your profile and generates a precise score out of 100.',
  },
  {
    num: '03',
    title: 'RECEIVE YOUR PERSONALISED ROADMAP',
    desc: 'A 90-day action plan, tailored to your exact skill gaps and career goals, delivered instantly.',
  },
  {
    num: '04',
    title: 'CHAT WITH YOUR AI COUNSELOR',
    desc: 'Prerna, your AI career counselor, is available 24/7 to answer questions, review your resume, and keep you on track.',
  },
];

const TESTIMONIALS = [
  {
    name: 'MEERA KRISHNAN',
    title: 'Data Analyst, Infosys',
    text: 'I went from a 2-year career gap to a data analyst role in 90 days. The roadmap was specific and the AI counselor answered every question I had at 2 am.',
    score: '41 → 78',
    img: '/images/2.png',
  },
  {
    name: 'DIVYA NAIR',
    title: 'Product Manager, Razorpay',
    text: 'SheStarts told me exactly what skills I was missing for product management. I followed the plan and got 3 interview calls within 6 weeks.',
    score: '55 → 82',
    img: '/images/3.png',
  },
  {
    name: 'SUNITA VERMA',
    title: 'Software Engineer, TCS',
    text: 'The employability score breakdown was an eye-opener. I knew I had to fix my GitHub portfolio — did it, and my score jumped 22 points.',
    score: '58 → 80',
    img: '/images/1.png',
  },
];

const CAREERS = [
  'DATA SCIENCE', 'PRODUCT MANAGEMENT', 'UX DESIGN',
  'DIGITAL MARKETING', 'SOFTWARE ENGINEERING', 'CYBERSECURITY',
  'BUSINESS ANALYTICS', 'CLOUD ARCHITECTURE',
];

const MOTIVATION_QUOTES = [
  '"DEFINE SUCCESS ON YOUR OWN TERMS, ACHIEVE IT BY YOUR OWN RULES."',
  '"THE QUESTION IS NOT WHO IS GOING TO LET ME; IT\'S WHO IS GOING TO STOP ME."',
  '"AMBITION IS THE FIRST STEP TO SUCCESS."',
  '"YOUR ONLY LIMIT IS YOUR MIND."',
  '"BUILD YOUR DREAMS OR SOMEONE ELSE WILL HIRE YOU TO BUILD THEIRS."',
  '"A WOMAN WITH A PLAN IS UNSTOPPABLE."',
];

export default function HomePage() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0B3540', color: '#fff', fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>

      {/* NAV */}
      <nav style={{ background: '#083040', borderBottom: '2px solid rgba(255,255,255,0.07)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.01em' }}>
            <span style={{ color: '#00C4BA' }}>SHE</span>
            <span style={{ color: '#E2D400' }}>STARTS</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginLeft: 8 }}>CAREER COMPASS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" style={{ color: '#7EC8C4', fontWeight: 700, fontSize: '0.875rem', padding: '0.4rem 1rem', border: '1.5px solid rgba(0,196,186,0.3)', borderRadius: 4 }}>LOGIN</Link>
            <Link href="/signup" style={{ background: '#E2D400', color: '#0B3540', fontWeight: 800, fontSize: '0.875rem', padding: '0.45rem 1.25rem', borderRadius: 4, textDecoration: 'none', display: 'inline-block' }}>GET STARTED</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#0B3540', minHeight: '92vh', display: 'flex', alignItems: 'stretch', overflow: 'hidden', position: 'relative' }}>
        {/* Left */}
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ flex: '1 1 55%', maxWidth: 640 }}>
            <div style={{ display: 'inline-block', background: '#E2D400', color: '#0B3540', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em', padding: '0.35rem 0.9rem', borderRadius: 2, marginBottom: 24 }}>
              AI-POWERED CAREER INTELLIGENCE
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(3rem, 7vw, 5.5rem)', textTransform: 'uppercase', lineHeight: 1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              <span style={{ color: '#fff' }}>YOUR CAREER</span><br />
              <span style={{ color: '#00C4BA' }}>BREAKTHROUGH</span><br />
              <span style={{ color: '#E2D400' }}>STARTS HERE</span>
            </h1>
            <p style={{ color: '#A8D8D5', fontSize: '1.1rem', maxWidth: 520, lineHeight: 1.7, marginBottom: 36, fontWeight: 600 }}>
              India&apos;s most advanced AI career platform for women. Get a precise Employability Score, a 90-day roadmap, and a personal AI counselor — all in under 10 minutes.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/assessment" style={{ background: '#E2D400', color: '#0B3540', fontWeight: 800, fontSize: '1rem', padding: '0.85rem 2rem', borderRadius: 4, textDecoration: 'none', display: 'inline-block', letterSpacing: '0.05em' }}>
                START FREE ASSESSMENT
              </Link>
              <Link href="/demo" style={{ border: '2px solid #00C4BA', color: '#00C4BA', fontWeight: 800, fontSize: '1rem', padding: '0.85rem 2rem', borderRadius: 4, textDecoration: 'none', display: 'inline-block', letterSpacing: '0.05em' }}>
                VIEW LIVE DEMO
              </Link>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {STATS.map(s => (
                <div key={s.label} style={{ borderLeft: '3px solid #E2D400', paddingLeft: 12 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#E2D400', lineHeight: 1 }}>{s.number}</div>
                  <div style={{ fontSize: '0.65rem', color: '#7EC8C4', fontWeight: 700, letterSpacing: '0.08em', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div style={{ flex: '1 1 42%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '3px solid rgba(0,196,186,0.3)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <Image src="/images/7.png" alt="Women professionals" width={520} height={400} style={{ width: '100%', height: '400px', objectFit: 'cover', objectPosition: 'center top' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(11,53,64,0.9))', padding: '32px 20px 20px' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', color: '#E2D400' }}>12,000+ Women Transformed</div>
                <div style={{ fontSize: '0.8rem', color: '#A8D8D5', fontWeight: 600 }}>Across 50+ cities in India</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE TICKER */}
      <div style={{ background: '#E2D400', overflow: 'hidden', padding: '0.8rem 0' }}>
        <div className="marquee-inner" style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...MOTIVATION_QUOTES, ...MOTIVATION_QUOTES].map((q, i) => (
            <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '0.95rem', color: '#0B3540', letterSpacing: '0.04em' }}>
              {q} <span style={{ color: '#0D6B7A', margin: '0 1rem' }}>|</span>
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ background: '#0F4756', padding: '100px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Image */}
            <div style={{ flex: '1 1 380px', maxWidth: 460 }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: '3px solid rgba(226,212,0,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
                <Image src="/images/4.png" alt="Women collaborating" width={460} height={560} style={{ width: '100%', height: 560, objectFit: 'cover' }} />
              </div>
            </div>
            {/* Steps */}
            <div style={{ flex: '1 1 480px' }}>
              <div style={{ color: '#E2D400', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', marginBottom: 12 }}>THE PROCESS</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', textTransform: 'uppercase', lineHeight: 1, marginBottom: 48, color: '#fff' }}>
                FROM ASSESSMENT<br /><span style={{ color: '#00C4BA' }}>TO CAREER OFFER</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {STEPS.map(step => (
                  <div key={step.num} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '3rem', color: '#E2D400', opacity: 0.8, lineHeight: 1, minWidth: 56 }}>{step.num}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em', color: '#fff', marginBottom: 4 }}>{step.title}</div>
                      <div style={{ color: '#7EC8C4', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.6 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/assessment" style={{ display: 'inline-block', marginTop: 40, background: '#E2D400', color: '#0B3540', fontWeight: 800, fontSize: '0.9rem', padding: '0.8rem 2rem', borderRadius: 4, letterSpacing: '0.06em' }}>
                BEGIN MY ASSESSMENT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MOTIVATIONAL QUOTES SECTION */}
      <section style={{ background: '#083040', padding: '100px 24px', textAlign: 'center' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ color: '#7EC8C4', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', marginBottom: 12 }}>FOR THE WOMAN WHO DARES</div>
          <div style={{ position: 'relative', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {QUOTES.map((q, i) => (
              <div key={i} style={{ position: i === 0 ? 'relative' : 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: quoteIdx === i ? 1 : 0, transition: 'opacity 0.8s ease', pointerEvents: quoteIdx === i ? 'auto' : 'none' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', textTransform: 'uppercase', lineHeight: 1.1, color: '#E2D400', maxWidth: 900 }}>
                  &ldquo;{q.text}&rdquo;
                </div>
                <div style={{ color: '#00C4BA', fontWeight: 700, fontSize: '1.1rem', marginTop: 16, letterSpacing: '0.06em' }}>{q.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => setQuoteIdx(i)} style={{ width: quoteIdx === i ? 28 : 8, height: 8, borderRadius: 4, background: quoteIdx === i ? '#E2D400' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: '#0B3540', padding: '100px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ color: '#E2D400', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', marginBottom: 12 }}>REAL STORIES</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', textTransform: 'uppercase', lineHeight: 1, color: '#fff' }}>
              WOMEN WHO<br /><span style={{ color: '#00C4BA' }}>TRANSFORMED THEIR CAREERS</span>
            </h2>
          </div>

          {/* Big group photo */}
          <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 60, border: '3px solid rgba(0,196,186,0.2)', position: 'relative', height: 340 }}>
            <Image src="/images/6.png" alt="Women professionals" fill style={{ objectFit: 'cover', objectPosition: 'center 30%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,53,64,0.85) 40%, transparent 100%)', display: 'flex', alignItems: 'center', padding: '40px 60px' }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', lineHeight: 1, color: '#fff', marginBottom: 16 }}>
                  A COMMUNITY OF<br /><span style={{ color: '#E2D400' }}>UNSTOPPABLE WOMEN</span>
                </div>
                <div style={{ color: '#A8D8D5', fontWeight: 600, fontSize: '1rem', maxWidth: 400 }}>Join 12,000+ professionals who used SheStarts to level up their career game.</div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: '#0F4756', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                  <Image src={t.img} alt={t.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#E2D400', color: '#0B3540', fontWeight: 900, fontSize: '0.85rem', padding: '0.25rem 0.6rem', borderRadius: 4, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                    SCORE {t.score}
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <p style={{ color: '#A8D8D5', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.7, marginBottom: 16 }}>&ldquo;{t.text}&rdquo;</p>
                  <div style={{ fontWeight: 800, color: '#fff', letterSpacing: '0.04em', fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ color: '#00C4BA', fontSize: '0.8rem', fontWeight: 700 }}>{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAREER PATHS */}
      <section style={{ background: '#0F4756', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 340px' }}>
              <div style={{ color: '#E2D400', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', marginBottom: 12 }}>CAREER GUIDANCE FOR</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', textTransform: 'uppercase', lineHeight: 1, color: '#fff', marginBottom: 20 }}>
                180+ CAREER<br /><span style={{ color: '#00C4BA' }}>PATHS COVERED</span>
              </h2>
              <p style={{ color: '#7EC8C4', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.7 }}>
                From fresher to senior leader, from career gaps to pivots — our AI understands every stage of a woman&apos;s professional journey.
              </p>
            </div>
            <div style={{ flex: '1 1 480px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {CAREERS.map(c => (
                <div key={c} style={{ border: '2px solid rgba(0,196,186,0.3)', borderRadius: 4, padding: '0.5rem 1rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#00C4BA', letterSpacing: '0.06em', cursor: 'default' }}>
                  {c}
                </div>
              ))}
              <div style={{ border: '2px dashed rgba(226,212,0,0.4)', borderRadius: 4, padding: '0.5rem 1rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#E2D400', letterSpacing: '0.06em' }}>
                + 172 MORE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LARGE QUOTE BANNER */}
      <section style={{ background: '#083040', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto" style={{ display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 380, borderRadius: 8, overflow: 'hidden', border: '3px solid rgba(226,212,0,0.25)' }}>
            <Image src="/images/5.png" alt="Women in discussion" width={380} height={460} style={{ width: '100%', height: 460, objectFit: 'cover' }} />
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 5rem)', textTransform: 'uppercase', lineHeight: 1, color: '#fff', marginBottom: 24 }}>
              &ldquo;THE ONLY WAY<br />TO DO GREAT WORK<br />IS TO KNOW<br /><span style={{ color: '#E2D400' }}>YOUR DIRECTION.&rdquo;</span>
            </div>
            <div style={{ color: '#7EC8C4', fontWeight: 700, fontSize: '1rem', marginBottom: 32 }}>That&apos;s exactly what SheStarts gives you.</div>
            <Link href="/signup" style={{ display: 'inline-block', background: '#E2D400', color: '#0B3540', fontWeight: 800, fontSize: '1rem', padding: '0.85rem 2.2rem', borderRadius: 4, letterSpacing: '0.06em' }}>
              FIND MY DIRECTION
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#00C4BA', padding: '80px 24px', textAlign: 'center' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 'clamp(3rem, 7vw, 5.5rem)', textTransform: 'uppercase', lineHeight: 1, color: '#0B3540', marginBottom: 16 }}>
            YOUR NEXT CHAPTER<br />BEGINS TODAY
          </h2>
          <p style={{ color: '#083040', fontWeight: 700, fontSize: '1.1rem', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Free assessment. Real AI. Personalized roadmap. No fluff, no generic advice — just results.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ background: '#0B3540', color: '#E2D400', fontWeight: 800, fontSize: '1.1rem', padding: '1rem 2.4rem', borderRadius: 4, textDecoration: 'none', display: 'inline-block', letterSpacing: '0.06em' }}>
              START FOR FREE
            </Link>
            <Link href="/demo" style={{ border: '2.5px solid #0B3540', color: '#0B3540', fontWeight: 800, fontSize: '1.1rem', padding: '1rem 2.4rem', borderRadius: 4, textDecoration: 'none', display: 'inline-block', letterSpacing: '0.06em' }}>
              WATCH DEMO
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#062830', padding: '40px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.2rem', marginBottom: 16 }}>
          <span style={{ color: '#00C4BA' }}>SHE</span><span style={{ color: '#E2D400' }}>STARTS</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', marginLeft: 8 }}>CAREER COMPASS</span>
        </div>
        <div style={{ color: '#5A9EA0', fontSize: '0.8rem', fontWeight: 600 }}>Empowering women through AI-driven career intelligence. &copy; 2026 SheStarts.</div>
      </footer>

    </div>
  );
}
