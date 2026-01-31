/**
 * Utility functions for PostHog session management
 */

/**
 * Get the current PostHog session ID
 * Returns null if PostHog is not available or not initialized
 */
export function getPostHogSessionId(): string | null {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    // Check if PostHog is available on the window object
    const posthog = (window as Window & { posthog?: { get_session_id: () => string } }).posthog;
    if (!posthog) {
      return null;
    }

    // Get the session ID from PostHog
    const sessionId = posthog.get_session_id();
    return sessionId || null;
  } catch (error) {
    console.warn('Failed to get PostHog session ID:', error);
    return null;
  }
}

/**
 * Get PostHog session ID with fallback to a generated ID
 * This ensures we always have a session identifier
 */
export function getSessionIdWithFallback(): string {
  const posthogSessionId = getPostHogSessionId();
  
  if (posthogSessionId) {
    return posthogSessionId;
  }

  // Fallback: generate a simple session ID if PostHog is not available
  // This could be stored in sessionStorage for consistency across page reloads
  const fallbackKey = 'bassist_session_id';
  let fallbackSessionId = sessionStorage.getItem(fallbackKey);
  
  if (!fallbackSessionId) {
    // Generate a simple session ID (not ULID since this is client-side)
    fallbackSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(fallbackKey, fallbackSessionId);
  }
  
  return fallbackSessionId;
}

