import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUserId(email: string): string {
  // Deterministic user ID from email (simple hash)
  let hash = 0;
  const str = email.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const abs = Math.abs(hash).toString(16).padStart(8, '0');
  return `user-${abs}`;
}

export function formatCurrency(value: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function getScoreTier(score: number): {
  tier: 'red' | 'amber' | 'yellow-green' | 'green';
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) return { tier: 'green', label: 'Job Ready', color: 'text-green-700', bgColor: 'bg-green-100' };
  if (score >= 65) return { tier: 'yellow-green', label: 'Nearly Ready', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  if (score >= 40) return { tier: 'amber', label: 'Building Momentum', color: 'text-amber-700', bgColor: 'bg-amber-100' };
  return { tier: 'red', label: 'Getting Started', color: 'text-red-700', bgColor: 'bg-red-100' };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 65) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}
