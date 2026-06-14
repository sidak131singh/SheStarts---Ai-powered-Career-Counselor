/**
 * Input validation utilities
 */

import { UserProfile } from '@/types/assessment';

export function sanitizeForPrompt(input: string): string {
  return input
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .replace(/\[INST\]/gi, '')
    .slice(0, 2000);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

export function validateDailyHours(hours: number): boolean {
  return hours >= 0.5 && hours <= 12;
}

export function validateSalaryRange(min: number, max: number): boolean {
  return min >= 0 && max >= min && max <= 10000000; // 1 crore max
}

export function calculateGapDurationMonths(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months += end.getMonth() - start.getMonth();

  return Math.max(0, months);
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateAssessmentStep(stepNumber: number, data: Partial<UserProfile>): void {
  const rules: Record<number, (data: Partial<UserProfile>) => void> = {
    0: (data) => {
      // Education step
      if (!data.education?.highestEducation)
        throw new ValidationError('highestEducation', 'Highest education is required');
      if (!data.education?.educationField?.trim())
        throw new ValidationError('educationField', 'Field of study is required');
    },
    1: (data) => {
      // Experience step
      if (data.experience?.yearsOfExperience === undefined)
        throw new ValidationError('yearsOfExperience', 'Years of experience is required');
      if (data.experience.yearsOfExperience < 0)
        throw new ValidationError('yearsOfExperience', 'Cannot be negative');
    },
    2: (data) => {
      // Gap step
      if (!data.gap?.startDate || !data.gap?.endDate) {
        throw new ValidationError('gap', 'Career gap dates are required');
      }
      if (!validateDateRange(new Date(data.gap.startDate), new Date(data.gap.endDate))) {
        throw new ValidationError('gap', 'End date must be after start date');
      }
    },
    3: (data) => {
      if (!data.skills?.currentSkills?.length)
        throw new ValidationError('currentSkills', 'Add at least one current skill');
    },
    4: (data) => {
      if (!data.preferences?.targetCareerPaths?.length)
        throw new ValidationError('targetCareerPaths', 'Add at least one target career path');
      if (!data.preferences.location?.trim())
        throw new ValidationError('location', 'Preferred location is required');
      if (
        !validateSalaryRange(
          data.preferences.salaryExpectationMin,
          data.preferences.salaryExpectationMax
        )
      ) {
        throw new ValidationError('salary', 'Salary range is invalid');
      }
    },
    5: (data) => {
      if (!data.availability || !validateDailyHours(data.availability.dailyStudyHours))
        throw new ValidationError('dailyStudyHours', 'Daily study hours must be between 0.5 and 12');
      if (
        data.availability.weeklyAvailableDays < 1 ||
        data.availability.weeklyAvailableDays > 7
      ) {
        throw new ValidationError('weeklyAvailableDays', 'Available days must be between 1 and 7');
      }
    },
    6: (data) => {
      if (!data.motivationStatement?.trim())
        throw new ValidationError('motivationStatement', 'Motivation statement is required');
    },
  };

  const validator = rules[stepNumber];
  if (validator) {
    validator(data);
  }
}
