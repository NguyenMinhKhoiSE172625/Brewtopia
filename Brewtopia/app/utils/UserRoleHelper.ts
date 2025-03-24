/**
 * UserRoleHelper.ts
 * Utility to help manage user roles and permissions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DebugService from './DebugService';

// Available roles in the system
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// Role display names
const ROLE_DISPLAY_NAMES = {
  [UserRole.USER]: 'User',
  [UserRole.ADMIN]: 'Business'
};

class UserRoleHelper {
  /**
   * Get the current user's role
   */
  async getCurrentRole(): Promise<UserRole | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      return user.role as UserRole || UserRole.USER;
    } catch (error) {
      DebugService.logError('Error getting user role', error);
      return null;
    }
  }

  /**
   * Check if current user has a specific role
   */
  async hasRole(role: UserRole): Promise<boolean> {
    const currentRole = await this.getCurrentRole();
    return currentRole === role;
  }

  /**
   * Get display name for a role
   */
  getDisplayName(role: UserRole | string | null): string {
    if (!role) return ROLE_DISPLAY_NAMES[UserRole.USER];
    return ROLE_DISPLAY_NAMES[role as UserRole] || ROLE_DISPLAY_NAMES[UserRole.USER];
  }

  /**
   * Check if provided role is valid for login path
   */
  isValidRoleForPath(userRole: string | null, pathRole: string | null): boolean {
    // Admin users should only log in through admin path
    if (userRole === UserRole.ADMIN && pathRole !== UserRole.ADMIN) {
      return false;
    }
    
    // Regular users should only log in through user path
    if (userRole !== UserRole.ADMIN && pathRole === UserRole.ADMIN) {
      return false;
    }
    
    return true;
  }

  /**
   * Get validation error message based on role mismatch
   */
  getRoleValidationError(userRole: string | null, pathRole: string | null): string {
    if (userRole === UserRole.ADMIN && pathRole !== UserRole.ADMIN) {
      return 'Please log in as a business account';
    }
    
    if (userRole !== UserRole.ADMIN && pathRole === UserRole.ADMIN) {
      return 'This account is not a business account';
    }
    
    return '';
  }
}

// Export as singleton
export default new UserRoleHelper(); 