'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserId } from '@/store/userStore';
import { generateUserResults } from '@/lib/results/userResults';
import { getProfileLocally } from '@/lib/localStorage';

interface StudyEntry {
  date: string;
  hours: number;
  tasksCompleted: number;
}

interface ProgressData {
  totalHoursGoal: number;
  streakDays: number;
  skillsLearned: string[];
  milestones: { title: string; date: string; completed: boolean }[];
  careerPath: string;
  currentScore: number;
}

export default function ProgressPage() {
  const [studyLog, setStudyLog] = useState<StudyEntry[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [todayHours, setTodayHours] = useState('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logSaved, setLogSaved] = useState(false);

  const userId = getUserId();

  useEffect(() => {
    // Load study log from localStorage
    const savedLog = localStorage.getItem(`study_log_${userId}`);
    if (savedLog) setStudyLog(JSON.parse(savedLog));

    const savedTasks = localStorage.getItem(`roadmap_tasks_${userId}`);
    if (savedTasks) setCompletedTasks(JSON.parse(savedTasks));

    // Load profile and generate data
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

        const dailyHours = profile.availability?.dailyStudyHours ?? 2;
        const weeklyDays = profile.availability?.weeklyAvailableDays ?? 5;

        setProgressData({
          totalHoursGoal: dailyHours * weeklyDays * 13, // 90 days ≈ 13 weeks
          streakDays: getStreakDays(JSON.parse(localStorage.getItem(`study_log_${userId}`) || '[]')),
          skillsLearned: [],
          milestones: getMilestones(),
          careerPath: results.score.careerPath,
          currentScore: results.score.overallScore,
        });
      } catch {
        setProgressData(getDemoProgress());
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId]);

  const logStudyTime = () => {
    const hours = parseFloat(todayHours);
    if (isNaN(hours) || hours <= 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const newLog: StudyEntry = {
      date: today,
      hours,
      tasksCompleted: completedTasks.length,
    };

    const existingIdx = studyLog.findIndex(l => l.date === today);
    const updatedLog = existingIdx >= 0
      ? studyLog.map((l, i) => i === existingIdx ? { ...l, hours: l.hours + hours } : l)
      : [...studyLog, newLog];

    setStudyLog(updatedLog);
    localStorage.setItem(`study_log_${userId}`, JSON.stringify(updatedLog));
    setTodayHours('');
    setLogSaved(true);
    setTimeout(() => setLogSaved(false), 3000);
  };

  const totalHoursStudied = studyLog.reduce((sum, e) => sum + e.hours, 0);
  const streakDays = getStreakDays(studyLog);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-\[#0B3540\] border-t-transparent rounded-full" />
      </div>
    );
  }

  const goal = progressData?.totalHoursGoal ?? 100;
  const progressPercent = Math.min(100, Math.round((totalHoursStudied / goal) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-\[#0D6B7A\] font-medium text-sm">Your Journey</p>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">Progress Tracker</h1>
        <p className="text-gray-500 mt-1 text-sm">Track your study time, milestones, and career readiness growth</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Hours Studied', value: totalHoursStudied.toFixed(1), unit: 'hrs', icon: '⏱️', color: 'bg-\[#EFF7F7\] border-\[#00C4BA\]' },
          { label: 'Current Streak', value: streakDays, unit: 'days', icon: '🔥', color: 'bg-orange-50 border-orange-200' },
          { label: 'Tasks Completed', value: completedTasks.length, unit: 'tasks', icon: '✅', color: 'bg-green-50 border-green-200' },
          { label: 'Career Score', value: progressData?.currentScore ?? 72, unit: '/100', icon: '📊', color: 'bg-blue-50 border-blue-200' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl p-4 border ${stat.color} text-center`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-black text-gray-900">{stat.value}<span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span></div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">90-Day Goal Progress</h2>
          <span className="text-sm font-bold text-\[#0D6B7A\]">{progressPercent}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{totalHoursStudied.toFixed(1)} hours studied</span>
          <span>Goal: {goal} hours</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Log Study Time */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Log Today's Study</h2>
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600 font-medium block mb-1.5">Hours studied today</label>
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={todayHours}
                onChange={e => setTodayHours(e.target.value)}
                placeholder="2.5"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-\[#00C4BA\] focus:ring-2 focus:ring-purple-100 text-sm"
              />
            </div>
            <button
              onClick={logStudyTime}
              disabled={!todayHours || logSaved}
              className="px-5 py-3 bg-\[#0B3540\] text-white font-semibold rounded-xl hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {logSaved ? '✓ Saved' : 'Log'}
            </button>
          </div>

          {/* Recent entries */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</p>
            {studyLog.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No study sessions logged yet. Start today!</p>
            ) : (
              studyLog.slice(-5).reverse().map(entry => (
                <div key={entry.date} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                  <span className="text-gray-600">{new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="font-semibold text-gray-900">{entry.hours}h studied</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Milestones</h2>
          <div className="space-y-3">
            {getMilestones().map((milestone, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${milestone.completed || completedTasks.length > i * 2 ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                  milestone.completed || completedTasks.length > i * 2
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {milestone.completed || completedTasks.length > i * 2 ? '✓' : i + 1}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${milestone.completed || completedTasks.length > i * 2 ? 'text-green-800' : 'text-gray-700'}`}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Target: {milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Heatmap */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Study Activity (Last 30 Days)</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toISOString().slice(0, 10);
            const entry = studyLog.find(l => l.date === dateStr);
            const hours = entry?.hours ?? 0;

            return (
              <div
                key={i}
                title={`${dateStr}: ${hours}h`}
                className={`h-8 rounded-md transition-colors ${
                  hours >= 3 ? 'bg-\[#0B3540\]' :
                  hours >= 2 ? 'bg-\[#EFF7F7\]0' :
                  hours >= 1 ? 'bg-purple-300' :
                  hours > 0 ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>Less</span>
          {['bg-gray-100', 'bg-purple-100', 'bg-purple-300', 'bg-\[#EFF7F7\]0', 'bg-\[#0B3540\]'].map(c => (
            <div key={c} className={`w-4 h-4 rounded ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-50 to-\[#0D6B7A\] rounded-2xl border border-\[#00C4BA\] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900">Keep the momentum going!</h3>
          <p className="text-sm text-gray-500 mt-0.5">Every hour of study brings you closer to your next career chapter.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/roadmap" className="px-4 py-2.5 bg-\[#0B3540\] text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors text-sm">
            Continue Roadmap →
          </Link>
          <Link href="/counselor" className="px-4 py-2.5 bg-white border border-\[#00C4BA\] text-\[#0D6B7A\] font-semibold rounded-xl hover:bg-\[#EFF7F7\] transition-colors text-sm">
            Talk to Prerna
          </Link>
        </div>
      </div>
    </div>
  );
}

function getStreakDays(log: StudyEntry[]): number {
  if (log.length === 0) return 0;

  const sortedDates = [...new Set(log.map(l => l.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let checkDate = today;

  for (const date of sortedDates) {
    if (date === checkDate) {
      streak++;
      const prev = new Date(checkDate);
      prev.setDate(prev.getDate() - 1);
      checkDate = prev.toISOString().slice(0, 10);
    } else {
      break;
    }
  }

  return streak;
}

function getMilestones() {
  const now = new Date();
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return [
    { title: 'Complete skill gap audit', date: addDays(now, 7), completed: false },
    { title: 'Finish first online course', date: addDays(now, 14), completed: false },
    { title: 'Update resume and LinkedIn', date: addDays(now, 21), completed: false },
    { title: 'Complete certification', date: addDays(now, 45), completed: false },
    { title: 'Build portfolio project', date: addDays(now, 60), completed: false },
    { title: 'Complete 5 mock interviews', date: addDays(now, 75), completed: false },
    { title: 'Submit 20 job applications', date: addDays(now, 88), completed: false },
  ];
}

function getDemoProgress(): ProgressData {
  return {
    totalHoursGoal: 162,
    streakDays: 0,
    skillsLearned: [],
    milestones: getMilestones(),
    careerPath: 'HR Business Partner',
    currentScore: 72,
  };
}
