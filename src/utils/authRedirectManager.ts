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
    }, 10000);

    if (typeof window !== 'undefined') {
      const currentUrl = encodeURIComponent(window.location.href);
      
      // Determine the correct landing page based on current domain
      const landingPageUrl = 'https://rwaka.rw';
      if (window.location.hostname.includes('testing')) {
        // For testing.rwaka, we might need to use a different landing page
        // or ensure the OAuth flow works correctly
        console.log('Detected testing domain, using main landing page');
      }
      
      const redirectUrl = `${landingPageUrl}/api/oauth/init?next=${currentUrl}`;
      
      console.log(`Redirecting from ${window.location.hostname} to: ${redirectUrl}`);
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
