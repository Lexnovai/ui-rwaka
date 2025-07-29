'use client'

class AuthRedirectManager {
  private static instance: AuthRedirectManager;
  private isRedirecting = false;
  private redirectTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AuthRedirectManager {
    if (!AuthRedirectManager.instance) {
      AuthRedirectManager.instance = new AuthRedirectManager();
    }
    return AuthRedirectManager.instance;
  }

  redirectToAuth(reason: string = 'token_expired'): void {
    // Prevent multiple simultaneous redirects
    if (this.isRedirecting) {
      console.log('Redirect already in progress, ignoring duplicate redirect request');
      return;
    }

    // Don't redirect if we're already on an OAuth page
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/oauth/') || currentPath.includes('/auth/')) {
        console.log('Already on auth page, not redirecting');
        return;
      }
    }

    console.log(`Initiating auth redirect due to: ${reason}`);
    this.isRedirecting = true;

    // Clear any existing timeout
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }

    // Set a timeout to reset the flag in case something goes wrong
    this.redirectTimeout = setTimeout(() => {
      this.isRedirecting = false;
    }, 5000);

    if (typeof window !== 'undefined') {
      const currentUrl = encodeURIComponent(window.location.href);
      const redirectUrl = `https://rwaka.rw/api/oauth/init?next=${currentUrl}`;
      
      console.log(`Redirecting to: ${redirectUrl}`);
      window.location.href = redirectUrl;
    }
  }

  isCurrentlyRedirecting(): boolean {
    return this.isRedirecting;
  }

  reset(): void {
    this.isRedirecting = false;
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = null;
    }
  }
}

export const authRedirectManager = AuthRedirectManager.getInstance();
