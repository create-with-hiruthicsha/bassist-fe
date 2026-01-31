/**
 * Central utility for theme-related functions
 */

export type Theme = 'light' | 'dark' | 'system';
export type ActualTheme = 'light' | 'dark';

/**
 * Gets the system theme preference (light or dark)
 * @returns 'light' or 'dark' based on system preference
 */
export function getSystemTheme(): ActualTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Resolves a theme setting to an actual theme (light or dark)
 * If theme is 'system', returns the system preference
 * @param theme The theme setting (light, dark, or system)
 * @returns The actual theme to apply (light or dark)
 */
export function resolveTheme(theme: Theme): ActualTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}
