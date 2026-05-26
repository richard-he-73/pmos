type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeConfig {
  mode: ThemeMode;
  accentColor: string;
}

const STORAGE_KEY = 'pmos-theme';

const defaultConfig: ThemeConfig = {
  mode: 'light',
  accentColor: '#1890ff',
};

export const getThemeConfig = (): ThemeConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load theme config:', error);
  }
  return defaultConfig;
};

export const saveThemeConfig = (config: Partial<ThemeConfig>): void => {
  try {
    const current = getThemeConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save theme config:', error);
  }
};

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

export const applyTheme = (mode: ThemeMode): void => {
  const effectiveTheme = getEffectiveTheme(mode);
  const html = document.documentElement;
  
  if (effectiveTheme === 'dark') {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
  } else {
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
  }
};

export type { ThemeMode, ThemeConfig };