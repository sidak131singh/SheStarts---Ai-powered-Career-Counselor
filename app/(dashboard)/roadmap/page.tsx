'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserId } from '@/store/userStore';
import { generateUserResults } from '@/lib/results/userResults';
import { getProfileLocally } from '@/lib/localStorage';
import { formatDate } from '@/lib/utils';

type Phase = 'thirty_day' | 'sixty_day' | 'ninety_day';

interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  dueDate: Date | string;
  completed: boolean;
  resourceLinks: { title: string; url: string; type: string }[];
  skillsAddressed: string[];
  priority: 'high' | 'medium' | 'low';
}

interface RoadmapPhase {
  phase: Phase;
  startDate: Date | string;
  endDate: Date | string;
  goals: string[];
  tasks: Task[];
  skillsCovered: string[];
  expectedScore: number;
}

const PHASE_META: Record<Phase, { label: string; days: string; color: string; bgColor: string; accent: string }> = {
  thirty_day: { label: '30-Day Plan', days: 'Days 1–30', color: '#166534', bgColor: '#F0FDF4', accent: '#22C55E' },
  sixty_day:  { label: '60-Day Plan', days: 'Days 31–60', color: '#0D6B7A', bgColor: '#EFF7F7', accent: '#00C4BA' },
  ninety_day: { label: '90-Day Plan', days: 'Days 61–90', color: '#0B3540', bgColor: '#E8F0F0', accent: '#E2D400' },
};

const PHASE_TITLES: Record<Phase, { theme: string; focus: string }> = {
  thirty_day: { theme: 'Foundation & Confidence', focus: 'Quick wins, core skill building, resume update' },
  sixty_day: { theme: 'Building Momentum', focus: 'Portfolio project, networking, certifications' },
  ninety_day: { theme: 'Job-Ready Launch', focus: 'Active applications, interview prep, offers' },
};

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [activePhase, setActivePhase] = useState<Phase>('thirty_day');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserId();

    // Load completed tasks from localStorage
    const saved = localStorage.getItem(`roadmap_tasks_${userId}`);
    if (saved) setCompletedTasks(JSON.parse(saved));

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
        setRoadmap(results.roadmap);
      } catch {
        setRoadmap(getDemoRoadmap());
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const toggleTask = (taskId: string) => {
    const userId = getUserId();
    setCompletedTasks(prev => {
      const updated = prev.includes(taskId)
        ? prev.filter(t => t !== taskId)
        : [...prev, taskId];
      localStorage.setItem(`roadmap_tasks_${userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #0B3540', borderTopColor: '#E2D400', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#5A9E9E', fontWeight: 700 }}>Building your roadmap...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const currentPhase = roadmap.find(p => p.phase === activePhase);
  const totalTasks = roadmap.flatMap(p => p.tasks).length;
  const doneCount = completedTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div style={{ padding: '24px 24px 40px', maxWidth: 900, margin: '0 auto', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ color: '#00C4BA', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Personalized Plan</p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', color: '#0B3540', marginTop: 2, marginBottom: 4 }}>90-Day Career Roadmap</h1>
          <p style={{ color: '#5A9E9E', fontSize: '0.875rem', fontWeight: 600 }}>Structured plan to go from assessment to job offer</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #D4E5E5', padding: '12px 16px', textAlign: 'center', minWidth: 110 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#0B3540', lineHeight: 1 }}>{progressPercent}%</div>
          <div style={{ fontSize: '0.7rem', color: '#5A9E9E', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Complete</div>
          <div style={{ marginTop: 6, height: 4, background: '#E0ECEC', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#0B3540', borderRadius: 9999 }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: '#5A9E9E', fontWeight: 600, marginTop: 4 }}>{doneCount}/{totalTasks} tasks</div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {roadmap.map(phase => {
          const meta = PHASE_META[phase.phase];
          const phaseTasks = phase.tasks.length;
          const phaseDone = phase.tasks.filter(t => completedTasks.includes(t.id)).length;
          const isActive = activePhase === phase.phase;
          return (
            <button key={phase.phase} onClick={() => setActivePhase(phase.phase)}
              style={{ borderRadius: 10, padding: '14px 16px', border: `2px solid ${isActive ? meta.accent : '#D4E5E5'}`, background: isActive ? meta.bgColor : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: isActive ? meta.color : '#5A9E9E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{meta.days}</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: '#0B3540', fontSize: '0.95rem' }}>{meta.label}</p>
              </div>
              <div style={{ height: 4, background: '#E0ECEC', borderRadius: 9999, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${phaseTasks > 0 ? (phaseDone / phaseTasks) * 100 : 0}%`, background: isActive ? meta.accent : '#D4E5E5', borderRadius: 9999 }} />
              </div>
              <p style={{ fontSize: '0.72rem', color: '#5A9E9E', fontWeight: 700 }}>{phaseDone}/{phaseTasks} tasks · Score → {phase.expectedScore}</p>
            </button>
          );
        })}
      </div>

      {/* Active Phase Details */}
      {currentPhase && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Phase Header */}
          <div style={{ borderRadius: 10, padding: '20px 24px', background: PHASE_META[currentPhase.phase].bgColor, border: `1.5px solid ${PHASE_META[currentPhase.phase].accent}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', color: '#0B3540', marginBottom: 4 }}>
                  {PHASE_TITLES[currentPhase.phase].theme}
                </h2>
                <p style={{ color: '#5A9E9E', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{PHASE_TITLES[currentPhase.phase].focus}</p>
                <p style={{ color: '#5A9E9E', fontSize: '0.75rem', fontWeight: 600 }}>{formatDate(currentPhase.startDate)} — {formatDate(currentPhase.endDate)}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.5rem', color: '#0B3540', lineHeight: 1 }}>{currentPhase.expectedScore}</div>
                <div style={{ fontSize: '0.7rem', color: '#5A9E9E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projected Score</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#5A9E9E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Phase Goals</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {currentPhase.goals.map((goal, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: '#0B3540', fontWeight: 600, lineHeight: 1.5 }}>
                    <span style={{ color: PHASE_META[currentPhase.phase].accent, flexShrink: 0, fontWeight: 800 }}>—</span>{goal}
                  </div>
                ))}
              </div>
            </div>

            {currentPhase.skillsCovered.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#5A9E9E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Skills You&apos;ll Cover</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {currentPhase.skillsCovered.map(skill => (
                    <span key={skill} style={{ background: '#fff', color: '#0B3540', border: '1px solid #D4E5E5', borderRadius: 4, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tasks */}
          <div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540', marginBottom: 12 }}>Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentPhase.tasks.map(task => {
                const isDone = completedTasks.includes(task.id);
                const isExpanded = expandedTask === task.id;
                const priBg = task.priority === 'high' ? '#FEE2E2' : task.priority === 'medium' ? '#FFFBEB' : '#F0F4F4';
                const priColor = task.priority === 'high' ? '#DC2626' : task.priority === 'medium' ? '#92400E' : '#5A9E9E';

                return (
                  <div key={task.id} style={{ background: isDone ? '#F0FDF4' : '#fff', borderRadius: 10, border: `1px solid ${isDone ? '#86EFAC' : '#D4E5E5'}`, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <button onClick={() => toggleTask(task.id)} style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isDone ? '#22C55E' : '#D4E5E5'}`, background: isDone ? '#22C55E' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 2 }}>
                          {isDone && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <h4 style={{ fontWeight: 800, fontSize: '0.875rem', color: isDone ? '#5A9E9E' : '#0B3540', textDecoration: isDone ? 'line-through' : 'none', lineHeight: 1.4 }}>{task.title}</h4>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                              <span style={{ background: priBg, color: priColor, fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>{task.priority}</span>
                              <span style={{ fontSize: '0.72rem', color: '#5A9E9E', fontWeight: 700 }}>{task.estimatedHours}h</span>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#5A9E9E', fontWeight: 600, marginTop: 4, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                            <span style={{ fontSize: '0.72rem', color: '#5A9E9E', fontWeight: 600 }}>Due: {formatDate(task.dueDate)}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {task.skillsAddressed.slice(0, 2).map(skill => (
                                <span key={skill} style={{ background: '#EFF7F7', color: '#0D6B7A', fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 3 }}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setExpandedTask(isExpanded ? null : task.id)} style={{ color: '#5A9E9E', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 4 }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>

                      {isExpanded && task.resourceLinks.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E0ECEC' }}>
                          <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5A9E9E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Resources</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {task.resourceLinks.map((link, i) => (
                              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#0D6B7A', fontWeight: 700, textDecoration: 'none' }}>
                                <span style={{ color: '#00C4BA', fontSize: '0.8rem', fontWeight: 800 }}>[{link.type.toUpperCase()}]</span>
                                {link.title}
                                <span style={{ color: '#5A9E9E' }}>↗</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase CTA */}
          <div style={{ background: '#0B3540', borderRadius: 10, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em', marginBottom: 4 }}>Want a More Detailed Plan?</p>
              <p style={{ fontSize: '0.82rem', color: '#7EC8C4', fontWeight: 600 }}>Prerna can customise your roadmap based on your progress</p>
            </div>
            <Link href="/counselor" style={{ display: 'inline-block', background: '#E2D400', color: '#0B3540', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.82rem', padding: '8px 20px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const, flexShrink: 0 }}>
              Ask Prerna
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function getDemoRoadmap(): RoadmapPhase[] {
  const now = new Date();
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  return [
    {
      phase: 'thirty_day',
      startDate: now,
      endDate: addDays(now, 30),
      goals: [
        'Refresh core HR Business Partner fundamentals',
        'Complete SHRM Basics or LinkedIn Learning HR course',
        'Update resume and LinkedIn with restart narrative',
      ],
      tasks: [
        { id: 'demo-t1', title: 'Skill gap audit — compare your skills to 5 HRBP job posts', description: 'Search for "HR Business Partner remote India" on LinkedIn and Naukri. List the 5 most common skills across all posts. Compare against your current skills.', estimatedHours: 3, dueDate: addDays(now, 7), completed: false, resourceLinks: [{ title: 'LinkedIn Jobs — HR Business Partner India', url: 'https://www.linkedin.com/jobs/search/?keywords=hr+business+partner&location=India', type: 'article' }], skillsAddressed: ['Skill Planning'], priority: 'high' },
        { id: 'demo-t2', title: 'Enroll in HR Business Partner Foundations (LinkedIn Learning)', description: 'Start with the "HR Business Partner Foundations" course. Focus on the modules on talent strategy, org design, and data-driven HR.', estimatedHours: 8, dueDate: addDays(now, 14), completed: false, resourceLinks: [{ title: 'HR Business Partner Foundations — LinkedIn Learning', url: 'https://www.linkedin.com/learning/hr-business-partner-foundations', type: 'course' }, { title: 'Human Resources Management — Coursera (Free Audit)', url: 'https://www.coursera.org/specializations/human-resource-management', type: 'course' }], skillsAddressed: ['HRBP Strategy', 'People Analytics'], priority: 'high' },
        { id: 'demo-t3', title: 'Rewrite your resume with restart narrative', description: 'Update your resume to include your career break transparently and positively. Use the SheStarts resume guide to frame your gap activities as skills. Lead with your HR expertise.', estimatedHours: 4, dueDate: addDays(now, 21), completed: false, resourceLinks: [{ title: 'How to Address Career Gaps on Your Resume — Indeed', url: 'https://www.indeed.com/career-advice/resumes-cover-letters/career-gap-resume', type: 'article' }], skillsAddressed: ['Resume Writing', 'Personal Branding'], priority: 'high' },
        { id: 'demo-t4', title: 'Refresh LinkedIn profile with new headline and about section', description: 'Update headline to "HR Professional | People Operations | Career Returner". Write an "About" section that confidently addresses your break and highlights your motivation.', estimatedHours: 2, dueDate: addDays(now, 28), completed: false, resourceLinks: [{ title: 'LinkedIn Profile Optimization for Returners', url: 'https://www.linkedin.com/pulse/how-update-your-linkedin-after-career-break/', type: 'article' }], skillsAddressed: ['Personal Branding', 'Networking'], priority: 'medium' },
      ],
      skillsCovered: ['HRBP Strategy', 'People Analytics', 'Resume Writing', 'Personal Branding'],
      expectedScore: 80,
    },
    {
      phase: 'sixty_day',
      startDate: addDays(now, 31),
      endDate: addDays(now, 60),
      goals: [
        'Complete one certification (SHRM-CP prep or People Analytics)',
        'Build one portfolio project (HR policy, onboarding flow, or L&D curriculum)',
        'Have 3 informational conversations with HRBPs',
      ],
      tasks: [
        { id: 'demo-t5', title: 'Start People Analytics course (Coursera/Google)', description: 'People Analytics is the most in-demand skill for modern HRBPs. The free audit of the Wharton People Analytics course is excellent.', estimatedHours: 12, dueDate: addDays(now, 45), completed: false, resourceLinks: [{ title: 'People Analytics — Wharton on Coursera (Free Audit)', url: 'https://www.coursera.org/learn/people-analytics', type: 'course' }, { title: 'HR Analytics — YouTube (Free)', url: 'https://www.youtube.com/results?search_query=hr+analytics+tutorial', type: 'video' }], skillsAddressed: ['People Analytics', 'Data Analysis'], priority: 'high' },
        { id: 'demo-t6', title: 'Build a sample onboarding process document', description: 'Create a complete new employee onboarding checklist and 30/60/90 day plan template. This becomes your portfolio piece. Add it to Google Drive or Notion and share the link.', estimatedHours: 10, dueDate: addDays(now, 52), completed: false, resourceLinks: [{ title: 'Employee Onboarding Best Practices — SHRM', url: 'https://www.shrm.org/topics-tools/topics/onboarding', type: 'article' }, { title: 'Free HR Templates — Notion', url: 'https://www.notion.so/templates/category/human-resources', type: 'article' }], skillsAddressed: ['Onboarding Design', 'Process Documentation'], priority: 'high' },
        { id: 'demo-t7', title: 'Conduct 3 informational interviews with HRBPs', description: 'Reach out to 5 HRBPs on LinkedIn with a genuine message. Ask for a 20-minute call to learn about their day-to-day. These build your network AND give you real interview material.', estimatedHours: 6, dueDate: addDays(now, 58), completed: false, resourceLinks: [{ title: 'How to Request an Informational Interview', url: 'https://www.indeed.com/career-advice/interviewing/informational-interview-request', type: 'article' }], skillsAddressed: ['Networking', 'Communication'], priority: 'medium' },
      ],
      skillsCovered: ['People Analytics', 'Onboarding Design', 'Data Analysis', 'Networking'],
      expectedScore: 88,
    },
    {
      phase: 'ninety_day',
      startDate: addDays(now, 61),
      endDate: addDays(now, 90),
      goals: [
        'Apply to 20 matched HRBP / People Operations roles',
        'Complete 5 mock interviews (record yourself)',
        'Get at least 2 first-round interviews',
      ],
      tasks: [
        { id: 'demo-t8', title: 'Conduct 5 mock interviews (STAR method)', description: 'Practice answering the top 10 HRBP behavioral questions. Record yourself and review. Focus on Situation-Task-Action-Result format with real examples from your past.', estimatedHours: 8, dueDate: addDays(now, 72), completed: false, resourceLinks: [{ title: 'Top 25 HR Business Partner Interview Questions', url: 'https://www.indeed.com/career-advice/interviewing/hr-business-partner-interview-questions', type: 'article' }, { title: 'STAR Method Interview Prep — YouTube', url: 'https://www.youtube.com/results?search_query=STAR+method+HR+interview', type: 'video' }], skillsAddressed: ['Interviewing', 'Communication'], priority: 'high' },
        { id: 'demo-t9', title: 'Apply to 20 targeted HRBP roles', description: 'Use your customized resume for each application. Apply via LinkedIn, Naukri, and directly via company career pages. Track all applications in a spreadsheet.', estimatedHours: 10, dueDate: addDays(now, 85), completed: false, resourceLinks: [{ title: 'LinkedIn Jobs — HRBP India Remote', url: 'https://www.linkedin.com/jobs/search/?keywords=hr+business+partner&location=India&f_WT=2', type: 'article' }, { title: 'Naukri.com — HR Business Partner', url: 'https://www.naukri.com/hr-business-partner-jobs', type: 'article' }], skillsAddressed: ['Job Search', 'Application Strategy'], priority: 'high' },
        { id: 'demo-t10', title: 'Salary negotiation preparation', description: 'Research compensation data for HRBPs in your target city. Prepare your negotiation script for salary, remote work policy, and start date. Practice saying your number out loud.', estimatedHours: 3, dueDate: addDays(now, 89), completed: false, resourceLinks: [{ title: 'HRBP Salary India — Glassdoor', url: 'https://www.glassdoor.co.in/Salaries/hr-business-partner-salary-SRCH_KO0,19.htm', type: 'article' }, { title: 'How to Negotiate Salary After a Career Break', url: 'https://www.linkedin.com/pulse/how-negotiate-salary-after-career-break/', type: 'article' }], skillsAddressed: ['Negotiation', 'Salary Research'], priority: 'medium' },
      ],
      skillsCovered: ['Interviewing', 'Job Search', 'Negotiation', 'Application Strategy'],
      expectedScore: 97,
    },
  ];
}
