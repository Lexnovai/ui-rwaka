export function decodeJWT(token: string) {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format' };
    }

    // Decode the header
    const header = JSON.parse(atob(parts[0]));
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    const timeUntilExpiry = payload.exp ? payload.exp - now : null;
    
    return {
      header,
      payload,
      isExpired,
      timeUntilExpiry,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
      currentTime: new Date().toISOString()
    };
  } catch (error) {
    return { 
      error: 'Failed to decode JWT', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
