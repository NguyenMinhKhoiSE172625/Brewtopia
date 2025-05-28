/**
 * DebugService.ts
 * Utility to help with debugging API requests and responses
 */

class DebugService {
  // Enable/disable all debug logs
  private isEnabled = __DEV__;

  // Log API request with custom color
  logRequest(url: string, method: string, data: any): void {
    if (!this.isEnabled) return;
    
    console.log(
      `API Request [${method}] ${url}`,
      data
    );
  }

  // Log API response with custom color
  logResponse(url: string, method: string, status: number, data: any): void {
    if (!this.isEnabled) return;
    
    console.log(
      `API Response [${method}] ${url} (${status})`,
      data
    );
  }

  // Log other debug info
  log(message: string, data?: any): void {
    if (!this.isEnabled) return;
    
    if (data) {
      console.log(`DEBUG: ${message}`, data);
    } else {
      console.log(`DEBUG: ${message}`);
    }
  }

  // Log errors with custom color
  logError(message: string, error: any): void {
    if (!this.isEnabled) return;
    
    console.log(
      `ERROR: ${message}`,
      error
    );
  }
}

// Export as singleton
export default new DebugService(); 