/**
 * Custom Hook: useStatistics
 *
 * Manages statistics calculation and state.
 * Separates statistics logic from UI components.
 */

import { useState, useEffect, useCallback } from "react";
import {
  StatisticsService,
  UserStatistics,
  PlatformStatistics,
} from "../services";

export function useUserStatistics() {
  const [stats, setStats] = useState<UserStatistics>({
    totalQuizzesTaken: 0,
    totalQuizzesCreated: 0,
    averageScore: 0,
    currentStreak: 0,
    bestScore: 0,
    totalQuestions: 0,
  });

  const refreshStats = useCallback(() => {
    const calculated = StatisticsService.calculateUserStats();
    setStats(calculated);
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
  };
}

export function usePlatformStatistics() {
  const [stats, setStats] = useState<PlatformStatistics>({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    totalUsers: 0,
    totalContributors: 0,
  });
  const [loading, setLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      const calculated = await StatisticsService.calculatePlatformStats();
      setStats(calculated);
    } catch (error) {
      console.error("Error calculating platform stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    loading,
    refreshStats,
  };
}

export function useRecentPerformance(limit: number = 10) {
  const [performance, setPerformance] = useState<
    Array<{
      quizId: number;
      quizTitle: string;
      score: number;
      date: string;
    }>
  >([]);

  const refreshPerformance = useCallback(() => {
    const data = StatisticsService.getRecentPerformance(limit);
    setPerformance(data);
  }, [limit]);

  useEffect(() => {
    refreshPerformance();
  }, [refreshPerformance]);

  return {
    performance,
    refreshPerformance,
  };
}
