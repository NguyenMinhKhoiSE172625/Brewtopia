/**
 * PerformanceOptimizer.ts
 * Utility class để tối ưu hóa performance của app
 */

import { InteractionManager } from 'react-native';

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private pendingTasks: Set<string> = new Set();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Chạy task sau khi tất cả interactions hoàn thành
   */
  runAfterInteractions(task: () => void, taskId?: string): void {
    if (taskId && this.pendingTasks.has(taskId)) {
      return; // Task đã được schedule
    }

    if (taskId) {
      this.pendingTasks.add(taskId);
    }

    InteractionManager.runAfterInteractions(() => {
      try {
        task();
      } finally {
        if (taskId) {
          this.pendingTasks.delete(taskId);
        }
      }
    });
  }

  /**
   * Debounce function để tránh gọi quá nhiều lần
   */
  debounce(func: Function, delay: number, key: string): void {
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Throttle function để giới hạn tần suất gọi
   */
  throttle(func: Function, delay: number, key: string): void {
    if (this.pendingTasks.has(key)) {
      return; // Đã có task đang chờ
    }

    this.pendingTasks.add(key);
    
    setTimeout(() => {
      func();
      this.pendingTasks.delete(key);
    }, delay);
  }

  /**
   * Batch updates để giảm re-renders
   */
  batchUpdates(updates: Array<() => void>): void {
    this.runAfterInteractions(() => {
      updates.forEach(update => update());
    });
  }

  /**
   * Cleanup tất cả timers và tasks
   */
  cleanup(): void {
    // Clear all debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // Clear pending tasks
    this.pendingTasks.clear();
  }

  /**
   * Kiểm tra memory usage và cleanup nếu cần
   */
  checkMemoryUsage(): void {
    // Cleanup expired cache entries
    if (this.debounceTimers.size > 50) {
      console.warn('Too many debounce timers, cleaning up...');
      this.cleanup();
    }
  }
}

export default PerformanceOptimizer; 