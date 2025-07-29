'use client'

import { authRedirectManager } from './authRedirectManager'

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
    console.log('TokenManager.startTokenMonitoring() - Starting with 1-minute intervals');
    
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Check token validity every 1 minute (since Whop tokens expire in ~3-5 minutes)
    this.refreshTimer = setInterval(() => {
      this.checkTokenValidity();
    }, 1 * 60 * 1000);

    // Wait 30 seconds before first check to allow initial auth to complete
    setTimeout(() => {
      this.checkTokenValidity();
    }, 30000);
  }

  private async checkTokenValidity() {
    if (this.isChecking) return;
    
    // Don't check if we're already redirecting
    if (authRedirectManager.isCurrentlyRedirecting()) {
      return;
    }
    
    // Don't check if we just came from OAuth (has code or state params)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('code') || urlParams.has('state')) {
        console.log('Skipping token validation - just came from OAuth');
        return;
      }
    }
    
    this.isChecking = true;
    
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
          console.log('Token validation failed, attempting refresh...');
          
          // Try to refresh the token first
          console.log('Token validation failed, attempting automatic refresh...');
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
            if (refreshData.success && refreshData.refreshed) {
              console.log('Token refresh successful via API - continuing monitoring');
              return; // Token refreshed successfully, continue monitoring
            }
          }
          
          // If we get here, either refresh failed or requires re-auth
          const refreshData = await refreshResponse.json().catch(() => ({}));
          if (refreshData.requiresReauth) {
            console.log('Token refresh requires re-authentication, handling expiration...');
            this.handleTokenExpired();
          } else {
            console.log('Token refresh failed with unknown error, handling expiration...');
            this.handleTokenExpired();
          }
        }
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      // Don't redirect on network errors, only on auth failures
    } finally {
      this.isChecking = false;
    }
  }

  private handleTokenExpired() {
    console.log('Token expired, handling expiration...');
    
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
      console.error('Manual token validation failed:', error);
      return false;
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
