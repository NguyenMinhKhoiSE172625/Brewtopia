/**
 * DebugService.ts
 * Utility to help with debugging API requests and responses
 */

class DebugService {
  // Enable/disable all debug logs
  private isEnabled = __DEV__;

  // Log API request với custom color
  logRequest(url: string, method: string, data: any): void {
    if (!this.isEnabled) return;
    console.log(`API Request [${method}] ${url}`, data);
  }

  // Log API response với custom color
  logResponse(url: string, method: string, status: number, data: any): void {
    if (!this.isEnabled) return;
    console.log(`API Response [${method}] ${url} (${status})`, data);
  }

  // Chỉ log lỗi quan trọng
  logError(message: string, error: any): void {
    if (!this.isEnabled) return;
    console.log(`ERROR: ${message}`, error);
  }
}

// Export as singleton
export default new DebugService(); 