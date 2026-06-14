'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserStore, getUserId } from '@/store/userStore';
import { formatCurrency } from '@/lib/utils';
import { getProfileLocally } from '@/lib/localStorage';
import { generateUserResults } from '@/lib/results/userResults';

interface DashboardData {
  profile: Record<string, unknown>;
  score: Record<string, unknown>;
  recommendations: { recommendations: Record<string, unknown>[] };
  roadmap: Record<string, unknown>[];
}

/* ─── Score Gauge ──────────────────────────────────────────────────────────── */
function ScoreGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    const timer = setTimeout(() => {
      let cur = 0;
      const iv = setInterval(() => {
        cur += 2;
        if (cur >= score) { setAnimated(score); clearInterval(iv); }
        else setAnimated(cur);
      }, 20);
      return () => clearInterval(iv);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const color = score >= 80 ? '#22C55E' : score >= 65 ? '#E2D400' : score >= 40 ? '#00C4BA' : '#EF4444';
  const dashOffset = circumference - (animated / 100) * circumference;
  const label = score >= 80 ? 'JOB READY' : score >= 65 ? 'NEARLY READY' : score >= 40 ? 'BUILDING' : 'EARLY STAGE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 144, height: 144 }}>
        <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E0ECEC" strokeWidth="10" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.05s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#0B3540', lineHeight: 1 }}>{animated}</span>
          <span style={{ fontSize: '0.65rem', color: '#5A9E9E', fontWeight: 700 }}>/100</span>
        </div>
      </div>
      <div style={{ marginTop: 8, background: '#0B3540', color: '#E2D400', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.1em', padding: '3px 12px', borderRadius: 2 }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Progress Bar ─────────────────────────────────────────────────────────── */
function ProgressBar({ value }: { value: number }) {
  const color = value >= 70 ? '#22C55E' : value >= 50 ? '#E2D400' : '#EF4444';
  return (
    <div style={{ height: 6, background: '#E0ECEC', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: 9999, transition: 'width 0.7s ease' }} />
    </div>
  );
}

/* ─── Link Button ──────────────────────────────────────────────────────────── */
const BtnLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} style={{ display: 'inline-block', background: '#E2D400', color: '#0B3540', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: 3, textDecoration: 'none', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>
    {children}
  </Link>
);

const cardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #D4E5E5', padding: 24, boxShadow: '0 1px 8px rgba(11,53,64,0.05)' };

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { name, email } = useUserStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [tasksCompleted, setTasksCompleted] = useState<string[]>([]);

  const displayName = name || email?.split('@')[0] || 'there';
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const userId = getUserId();
    const load = async () => {
      try {
        let profile = getProfileLocally(userId) as Record<string, unknown> | null;
        if (!profile) {
          const res = await fetch(`/api/assessment?userId=${userId}`);
          if (res.ok) { const j = await res.json(); profile = j.profile; }
        }
        if (!profile) { setIsLoading(false); return; }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const generated = generateUserResults(profile as any);
        setData({ profile, score: generated.score as unknown as Record<string, unknown>, recommendations: { recommendations: generated.recommendations as unknown as Record<string, unknown>[] }, roadmap: generated.roadmap as unknown as Record<string, unknown>[] });
      } catch {
        setData(getDemoData());
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const saved = localStorage.getItem('completed_tasks');
    if (saved) setTasksCompleted(JSON.parse(saved));
  }, []);

  const toggleTask = (taskId: string) => {
    setTasksCompleted(prev => {
      const updated = prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId];
      localStorage.setItem('completed_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #0B3540', borderTopColor: '#E2D400', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#5A9E9E', fontWeight: 700 }}>Loading your career dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 32, maxWidth: 560, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.5rem', textTransform: 'uppercase', color: '#0B3540', marginBottom: 12 }}>Let&apos;s Build Your Career Roadmap</div>
        <p style={{ color: '#5A9E9E', fontWeight: 600, marginBottom: 32 }}>Complete your assessment to get personalized career recommendations, a 90-day roadmap, and your Career Readiness Score.</p>
        <Link href="/assessment" style={{ display: 'inline-block', background: '#0B3540', color: '#E2D400', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', padding: '14px 32px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
          Start Free Assessment
        </Link>
        <p style={{ color: '#5A9E9E', fontSize: '0.8rem', marginTop: 10, fontWeight: 600 }}>Takes about 8 minutes</p>
      </div>
    );
  }

  const score    = (data.score?.overallScore ?? data.score?.overall_score ?? 72) as number;
  const topPath  = data.recommendations?.recommendations?.[0] as Record<string, unknown> | undefined;
  const todayTasks = getTodayTasks(data.roadmap);
  const breakdown  = getScoreBreakdown(data.score);

  const QUICK_ACTIONS = [
    { href: '/counselor', label: 'Talk to Prerna', desc: 'AI Career Counselor', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', bg: '#EFF7F7', border: '#00C4BA' },
    { href: '/roadmap',   label: 'View Roadmap',   desc: '30/60/90-day plan',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', bg: '#EFF7F7', border: '#00C4BA' },
    { href: '/score',     label: 'Boost Score',    desc: 'Score improvement tips', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', bg: '#FFFBEB', border: '#E2D400' },
    { href: '/resume',    label: 'Analyze Resume', desc: 'ATS compatibility check', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: '#FFFBEB', border: '#E2D400' },
  ];

  return (
    <div style={{ padding: '24px 24px 40px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: '#00C4BA', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{greeting}</p>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', color: '#0B3540', marginTop: 2, marginBottom: 4 }}>
          {greeting}, {displayName}
        </h1>
        <p style={{ color: '#5A9E9E', fontWeight: 600, fontSize: '0.9rem' }}>Here&apos;s your career restart progress</p>
      </div>

      {/* Top Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>

        {/* Score Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540' }}>Career Readiness</h2>
            <BtnLink href="/score">Details</BtnLink>
          </div>
          <ScoreGauge score={score} />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {breakdown.slice(0, 3).map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                <span style={{ width: 90, color: '#5A9E9E', fontWeight: 700, flexShrink: 0 }}>{item.label}</span>
                <div style={{ flex: 1 }}><ProgressBar value={item.value} /></div>
                <span style={{ width: 24, textAlign: 'right', fontWeight: 800, color: '#0B3540', fontSize: '0.75rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <Link href="/score" style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', color: '#5A9E9E', fontWeight: 700, marginTop: 12, textDecoration: 'none' }}>
            +{Math.max(0, 80 - score)} points to Job Ready
          </Link>
        </div>

        {/* Today's Focus */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540' }}>Today&apos;s Focus</h2>
            <span style={{ background: '#EFF7F7', color: '#0D6B7A', fontWeight: 800, fontSize: '0.7rem', padding: '3px 10px', borderRadius: 3, letterSpacing: '0.06em' }}>
              {tasksCompleted.length}/{todayTasks.length} DONE
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayTasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: tasksCompleted.includes(task.id) ? '#EFF7F7' : '#F8FAFA', cursor: 'pointer', border: `1px solid ${tasksCompleted.includes(task.id) ? '#00C4BA' : '#E0ECEC'}` }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${tasksCompleted.includes(task.id) ? '#00C4BA' : '#D4E5E5'}`, background: tasksCompleted.includes(task.id) ? '#00C4BA' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  {tasksCompleted.includes(task.id) && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: tasksCompleted.includes(task.id) ? '#5A9E9E' : '#0B3540', textDecoration: tasksCompleted.includes(task.id) ? 'line-through' : 'none', lineHeight: 1.4 }}>{task.title}</p>
                  <p style={{ fontSize: '0.7rem', color: '#5A9E9E', fontWeight: 600, marginTop: 2 }}>{task.estimatedHours}h · {task.type}</p>
                </div>
              </div>
            ))}
          </div>
          <BtnLink href="/roadmap">View Full Roadmap</BtnLink>
        </div>

        {/* Top Career Path */}
        <div style={{ ...cardStyle, background: '#0B3540', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7EC8C4' }}>Your Best Match</h2>
            <BtnLink href="/results">See All</BtnLink>
          </div>
          {topPath ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '3rem', color: '#E2D400', lineHeight: 1 }}>{(topPath.matchScore ?? 87) as number}%</div>
                <div style={{ color: '#7EC8C4', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>MATCH SCORE</div>
              </div>
              <h3 style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: 12 }}>{(topPath.title ?? 'HR Business Partner') as string}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Avg. Salary', value: formatCurrency((topPath.avgSalaryInr ?? 900000) as number) },
                  { label: 'Time to Hire', value: `${(topPath.timeToHireWeeks ?? 12) as number} weeks` },
                  { label: 'Remote Jobs', value: (topPath.remoteAvailability ?? 'high') as string },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#7EC8C4', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ color: '#fff', fontWeight: 800 }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/results" style={{ display: 'block', textAlign: 'center', background: 'rgba(226,212,0,0.15)', color: '#E2D400', fontWeight: 800, fontSize: '0.78rem', padding: '8px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.04em', border: '1px solid rgba(226,212,0,0.3)' }}>
                EXPLORE THIS PATH
              </Link>
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 16 }}>
              <p style={{ color: '#7EC8C4', fontSize: '0.85rem', marginBottom: 12 }}>Complete your assessment to see your top career match</p>
              <BtnLink href="/assessment">Start Assessment</BtnLink>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Roadmap Timeline */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540' }}>90-Day Journey</h2>
            <BtnLink href="/roadmap">Full Plan</BtnLink>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { phase: '30 Days', label: 'Foundation & Quick Wins', active: true, projScore: Math.min(100, score + 8) },
              { phase: '60 Days', label: 'Build & Network',          active: false, projScore: Math.min(100, score + 16) },
              { phase: '90 Days', label: 'Apply & Get Hired',        active: false, projScore: Math.min(100, score + 25) },
            ].map((p, i) => (
              <div key={p.phase} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: p.active ? '#EFF7F7' : '#F8FAFA', border: `1px solid ${p.active ? '#00C4BA' : '#E0ECEC'}` }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.active ? '#0B3540' : '#D4E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.active ? '#E2D400' : '#5A9E9E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: p.active ? '#0D6B7A' : '#5A9E9E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.phase}</span>
                    <span style={{ fontSize: '0.7rem', color: '#5A9E9E', fontWeight: 700 }}>Score → {p.projScore}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#0B3540', fontWeight: 700, marginTop: 2 }}>{p.label}</p>
                </div>
                {p.active && <span style={{ background: '#0B3540', color: '#E2D400', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.65rem', padding: '2px 8px', borderRadius: 2, letterSpacing: '0.06em' }}>ACTIVE</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={cardStyle}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {QUICK_ACTIONS.map(action => (
              <Link key={action.href} href={action.href} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 16, borderRadius: 8, background: action.bg, border: `1.5px solid ${action.border}`, textDecoration: 'none', transition: 'all 0.15s' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0B3540" strokeWidth={2} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
                <span style={{ fontWeight: 800, color: '#0B3540', fontSize: '0.82rem' }}>{action.label}</span>
                <span style={{ fontSize: '0.72rem', color: '#5A9E9E', fontWeight: 600 }}>{action.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Insight */}
      <div style={{ background: '#0B3540', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, background: '#E2D400', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0B3540" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#E2D400', marginBottom: 4 }}>Daily Insight from Prerna</h3>
          <p style={{ color: '#A8D8D5', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.7 }}>{getDailyTip(score)}</p>
        </div>
        <Link href="/counselor" style={{ display: 'inline-block', background: '#E2D400', color: '#0B3540', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.72rem', padding: '6px 14px', borderRadius: 3, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
          ASK PRERNA
        </Link>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function getDemoData(): DashboardData {
  return {
    profile: { name: 'Priya Sharma', skills: { currentSkills: ['HR', 'Recruitment', 'Excel'] } },
    score: { overallScore: 72, skillReadiness: 68, experienceRelevance: 75, marketDemand: 82, gapImpact: 65, learningTrajectory: 70, confidenceReadiness: 62 },
    recommendations: { recommendations: [{ title: 'HR Business Partner', matchScore: 87, avgSalaryInr: 900000, timeToHireWeeks: 12, remoteAvailability: 'high' }] },
    roadmap: [],
  };
}

interface TodayTask { id: string; title: string; estimatedHours: number; type: string; }

function getTodayTasks(roadmap: Record<string, unknown>[]): TodayTask[] {
  if (roadmap.length > 0 && roadmap[0].tasks) {
    return (roadmap[0].tasks as Record<string, unknown>[]).slice(0, 3).map(t => ({
      id: t.id as string, title: t.title as string,
      estimatedHours: t.estimatedHours as number,
      type: ((t.resourceLinks as { type: string }[])?.[0]?.type) || 'course',
    }));
  }
  return [
    { id: 'task-1', title: 'Complete skill gap audit', estimatedHours: 1, type: 'planning' },
    { id: 'task-2', title: 'Update LinkedIn profile summary', estimatedHours: 0.5, type: 'networking' },
    { id: 'task-3', title: 'Watch: Role intro video on YouTube', estimatedHours: 1.5, type: 'video' },
  ];
}

function getScoreBreakdown(score: Record<string, unknown>) {
  if (!score) return [{ label: 'Skill Match', value: 68 }, { label: 'Experience', value: 75 }, { label: 'Market Demand', value: 82 }];
  return [
    { label: 'Skill Match', value: (score.skillMatch ?? score.skillReadiness ?? 68) as number },
    { label: 'Experience',  value: (score.experienceRelevance ?? 75) as number },
    { label: 'Market Demand', value: (score.marketDemand ?? 82) as number },
  ];
}

function getDailyTip(score: number): string {
  const tips = [
    "Your experience from before your break is more valuable than you think. Reframe every management challenge during your break as professional competency — because it is.",
    "Today, spend 30 minutes reviewing 3 job descriptions for your target role. The keywords that keep appearing are your skill priorities.",
    "Update your LinkedIn headline today. Instead of 'Looking for opportunities', try your target title followed by your strongest skill and 'returning with refreshed perspective'.",
    "One powerful thing you can do this week: reach out to 2 people in your target role on LinkedIn with a genuine comment on their work — not a job request.",
    "Your score grows fastest by closing one critical skill gap at a time. Pick the top skill from your gap analysis and spend 20 minutes on it today.",
  ];
  return tips[Math.floor((score + new Date().getDate()) % tips.length)];
}
