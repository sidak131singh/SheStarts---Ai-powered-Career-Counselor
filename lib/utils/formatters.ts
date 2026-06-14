/**
 * Utility functions for string formatting and parsing
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });
  return formatter.format(amount);
}

export function formatScore(score: number): string {
  return `${Math.round(score)}/100`;
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}

export function formatWeeks(weeks: number): string {
  if (weeks === 1) return '1 week';
  if (weeks < 4) return `${weeks} weeks`;
  const months = Math.ceil(weeks / 4);
  if (months === 1) return '1 month';
  return `${months} months`;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function parseCSV(csvString: string): string[] {
  return csvString
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
