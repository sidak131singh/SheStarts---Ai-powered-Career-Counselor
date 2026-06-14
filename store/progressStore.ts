import { create } from 'zustand';
import { EmployabilityScore } from '@/types/scoring';
import { CareerRecommendation } from '@/types/career';

interface ProgressStore {
  currentScore?: EmployabilityScore;
  selectedCareerPath?: CareerRecommendation;
  completedTasks: string[];
  dailyLogs: Record<string, { date: Date; hoursStudied: number; notes: string }>;
  
  // Actions
  setCurrentScore: (score: EmployabilityScore) => void;
  setSelectedCareerPath: (path: CareerRecommendation) => void;
  markTaskComplete: (taskId: string) => void;
  addDailyLog: (date: string, hoursStudied: number, notes: string) => void;
  getProgressPercentage: () => number;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  completedTasks: [],
  dailyLogs: {},
  
  setCurrentScore: (score) => set({ currentScore: score }),
  
  setSelectedCareerPath: (path) => set({ selectedCareerPath: path }),
  
  markTaskComplete: (taskId) => set((state) => ({
    completedTasks: [...state.completedTasks, taskId],
  })),
  
  addDailyLog: (date, hoursStudied, notes) => set((state) => ({
    dailyLogs: {
      ...state.dailyLogs,
      [date]: { date: new Date(date), hoursStudied, notes },
    },
  })),
  
  getProgressPercentage: () => {
    const state = get();
    if (!state.currentScore) return 0;
    return state.currentScore.overallScore;
  },
}));
