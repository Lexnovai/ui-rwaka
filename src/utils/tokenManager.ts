'use client'

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
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Check token validity every 5 minutes
    this.refreshTimer = setInterval(() => {
      this.checkTokenValidity();
    }, 5 * 60 * 1000);

    // Also check immediately
    this.checkTokenValidity();
  }

  private async checkTokenValidity() {
    if (this.isChecking) return;
    
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
          console.log('Token expired, handling expiration...');
          this.handleTokenExpired();
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
    console.log('Token expired, redirecting to login...');
    
    if (this.options.onTokenExpired) {
      this.options.onTokenExpired();
    } else {
      // Default behavior: redirect to landing page OAuth
      const landingPageUrl = this.options.landingPageUrl || 'https://rwaka.rw';
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `${landingPageUrl}/api/oauth/init?next=${currentUrl}`;
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
