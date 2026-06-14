/**
 * Custom hooks for SheStarts Career Compass
 */

import { useCallback, useState, useEffect } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useProgressStore } from '@/store/progressStore';

/**
 * Hook for streaming chat responses
 */
export function useStreamingChat(userProfile: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/counselor/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'demo-user',
            messages: [...messages, { role: 'user', content: message }],
            userProfile,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable stream');

        let assistantMessage = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
        }

        setMessages((prev) => [
          { role: 'user', content: message },
          { role: 'assistant', content: assistantMessage },
        ]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userProfile]
  );

  return { messages, isLoading, error, sendMessage };
}

/**
 * Hook for career recommendations
 */
export function useCareerRecommendations(userProfile: any) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_recommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/career-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  return { recommendations, isLoading, error, fetch_recommendations };
}

/**
 * Hook for employability score
 */
export function useEmployabilityScore(userProfile: any, careerPath: string) {
  const [score, setScore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate_score = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/employability-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          userProfile,
          careerPath,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate score');
      }

      const data = await response.json();
      setScore(data.score);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, careerPath]);

  return { score, isLoading, error, calculate_score };
}

/**
 * Hook for assessment progress
 */
export function useAssessmentProgress() {
  const { profile, currentStep, setCurrentStep, nextStep, previousStep, getAssessmentData } =
    useAssessmentStore();

  return {
    profile,
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    getAssessmentData,
  };
}

/**
 * Hook for user progress tracking
 */
export function useProgressTracking() {
  const { setCurrentScore, markTaskComplete, addDailyLog, getProgressPercentage } =
    useProgressStore();

  return {
    setCurrentScore,
    markTaskComplete,
    addDailyLog,
    getProgressPercentage,
  };
}
