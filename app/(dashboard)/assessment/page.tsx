'use client';

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { getUserId } from '@/store/userStore';
import { saveProfileLocally } from '@/lib/localStorage';
import {
  CareerGapReason,
  EducationLevel,
  GapActivity,
  LearningStyle,
  UserProfile,
  WorkPreference,
} from '@/types/assessment';

interface AssessmentStep {
  number: number;
  title: string;
  description: string;
}

const STEPS: AssessmentStep[] = [
  { number: 0, title: 'Education', description: 'Tell us about your educational background' },
  { number: 1, title: 'Work Experience', description: 'Share your professional history' },
  { number: 2, title: 'Career Gap', description: 'Tell us about your career break' },
  { number: 3, title: 'Current Skills', description: 'What skills do you have?' },
  { number: 4, title: 'Career Goals', description: 'What are you looking for?' },
  { number: 5, title: 'Availability', description: 'How much time can you dedicate?' },
  { number: 6, title: 'Additional Details', description: 'Tell us more about your situation' },
  { number: 7, title: 'Review', description: 'Review your assessment' },
];

const GAP_ACTIVITIES: { value: GapActivity; label: string }[] = [
  { value: 'freelance', label: 'Freelance work' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'courses', label: 'Courses or certifications' },
  { value: 'community_leadership', label: 'Community leadership' },
  { value: 'caregiving', label: 'Caregiving' },
  { value: 'part_time_work', label: 'Part-time work' },
  { value: 'other', label: 'Other' },
];

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white placeholder:text-gray-400 font-semibold';
const labelClass = 'block text-sm font-bold text-gray-700 uppercase tracking-wide';
const selectClass =
  'mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white font-semibold';

/* ─── TagInput ─────────────────────────────────────────────────────────── */
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

function TagInput({ value, onChange, placeholder, required }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div
      className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 48, alignItems: 'center' }}
    >
      {value.map((tag, i) => (
        <span
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#0B3540',
            color: '#fff',
            borderRadius: 4,
            padding: '2px 10px',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            style={{ color: '#E2D400', fontWeight: 900, fontSize: '1rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2 }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={value.length === 0 ? (placeholder ?? 'Type and press Enter or comma to add') : 'Add more...'}
        required={required && value.length === 0}
        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', minWidth: 120, background: 'transparent', fontWeight: 600, color: '#111' }}
      />
    </div>
  );
}

/* ─── NumberInput ──────────────────────────────────────────────────────── */
interface NumberInputProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  placeholder?: string;
}

function NumberInput({ value, onChange, min, max, step, required, placeholder }: NumberInputProps) {
  const [display, setDisplay] = useState<string>(value === 0 ? '' : String(value));

  const handleFocus = () => { if (value === 0) setDisplay(''); };
  const handleBlur  = () => { if (display === '' || display === '0') { setDisplay(''); onChange(0); } };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplay(e.target.value);
    const n = parseFloat(e.target.value);
    if (!isNaN(n)) onChange(n);
    else if (e.target.value === '') onChange(0);
  };

  return (
    <input
      type="number"
      className={inputClass}
      value={display}
      placeholder={placeholder ?? '0'}
      min={min}
      max={max}
      step={step}
      required={required}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function toDateInputValue(value?: Date | string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function monthsBetween(startDate?: Date | string, endDate?: Date | string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
}

/* ─── Main ─────────────────────────────────────────────────────────────── */
export default function AssessmentPage() {
  const { profile, currentStep, nextStep, previousStep, completeAssessment, updateProfile } =
    useAssessmentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const gapDurationMonths = useMemo(
    () => monthsBetween(profile.gap?.startDate, profile.gap?.endDate),
    [profile.gap?.startDate, profile.gap?.endDate]
  );

  const updateSection = <K extends keyof UserProfile>(
    section: K,
    updates: Partial<NonNullable<UserProfile[K]>>
  ) => {
    updateProfile({ [section]: { ...(profile[section] as object), ...updates } } as Partial<UserProfile>);
  };

  const toggleGapActivity = (activity: GapActivity) => {
    const current = profile.gap?.activities ?? [];
    updateSection('gap', {
      activities: current.includes(activity)
        ? current.filter(a => a !== activity)
        : [...current, activity],
    });
  };

  const handleNextStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const profileToSave = { ...profile, gap: { ...profile.gap, durationMonths: gapDurationMonths } };
    try {
      const userId = getUserId();
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile: profileToSave, step: currentStep }),
      });
      if (!response.ok) {
        const data: { error?: string } = await response.json();
        throw new Error(data.error || 'Failed to save assessment');
      }
      if (currentStep < 7) {
        nextStep();
      } else {
        saveProfileLocally(userId, { ...profileToSave, userId });
        completeAssessment();
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const step            = STEPS[currentStep] ?? STEPS[0];
  const progressPercent = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const STEP_TIPS: Record<number, string> = {
    0: 'Your educational background helps us understand your foundation, not limit your possibilities.',
    1: "Don't undersell your experience. Even 1-2 years gives you valuable transferable skills.",
    2: "Career breaks are common — and we'll help you frame yours as a strength.",
    3: 'Skills from your break count too. Managing a household = project management.',
    4: 'Be ambitious but realistic. We will help you find the sweet spot.',
    5: 'Even 1-2 hours per day consistently is powerful. We build around your real availability.',
    6: 'The more context you share, the sharper your recommendations.',
    7: 'Check your details and submit to get your personalised career roadmap.',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EDF5F5 0%, #F5F9F9 100%)', padding: '32px 16px', fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.01em', color: '#0B3540' }}>
            <span style={{ color: '#0D6B7A' }}>SHE</span>STARTS &nbsp;
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B8E90' }}>CAREER ASSESSMENT</span>
          </div>
          <p style={{ color: '#6B8E90', fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
            About 8 minutes &nbsp;·&nbsp; Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#6B8E90', marginBottom: 6 }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0B3540' }}>{step.title}</span>
            <span style={{ color: '#0D6B7A' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', background: '#D4E5E5', borderRadius: 9999, height: 6 }}>
            <div style={{ width: `${progressPercent}%`, background: '#0B3540', height: 6, borderRadius: 9999, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.number}
                style={{ width: 8, height: 8, borderRadius: '50%', background: i < currentStep ? '#0B3540' : i === currentStep ? '#00C4BA' : '#D4E5E5', transition: 'background 0.3s' }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleNextStep}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 24px rgba(11,53,64,0.08)', border: '1px solid rgba(11,53,64,0.07)', padding: '32px', marginBottom: 16 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', color: '#0B3540', marginBottom: 4 }}>{step.title}</h2>
              <p style={{ color: '#6B8E90', fontSize: '0.875rem', fontWeight: 600 }}>{step.description}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{renderStep()}</div>
            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600 }}>{error}</div>
            )}
          </div>

          {/* Tip */}
          {STEP_TIPS[currentStep] && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#EFF7F7', borderLeft: '3px solid #00C4BA', borderRadius: 4, fontSize: '0.82rem', color: '#0B3540', fontWeight: 600 }}>
              {STEP_TIPS[currentStep]}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 0 || isLoading}
              style={{ padding: '12px 20px', background: '#fff', border: '1.5px solid #D4E5E5', color: '#0B3540', fontWeight: 800, borderRadius: 8, cursor: 'pointer', opacity: (currentStep === 0 || isLoading) ? 0.4 : 1, fontSize: '0.875rem', letterSpacing: '0.04em' }}
            >
              BACK
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{ flex: 1, padding: '12px 24px', background: '#0B3540', color: '#E2D400', fontWeight: 800, borderRadius: 8, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.6 : 1, fontSize: '0.9rem', letterSpacing: '0.06em', fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {isLoading ? 'SAVING...' : currentStep === 7 ? 'COMPLETE ASSESSMENT' : 'CONTINUE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <>
            <label className={labelClass}>
              Highest Education
              <select
                required
                value={profile.education?.highestEducation ?? 'bachelors'}
                onChange={e => updateSection('education', { highestEducation: e.target.value as EducationLevel })}
                className={selectClass}
              >
                <option value="high_school">High School</option>
                <option value="diploma">Diploma</option>
                <option value="bachelors">Bachelor&apos;s Degree</option>
                <option value="masters">Master&apos;s Degree</option>
                <option value="phd">PhD</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className={labelClass}>
              Field of Study
              <input
                required
                value={profile.education?.educationField ?? ''}
                onChange={e => updateSection('education', { educationField: e.target.value })}
                placeholder="e.g. Business Administration, Computer Science"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Institution
              <input
                value={profile.education?.educationInstitution ?? ''}
                onChange={e => updateSection('education', { educationInstitution: e.target.value })}
                placeholder="College or university name"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Graduation Year
              <NumberInput
                value={profile.education?.graduationYear ?? 0}
                onChange={v => updateSection('education', { graduationYear: v })}
                min={1970}
                max={new Date().getFullYear()}
                placeholder={String(new Date().getFullYear())}
                required
              />
            </label>
          </>
        );
      case 1:
        return (
          <>
            <label className={labelClass}>
              Years of Experience
              <NumberInput
                value={profile.experience?.yearsOfExperience ?? 0}
                onChange={v => updateSection('experience', { yearsOfExperience: v })}
                min={0}
                step={0.5}
                placeholder="0"
                required
              />
            </label>
            <label className={labelClass}>
              Last Job Title
              <input
                value={profile.experience?.lastJobTitle ?? ''}
                onChange={e => updateSection('experience', { lastJobTitle: e.target.value })}
                placeholder="e.g. HR Generalist, Teacher, Analyst"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Last Company
              <input
                value={profile.experience?.lastCompany ?? ''}
                onChange={e => updateSection('experience', { lastCompany: e.target.value })}
                placeholder="Company or organization name"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Industry
              <input
                value={profile.experience?.industry ?? ''}
                onChange={e => updateSection('experience', { industry: e.target.value })}
                placeholder="e.g. IT, Education, Healthcare, Finance"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Main Job Functions
              <TagInput
                value={profile.experience?.jobFunctions ?? []}
                onChange={tags => updateSection('experience', { jobFunctions: tags })}
                placeholder="Type a function and press Enter — e.g. Recruiting"
              />
            </label>
          </>
        );
      case 2:
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <label className={labelClass}>
                Gap Start Date
                <input
                  required
                  type="date"
                  value={toDateInputValue(profile.gap?.startDate)}
                  onChange={e => updateSection('gap', { startDate: new Date(e.target.value) })}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Gap End Date
                <input
                  required
                  type="date"
                  value={toDateInputValue(profile.gap?.endDate)}
                  onChange={e => updateSection('gap', { endDate: new Date(e.target.value) })}
                  className={inputClass}
                />
              </label>
            </div>
            <div style={{ background: '#EFF7F7', border: '1.5px solid #00C4BA', borderRadius: 8, padding: '10px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#0B3540' }}>
              Calculated gap duration: <span style={{ color: '#0D6B7A' }}>{gapDurationMonths} months</span>
            </div>
            <label className={labelClass}>
              Main Reason for Career Break
              <select
                required
                value={profile.gap?.reason ?? 'childcare'}
                onChange={e => updateSection('gap', { reason: e.target.value as CareerGapReason })}
                className={selectClass}
              >
                <option value="childcare">Childcare</option>
                <option value="relocation">Relocation</option>
                <option value="health">Health</option>
                <option value="marriage">Marriage</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </label>
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend className={labelClass} style={{ marginBottom: 12 }}>Activities During the Break</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {GAP_ACTIVITIES.map(a => (
                  <label key={a.value} style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={profile.gap?.activities?.includes(a.value) ?? false}
                      onChange={() => toggleGapActivity(a.value)}
                      style={{ accentColor: '#0B3540', width: 16, height: 16 }}
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        );
      case 3:
        return (
          <>
            <label className={labelClass}>
              Current Skills
              <TagInput
                value={profile.skills?.currentSkills ?? []}
                onChange={tags => {
                  updateSection('skills', {
                    currentSkills: tags,
                    skillProficiency: Object.fromEntries(
                      tags.map(t => [t, profile.skills?.skillProficiency?.[t] ?? 'intermediate'])
                    ),
                  });
                }}
                placeholder="Type a skill and press Enter — e.g. Excel"
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#6B8E90', marginTop: 4, fontWeight: 600 }}>Press Enter or comma after each skill to add it as a tag.</p>
            </label>
            <label className={labelClass}>
              Languages
              <TagInput
                value={profile.skills?.languages ?? []}
                onChange={tags => updateSection('skills', { languages: tags })}
                placeholder="Type a language and press Enter — e.g. English"
              />
            </label>
            <label className={labelClass}>
              Certifications
              <TagInput
                value={profile.skills?.certifications?.map(c => c.name) ?? []}
                onChange={tags =>
                  updateSection('skills', {
                    certifications: tags.map(name => ({
                      name,
                      issuer: 'Self-reported',
                      year: new Date().getFullYear(),
                    })),
                  })
                }
                placeholder="Type a certification and press Enter — e.g. Google Analytics"
              />
            </label>
          </>
        );
      case 4:
        return (
          <>
            <label className={labelClass}>
              Target Career Paths
              <TagInput
                value={profile.preferences?.targetCareerPaths ?? []}
                onChange={tags => updateSection('preferences', { targetCareerPaths: tags })}
                placeholder="Type a career path and press Enter — e.g. Data Analyst"
                required
              />
            </label>
            <label className={labelClass}>
              Work Preference
              <select
                required
                value={profile.preferences?.workPreference ?? 'remote'}
                onChange={e => updateSection('preferences', { workPreference: e.target.value as WorkPreference })}
                className={selectClass}
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </label>
            <label className={labelClass}>
              Preferred Location
              <input
                required
                value={profile.preferences?.location ?? ''}
                onChange={e => updateSection('preferences', { location: e.target.value })}
                placeholder="e.g. Bangalore, Mumbai, Remote Only"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Preferred Industries
              <TagInput
                value={profile.preferences?.preferredIndustries ?? []}
                onChange={tags => updateSection('preferences', { preferredIndustries: tags })}
                placeholder="Type an industry and press Enter — e.g. EdTech"
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <label className={labelClass}>
                Min Salary (INR)
                <NumberInput
                  value={profile.preferences?.salaryExpectationMin ?? 0}
                  onChange={v => updateSection('preferences', { salaryExpectationMin: v })}
                  min={0}
                  placeholder="500000"
                />
              </label>
              <label className={labelClass}>
                Max Salary (INR)
                <NumberInput
                  value={profile.preferences?.salaryExpectationMax ?? 0}
                  onChange={v => updateSection('preferences', { salaryExpectationMax: v })}
                  min={0}
                  placeholder="1200000"
                />
              </label>
              <label className={labelClass}>
                Timeline (months)
                <NumberInput
                  value={profile.preferences?.targetTimelineMonths ?? 3}
                  onChange={v => updateSection('preferences', { targetTimelineMonths: v })}
                  min={1}
                  max={24}
                  placeholder="3"
                  required
                />
              </label>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <label className={labelClass}>
                Study Hours Per Day
                <NumberInput
                  value={profile.availability?.dailyStudyHours ?? 0}
                  onChange={v => updateSection('availability', { dailyStudyHours: v })}
                  min={0.5}
                  max={12}
                  step={0.5}
                  placeholder="2.5"
                  required
                />
              </label>
              <label className={labelClass}>
                Available Days Per Week
                <NumberInput
                  value={profile.availability?.weeklyAvailableDays ?? 0}
                  onChange={v => updateSection('availability', { weeklyAvailableDays: v })}
                  min={1}
                  max={7}
                  placeholder="5"
                  required
                />
              </label>
            </div>
            <label className={labelClass}>
              Learning Style
              <select
                required
                value={profile.availability?.learningStyle ?? 'self_paced'}
                onChange={e => updateSection('availability', { learningStyle: e.target.value as LearningStyle })}
                className={selectClass}
              >
                <option value="self_paced">Self-paced</option>
                <option value="structured">Structured Cohort</option>
                <option value="project_based">Project-based</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.875rem', color: '#0B3540', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={profile.availability?.canAttendBootcamp ?? false}
                onChange={e => updateSection('availability', { canAttendBootcamp: e.target.checked })}
                style={{ accentColor: '#0B3540', width: 18, height: 18 }}
              />
              I can attend a bootcamp or live cohort if needed
            </label>
          </>
        );
      case 6:
        return (
          <>
            <label className={labelClass}>
              What is motivating you to restart now?
              <textarea
                required
                rows={5}
                value={profile.motivationStatement ?? ''}
                onChange={e => updateProfile({ motivationStatement: e.target.value })}
                placeholder="Tell us about your goals, constraints, and what a good next role looks like for you."
                className={inputClass}
                style={{ resize: 'vertical' }}
              />
            </label>
            <label className={labelClass}>
              Concerns or Blockers
              <TagInput
                value={profile.concerns ?? []}
                onChange={tags => updateProfile({ concerns: tags })}
                placeholder="Type a concern and press Enter — e.g. Confidence gap"
              />
            </label>
          </>
        );
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#EFF7F7', borderLeft: '3px solid #00C4BA', borderRadius: 4, padding: '12px 16px', color: '#0B3540', fontWeight: 700, fontSize: '0.875rem' }}>
              Review your details below. Use Back to make changes, then complete your assessment.
            </div>
            {[
              { label: 'Education', value: profile.education?.educationField },
              { label: 'Experience', value: `${profile.experience?.yearsOfExperience ?? 0} years` },
              { label: 'Career Gap', value: `${gapDurationMonths} months` },
              { label: 'Skills', value: (profile.skills?.currentSkills ?? []).join(', ') },
              { label: 'Career Goals', value: (profile.preferences?.targetCareerPaths ?? []).join(', ') },
              { label: 'Availability', value: `${profile.availability?.dailyStudyHours ?? 0} hrs/day, ${profile.availability?.weeklyAvailableDays ?? 0} days/week` },
            ].map(item => (
              <div key={item.label} style={{ border: '1px solid #D4E5E5', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B8E90', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: '#0B3540', fontSize: '0.9rem' }}>{item.value || 'Not provided'}</div>
              </div>
            ))}
          </div>
        );
    }
  }
}
