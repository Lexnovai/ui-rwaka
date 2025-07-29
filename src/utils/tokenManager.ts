'use client'

import { authRedirectManager } from './authRedirectManager'
import { debug } from './debug'

export interface TokenManagerOptions {
  onTokenExpired?: () => void;
  onTokenRefreshed?: (newToken: string) => void;
  landingPageUrl?: string;
}

export class TokenManager {
  private static instance: TokenManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private options: TokenManagerOptions = {};
  private isChecking = false;
  private checkInterval = 120000 // Check every 2 minutes (refresh before 3-minute expiry) (since Whop tokens expire in ~3-5 minutes)

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setOptions(options: TokenManagerOptions) {
    this.options = {
      landingPageUrl: 'https://rwaka.rw',
      ...options
    };
  }

  startTokenMonitoring() {
    debug.log('TokenManager.startTokenMonitoring() - Starting with 1-minute intervals');
    
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Check token validity every 2 minutes (proactive refresh before 3-minute expiry)
    this.refreshTimer = setInterval(() => {
      this.checkTokenValidity();
    }, this.checkInterval);

    // Wait 30 seconds before first check to allow initial auth to complete
    setTimeout(() => {
      this.checkTokenValidity();
    }, 30000);
  }

  private async checkTokenValidity() {
    if (this.isChecking) return;
    
    // Skip if we're in an OAuth flow (URL contains code or state)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('code') || urlParams.has('state')) {
        debug.log('TokenManager.checkTokenValidity() - Skipping check during OAuth flow')
        return
      }
    }
    
    this.isChecking = true;
    debug.log('TokenManager.checkTokenValidity() - Starting token validation...');

    // First check if token is close to expiring (proactive refresh)
    const shouldRefreshEarly = await this.shouldRefreshTokenEarly();
    if (shouldRefreshEarly) {
      debug.log('Token expires soon, attempting proactive refresh...');
      await this.attemptTokenRefresh();
      this.isChecking = false;
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          debug.log('Token validation failed, attempting refresh...');
          
          // Try to refresh the token first
          debug.log('Token validation failed, attempting automatic refresh...');
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Referer': typeof window !== 'undefined' ? window.location.href : 'https://testing.rwaka.rw/'
            },
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              if (refreshData.refreshed) {
                debug.log('Token refresh successful via API - got new token, continuing monitoring');
              } else {
                debug.log('Token is still valid - no refresh needed, continuing monitoring');
              }
              return; // Token refreshed successfully or still valid, continue monitoring
            }
          }
          
          // If we get here, either refresh failed or requires re-auth
          const refreshData = await refreshResponse.json().catch(() => ({}));
          if (refreshData.requiresReauth) {
            debug.log('Token refresh requires re-authentication, handling expiration...');
            this.handleTokenExpired();
          } else {
            debug.log('Token refresh failed with unknown error, handling expiration...');
            this.handleTokenExpired();
          }
        }
      }
    } catch (error) {
      debug.error('Token validation failed:', error);
      // Don't redirect on network errors, only on auth failures
    } finally {
      this.isChecking = false;
    }
  }

  private handleTokenExpired() {
    debug.log('Token expired, handling expiration...');
    
    if (this.options.onTokenExpired) {
      this.options.onTokenExpired();
    } else {
      // Default behavior: use centralized redirect manager
      authRedirectManager.redirectToAuth('token_manager_expired');
    }
  }

  stopTokenMonitoring() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Method to manually trigger token check (useful for user actions)
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      debug.error('Manual token validation failed:', error);
      return false;
    }
  }

  private async shouldRefreshTokenEarly(): Promise<boolean> {
    try {
      // Get current token from cookies
      const response = await fetch('/api/debug-token');
      if (!response.ok) return false;
      
      const tokenData = await response.json();
      
      // Refresh if token expires in less than 60 seconds (1 minute buffer)
      return tokenData.timeToExpirySeconds < 60;
    } catch (error) {
      debug.error('Error checking token expiry:', error);
      return false;
    }
  }

  private async attemptTokenRefresh(): Promise<void> {
    try {
      debug.log('Attempting proactive token refresh...');
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Referer': typeof window !== 'undefined' ? window.location.href : 'https://testing.rwaka.rw/'
        },
      });

      if (refreshResponse.ok) {
        const result = await refreshResponse.json();
        if (result.refreshed) {
          debug.log('Proactive token refresh successful!');
          return;
        }
      }
      
      debug.log('Proactive refresh failed, will try again later');
    } catch (error) {
      debug.error('Proactive refresh error:', error);
    }
  }
}

// Utility function to initialize token management
export function initializeTokenManager(options?: TokenManagerOptions) {
  if (typeof window !== 'undefined') {
    const tokenManager = TokenManager.getInstance();
    if (options) {
      tokenManager.setOptions(options);
    }
    tokenManager.startTokenMonitoring();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      tokenManager.stopTokenMonitoring();
    });

    return tokenManager;
  }
  return null;
}
