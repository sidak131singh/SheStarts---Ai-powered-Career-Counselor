'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserId } from '@/store/userStore';
import { generateUserResults } from '@/lib/results/userResults';
import { getProfileLocally } from '@/lib/localStorage';
import { formatCurrency, getScoreTier } from '@/lib/utils';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);

  useEffect(() => {
    const userId = getUserId();
    const load = async () => {
      try {
        let profile = getProfileLocally(userId) as any;
        if (!profile) {
          const res = await fetch(`/api/assessment?userId=${userId}`);
          if (!res.ok) throw new Error('No profile found');
          const json = await res.json();
          profile = json.profile;
        }

        const generated = generateUserResults(profile);
        setData({ profile, ...generated });
        setSelectedPath(0);
      } catch {
        setData(getDemoData());
        setSelectedPath(0);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const S = {
    card: { background: '#fff', borderRadius: 12, border: '1px solid #D4E5E5', padding: 24, boxShadow: '0 1px 8px rgba(11,53,64,0.05)' } as React.CSSProperties,
    spin: { width: 40, height: 40, border: '3px solid #0B3540', borderTopColor: '#E2D400', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' } as React.CSSProperties,
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}><div style={S.spin} /><p style={{ color: '#5A9E9E', fontWeight: 700 }}>Analyzing your career profile...</p></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const { profile, recommendations, score } = data;
  const scoreNarrative = (data as Record<string, unknown>).scoreNarrative as string | undefined;
  const selected = selectedPath !== null ? recommendations[selectedPath] : recommendations[0];
  const overallScore = score?.overallScore ?? 72;
  const tier = getScoreTier(overallScore);

  return (
    <div style={{ padding: '24px 24px 40px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ color: '#00C4BA', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI-Powered Career Matching</p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', color: '#0B3540', marginTop: 2, marginBottom: 4 }}>
            {profile?.name ? `${String(profile.name)}'s` : 'Your'} Career Paths
          </h1>
          <p style={{ color: '#5A9E9E', fontSize: '0.875rem', fontWeight: 600 }}>Based on your assessment profile</p>
        </div>
        <Link href="/assessment" style={{ display: 'inline-block', border: '1.5px solid #0B3540', color: '#0B3540', fontWeight: 800, padding: '8px 16px', borderRadius: 6, textDecoration: 'none', fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
          Update Assessment
        </Link>
      </div>

      {/* Score Banner */}
      <div style={{ marginBottom: 20, borderRadius: 10, padding: '16px 20px', background: tier.bgColor.includes('green') ? '#F0FDF4' : tier.bgColor.includes('amber') ? '#FFFBEB' : '#EFF7F7', border: `1.5px solid ${tier.color.includes('green') ? '#86EFAC' : tier.color.includes('amber') ? '#FDE68A' : '#A5D6D6'}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 10, background: '#0B3540', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.3rem', color: '#E2D400' }}>{overallScore}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: '#0B3540', fontSize: '0.9rem', letterSpacing: '0.04em' }}>{tier.label} — Career Readiness Score</div>
          <p style={{ fontSize: '0.82rem', color: '#5A9E9E', fontWeight: 600, marginTop: 2 }}>{scoreNarrative || 'Based on your skills, experience, and market demand.'}</p>
        </div>
        <Link href="/score" style={{ display: 'inline-block', background: '#E2D400', color: '#0B3540', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.7rem', padding: '5px 14px', borderRadius: 3, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, flexShrink: 0 }}>
          Full Breakdown
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Career Path Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#5A9E9E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Recommended Paths</p>
          {recommendations.map((rec: Record<string, unknown>, i: number) => (
            <button key={String(rec.title)} onClick={() => setSelectedPath(i)} style={{ textAlign: 'left', borderRadius: 10, padding: '14px 16px', border: `1.5px solid ${selectedPath === i ? '#00C4BA' : '#D4E5E5'}`, background: selectedPath === i ? '#EFF7F7' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: selectedPath === i ? '#0D6B7A' : '#5A9E9E', letterSpacing: '0.06em', display: 'flex', gap: 6, alignItems: 'center' }}>
                    #{String(rec.rank)}
                    {i === 0 && <span style={{ background: '#E2D400', color: '#0B3540', padding: '1px 6px', borderRadius: 2, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: '0.04em' }}>BEST</span>}
                  </div>
                  <h3 style={{ fontWeight: 800, color: '#0B3540', marginTop: 2, fontSize: '0.85rem', lineHeight: 1.3 }}>{String(rec.title)}</h3>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.3rem', color: selectedPath === i ? '#0B3540' : '#5A9E9E', flexShrink: 0 }}>{String(rec.matchScore)}%</div>
              </div>
              <div style={{ marginTop: 8, height: 4, background: '#E0ECEC', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rec.matchScore}%`, background: '#0B3540', borderRadius: 9999 }} />
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 10, fontSize: '0.72rem', color: '#5A9E9E', fontWeight: 700 }}>
                <span>{formatCurrency(rec.avgSalaryInr as number)}/yr</span>
                <span>·</span>
                <span>{String(rec.learningEffortWeeks)}w prep</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#EFF7F7', color: '#0D6B7A', fontWeight: 800, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>#{String(selected.rank)} MATCH</span>
                  {selected.isPivot && <span style={{ background: '#FFFBEB', color: '#92400E', fontWeight: 800, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>CAREER PIVOT</span>}
                </div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', color: '#0B3540' }}>{String(selected.title)}</h2>
                <p style={{ color: '#5A9E9E', fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>{String(selected.domain)}</p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '3rem', color: '#0B3540', lineHeight: 1 }}>{String(selected.matchScore)}%</div>
                <div style={{ fontSize: '0.7rem', color: '#5A9E9E', fontWeight: 700, letterSpacing: '0.06em' }}>MATCH SCORE</div>
              </div>
            </div>

            <div style={{ background: '#EFF7F7', borderRadius: 8, padding: '14px 16px', marginBottom: 20, borderLeft: '3px solid #00C4BA' }}>
              <p style={{ fontSize: '0.85rem', color: '#0B3540', fontWeight: 600, lineHeight: 1.7 }}><strong>Why this fits you:</strong> {String(selected.matchReasoning)}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Avg Salary', value: formatCurrency(selected.avgSalaryInr as number) + '/yr' },
                { label: 'Learning Time', value: `${String(selected.learningEffortWeeks)} weeks` },
                { label: 'Time to Hire', value: `${String(selected.timeToHireWeeks)} weeks` },
                { label: 'Remote Jobs', value: String(selected.remoteAvailability) },
              ].map(s => (
                <div key={s.label} style={{ background: '#F8FAFA', borderRadius: 8, padding: '12px', textAlign: 'center', border: '1px solid #E0ECEC' }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0B3540' }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#5A9E9E', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, color: '#0B3540', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Key Skills for This Role</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(selected.keySkillsNeeded as string[]).map(skill => (
                  <span key={skill} style={{ padding: '4px 10px', background: '#0B3540', color: '#E2D400', borderRadius: 3, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>{skill}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#0B3540', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Where to Apply</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(selected.jobBoards as string[]).map(b => <span key={b} style={{ padding: '3px 8px', background: '#EFF7F7', color: '#0D6B7A', borderRadius: 3, fontSize: '0.75rem', fontWeight: 700 }}>{b}</span>)}
                </div>
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: '#0B3540', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Companies Hiring</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(selected.companiesHiring as string[]).map(c => <span key={c} style={{ padding: '3px 8px', background: '#FFFBEB', color: '#92400E', borderRadius: 3, fontSize: '0.75rem', fontWeight: 700 }}>{c}</span>)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/roadmap" style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#0B3540', color: '#E2D400', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.85rem', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                Generate 90-Day Roadmap
              </Link>
              <Link href="/counselor" style={{ flex: 1, textAlign: 'center', padding: '12px', border: '1.5px solid #0B3540', color: '#0B3540', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.85rem', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                Ask Prerna
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDemoData() {
  return {
    profile: { name: 'Priya Sharma', experience: { yearsOfExperience: 3, lastJobTitle: 'HR Generalist' }, skills: { currentSkills: ['HR', 'Recruitment', 'Excel', 'Payroll', 'Employee Relations'] } },
    recommendations: [
      { rank: 1, title: 'HR Business Partner (Remote)', domain: 'Human Resources', matchScore: 87, matchReasoning: 'Your 3 years of HR experience, recruitment skills, and employee relations background directly align with HRBP responsibilities. Your career break shows initiative through courses and volunteering.', avgSalaryInr: 900000, remoteAvailability: 'high', learningEffortWeeks: 8, timeToHireWeeks: 12, isPivot: false, pivotDifficulty: null, companiesHiring: ['Razorpay', 'Freshworks', 'Infosys BPO', 'Zomato', 'PhonePe'], jobBoards: ['LinkedIn', 'Naukri', 'Instahyre', 'Glassdoor'], keySkillsNeeded: ['HRBP Strategy', 'People Analytics', 'OKR Frameworks', 'Stakeholder Management', 'Excel/HRIS'], growthPotential: 'High' },
      { rank: 2, title: 'Talent Acquisition Specialist', domain: 'Human Resources', matchScore: 81, matchReasoning: 'Your recruitment background is highly transferable. With updated sourcing tools (LinkedIn Recruiter, ATS systems), you can quickly re-enter as a TA specialist at Series B+ startups.', avgSalaryInr: 750000, remoteAvailability: 'high', learningEffortWeeks: 4, timeToHireWeeks: 8, isPivot: false, pivotDifficulty: null, companiesHiring: ['Wipro BPS', 'Accenture', 'TCS', 'Meesho', 'Swiggy'], jobBoards: ['LinkedIn', 'Naukri', 'Wellfound', 'Cutshort'], keySkillsNeeded: ['LinkedIn Recruiter', 'ATS Systems', 'Boolean Search', 'Interviewing', 'Employer Branding'], growthPotential: 'High' },
      { rank: 3, title: 'People Operations Manager', domain: 'Human Resources', matchScore: 79, matchReasoning: 'Your payroll, onboarding, and employee relations experience maps closely to People Ops. Startups need generalists who can own the full HR function.', avgSalaryInr: 850000, remoteAvailability: 'medium', learningEffortWeeks: 6, timeToHireWeeks: 10, isPivot: false, pivotDifficulty: null, companiesHiring: ['Zepto', 'CRED', 'BrowserStack', 'Postman', 'Chargebee'], jobBoards: ['LinkedIn', 'AngelList', 'Wellfound', 'Instahyre'], keySkillsNeeded: ['HRMS Tools', 'Compliance', 'Onboarding Design', 'Culture Building', 'Data Reporting'], growthPotential: 'High' },
      { rank: 4, title: 'HR Tech Consultant', domain: 'Human Resources Technology', matchScore: 71, matchReasoning: 'A stretch goal that combines your HR knowledge with emerging HR technology. Requires 8-10 weeks of learning but commands premium salary.', avgSalaryInr: 1200000, remoteAvailability: 'high', learningEffortWeeks: 10, timeToHireWeeks: 16, isPivot: true, pivotDifficulty: 'moderate', companiesHiring: ['Darwinbox', 'Keka HR', 'greytHR', 'HRMantra', 'sumHR'], jobBoards: ['LinkedIn', 'Naukri', 'Indeed', 'Company websites'], keySkillsNeeded: ['Darwinbox/Workday', 'Implementation', 'Process Design', 'Data Migration', 'Training'], growthPotential: 'Very High' },
      { rank: 5, title: 'Learning & Development Coordinator', domain: 'Learning & Development', matchScore: 68, matchReasoning: 'Your experience training new hires and creating onboarding programs translates well to L&D. EdTech companies actively hire professionals with a coaching mindset.', avgSalaryInr: 700000, remoteAvailability: 'high', learningEffortWeeks: 5, timeToHireWeeks: 9, isPivot: true, pivotDifficulty: 'easy', companiesHiring: ["BYJU's", 'Unacademy', 'upGrad', 'Simplilearn', 'Great Learning'], jobBoards: ['LinkedIn', 'Naukri', 'Indeed', 'Monster'], keySkillsNeeded: ['Instructional Design', 'LMS Platforms', 'Content Creation', 'Training Delivery', 'Assessment Design'], growthPotential: 'Medium' },
    ],
    score: { overallScore: 72, skillMatch: 68, gapManagement: 65, experienceRelevance: 75, marketDemand: 82, learningProgress: 70, confidenceReadiness: 62 },
    scoreNarrative: "You're building strong momentum! Your prior HR experience is a solid foundation. Closing 2-3 critical skill gaps will push you into the 'Nearly Ready' tier.",
  };
}
