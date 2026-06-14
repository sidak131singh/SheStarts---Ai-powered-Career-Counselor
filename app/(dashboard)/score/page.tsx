'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserId } from '@/store/userStore';
import { generateUserResults } from '@/lib/results/userResults';
import { getProfileLocally } from '@/lib/localStorage';
import { getScoreTier, getScoreColor } from '@/lib/utils';

interface ScoreData {
  overallScore: number;
  breakdown: { label: string; value: number; description: string; icon: string }[];
  strengths: string[];
  areasForImprovement: string[];
  nextActions: string[];
  projections: { day30: number; day60: number; day90: number };
  careerPath: string;
}

function AnimatedGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const circumference = 2 * Math.PI * 70;
  const tier = getScoreTier(score);
  const color = getScoreColor(score);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= score) {
        setAnimated(score);
        clearInterval(interval);
      } else {
        setAnimated(current);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  const dashOffset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#f3f4f6" strokeWidth="12" />
          <circle
            cx="80" cy="80" r="70" fill="none"
            stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.02s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '3rem', color: '#0B3540', lineHeight: 1 }}>{animated}</span>
          <span style={{ fontSize: '0.75rem', color: '#5A9E9E', fontWeight: 700 }}>out of 100</span>
        </div>
      </div>
      <div style={{ marginTop: 10, background: '#0B3540', color: '#E2D400', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', padding: '4px 16px', borderRadius: 2 }}>
        {tier.label}
      </div>
      <p style={{ color: '#5A9E9E', fontSize: '0.8rem', fontWeight: 600, marginTop: 6 }}>Career Readiness Score</p>
    </div>
  );
}

function ScoreBar({ label, value, description, delay = 0 }: {
  label: string; value: number; description: string; icon?: string; delay?: number;
}) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  const barColor = value >= 70 ? '#22C55E' : value >= 50 ? '#E2D400' : '#EF4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, color: '#0B3540', fontSize: '0.85rem' }}>{label}</span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1rem', color: '#0B3540' }}>{value}</span>
      </div>
      <div style={{ height: 10, background: '#E0ECEC', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${animated}%`, background: barColor, borderRadius: 9999, transition: 'width 0.7s ease' }} />
      </div>
      <p style={{ fontSize: '0.75rem', color: '#5A9E9E', fontWeight: 600 }}>{description}</p>
    </div>
  );
}

export default function ScorePage() {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();
      const load = async () => {
      try {
        let profile = getProfileLocally(userId) as any;
        if (!profile) {
          const res = await fetch(`/api/assessment?userId=${userId}`);
          if (!res.ok) throw new Error('No profile');
          const json = await res.json();
          profile = json.profile;
        }
        const results = generateUserResults(profile);
        const s = results.score;

        setScoreData({
          overallScore: s.overallScore,
          breakdown: [
            { label: 'Skill Readiness', value: s.skillMatch, description: 'How many required skills you currently have', icon: '🎯' },
            { label: 'Experience Relevance', value: s.experienceRelevance, description: 'Relevance of your prior work experience', icon: '💼' },
            { label: 'Market Demand', value: s.marketDemand, description: 'Demand for your target role in your location', icon: '📈' },
            { label: 'Gap Management', value: s.gapManagement, description: 'Impact of career gap, offset by activities during break', icon: '⏸️' },
            { label: 'Learning Trajectory', value: s.learningProgress, description: 'Your daily learning capacity and consistency', icon: '📚' },
            { label: 'Confidence Readiness', value: s.confidenceReadiness, description: 'Clarity of goals and motivation strength', icon: '💪' },
          ],
          strengths: s.strengths,
          areasForImprovement: s.areasForImprovement,
          nextActions: s.nextActions,
          projections: {
            day30: Math.min(100, s.overallScore + 8),
            day60: Math.min(100, s.overallScore + 16),
            day90: Math.min(100, s.overallScore + 25),
          },
          careerPath: s.careerPath,
        });
      } catch {
        setScoreData(getDemoScoreData());
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #0B3540', borderTopColor: '#E2D400', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#5A9E9E', fontWeight: 700 }}>Calculating your score...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!scoreData) return null;

  const tier = getScoreTier(scoreData.overallScore);

  return (
    <div style={{ padding: '24px 24px 40px', maxWidth: 900, margin: '0 auto', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: '#00C4BA', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>7-Dimension Analysis</p>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', color: '#0B3540', marginTop: 2, marginBottom: 4 }}>Career Readiness Score</h1>
        <p style={{ color: '#5A9E9E', fontSize: '0.875rem', fontWeight: 600 }}>A transparent, data-driven assessment of your job readiness</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Gauge Card */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #D4E5E5', boxShadow: '0 1px 8px rgba(11,53,64,0.05)' }}>
          <AnimatedGauge score={scoreData.overallScore} />
          <div style={{ margin: '0 20px 20px', borderRadius: 8, padding: '14px 16px', background: '#EFF7F7', borderLeft: '3px solid #00C4BA' }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: '#0B3540', fontSize: '0.9rem', letterSpacing: '0.04em', marginBottom: 4 }}>{tier.label}</p>
            <p style={{ color: '#5A9E9E', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.6 }}>{getScoreMessage(scoreData.overallScore)}</p>
          </div>
        </div>

        {/* Projections */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #D4E5E5', padding: 24, boxShadow: '0 1px 8px rgba(11,53,64,0.05)' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540', marginBottom: 4 }}>Score Projections</h2>
          <p style={{ fontSize: '0.78rem', color: '#5A9E9E', fontWeight: 600, marginBottom: 20 }}>Estimated score if you follow your 90-day roadmap</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginBottom: 12 }}>
            {[
              { label: 'Today', value: scoreData.overallScore, bg: '#D4E5E5' },
              { label: 'Day 30', value: scoreData.projections.day30, bg: '#E2D400' },
              { label: 'Day 60', value: scoreData.projections.day60, bg: '#00C4BA' },
              { label: 'Day 90', value: scoreData.projections.day90, bg: '#0B3540' },
            ].map(({ label, value, bg }) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.78rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: '#0B3540' }}>{value}</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 128 }}>
                  <div style={{ width: '100%', background: bg, borderRadius: '4px 4px 0 0', height: `${(value / 100) * 128}px`, transition: 'height 1s ease' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#5A9E9E', fontWeight: 700 }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#22C55E', marginBottom: 16 }}>
            <div style={{ flex: 1, borderTop: '1.5px dashed #86EFAC' }} />
            <span style={{ background: '#F0FDF4', padding: '2px 8px', borderRadius: 3, fontWeight: 700 }}>Job Ready = 80</span>
            <div style={{ flex: 1, borderTop: '1.5px dashed #86EFAC' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: '+8 pts by Day 30', desc: 'Complete Week 1 tasks', bg: '#FFFBEB', color: '#92400E' },
              { label: '+16 pts by Day 60', desc: 'Finish certification', bg: '#EFF7F7', color: '#0D6B7A' },
              { label: '+25 pts by Day 90', desc: 'Complete roadmap', bg: '#F0FDF4', color: '#166534' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, borderRadius: 6, padding: 10, textAlign: 'center' }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.82rem', color: item.color }}>{item.label}</p>
                <p style={{ fontSize: '0.7rem', color: item.color, opacity: 0.8, marginTop: 2 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #D4E5E5', padding: 24, marginBottom: 20, boxShadow: '0 1px 8px rgba(11,53,64,0.05)' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540', marginBottom: 20 }}>Score Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {scoreData.breakdown.map((item, i) => (
            <ScoreBar key={item.label} label={item.label} value={item.value} description={item.description} icon={item.icon} delay={i * 100} />
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#F0FDF4', borderRadius: 12, border: '1px solid #86EFAC', padding: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#166534', marginBottom: 14 }}>Your Strengths</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scoreData.strengths.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: '#166534', fontWeight: 600, lineHeight: 1.5 }}>
                <span style={{ color: '#22C55E', flexShrink: 0, marginTop: 2 }}>—</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', padding: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#92400E', marginBottom: 14 }}>What Needs Attention</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scoreData.areasForImprovement.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: '#92400E', fontWeight: 600, lineHeight: 1.5 }}>
                <span style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }}>—</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Score Actions */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #D4E5E5', padding: 24, marginBottom: 20, boxShadow: '0 1px 8px rgba(11,53,64,0.05)' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540', marginBottom: 16 }}>Top Actions to Boost Your Score</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {getScoreActions(scoreData.overallScore, scoreData.breakdown).map((action, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, background: '#F8FAFA', border: '1px solid #E0ECEC' }}>
              <div style={{ width: 40, height: 40, background: '#E2D400', color: '#0B3540', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                +{action.points}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, color: '#0B3540', fontSize: '0.85rem' }}>{action.action}</p>
                <p style={{ fontSize: '0.75rem', color: '#5A9E9E', fontWeight: 600, marginTop: 2 }}>{action.detail}</p>
              </div>
              <Link href={action.href} style={{ display: 'inline-block', background: '#0B3540', color: '#E2D400', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.7rem', padding: '4px 12px', borderRadius: 3, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, flexShrink: 0 }}>
                Start
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#0B3540', borderRadius: 12, padding: '24px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.3rem', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>Reach Job Ready (80+) in 90 Days</h3>
          <p style={{ color: '#7EC8C4', fontSize: '0.85rem', fontWeight: 600 }}>Follow your personalised roadmap and check in with Prerna weekly.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/roadmap" style={{ display: 'inline-block', background: '#E2D400', color: '#0B3540', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.85rem', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            View Roadmap
          </Link>
          <Link href="/counselor" style={{ display: 'inline-block', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.85rem', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            Ask Prerna
          </Link>
        </div>
      </div>
    </div>
  );
}

function getScoreMessage(score: number): string {
  if (score >= 80) return "You're ready to start applying! Your profile, skills, and confidence are all at a strong level. Begin targeting roles now.";
  if (score >= 65) return "You're close to job-ready. Focus on closing your top 2 skill gaps and you'll be in the application zone soon.";
  if (score >= 40) return "Good foundation! You have transferable experience. 6-8 weeks of focused learning will significantly boost your score.";
  return "You're at the beginning of a powerful journey. Start with one quick win this week — even completing Day 1 of your roadmap.";
}

function getScoreActions(score: number, breakdown: ScoreData['breakdown']) {
  const sorted = [...breakdown].sort((a, b) => a.value - b.value);
  const weakest = sorted.slice(0, 3);

  return weakest.map(item => {
    const actionMap: Record<string, { action: string; detail: string; href: string; points: number }> = {
      'Skill Readiness': { action: 'Complete one targeted skill course', detail: 'Close your top skill gap with a free Coursera or YouTube course', href: '/roadmap', points: 8 },
      'Experience Relevance': { action: 'Create a portfolio project', detail: 'Build one practical project related to your target role', href: '/roadmap', points: 7 },
      'Market Demand': { action: 'Target high-demand roles in your city', detail: 'Your advisor can help identify the hottest roles for your skills', href: '/counselor', points: 5 },
      'Gap Management': { action: 'Add recent learning to your profile', detail: 'Even completing a short certificate closes the gap penalty', href: '/roadmap', points: 6 },
      'Learning Trajectory': { action: 'Start your daily learning streak', detail: 'Consistency matters more than volume — even 1 hour/day counts', href: '/progress', points: 9 },
      'Confidence Readiness': { action: 'Complete 3 mock interview sessions', detail: 'Practice builds the confidence that comes through in real interviews', href: '/counselor', points: 8 },
    };
    return actionMap[item.label] ?? { action: `Improve ${item.label}`, detail: 'Work with Prerna to create a focused plan', href: '/counselor', points: 6 };
  });
}

function getDemoScoreData(): ScoreData {
  return {
    overallScore: 72,
    breakdown: [
      { label: 'Skill Readiness', value: 68, description: 'HR skills map well to target role requirements', icon: '🎯' },
      { label: 'Experience Relevance', value: 75, description: '3 years of HR experience is highly relevant', icon: '💼' },
      { label: 'Market Demand', value: 82, description: 'HR Business Partner roles are in high demand', icon: '📈' },
      { label: 'Gap Management', value: 65, description: '5-year gap with positive activities reduces penalty', icon: '⏸️' },
      { label: 'Learning Trajectory', value: 70, description: '2.5 hours/day is excellent learning capacity', icon: '📚' },
      { label: 'Confidence Readiness', value: 62, description: 'Some confidence gaps identified — solvable', icon: '💪' },
    ],
    strengths: [
      '3 years of prior HR experience — directly applicable',
      'Active during career break (courses + volunteering)',
      'Strong daily study capacity (2.5 hours/day)',
      'Clear target career path identified',
    ],
    areasForImprovement: [
      'Skill gap in People Analytics (now required for HRBP)',
      'No recent work samples or portfolio yet',
      'LinkedIn profile needs updating for re-entry narrative',
    ],
    nextActions: [
      'Enroll in People Analytics on Coursera (free audit)',
      'Create one HRBP portfolio project this month',
      'Complete 3 mock interviews with Prerna',
    ],
    projections: { day30: 80, day60: 88, day90: 97 },
    careerPath: 'HR Business Partner',
  };
}
