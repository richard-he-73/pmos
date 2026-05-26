import { useState, useEffect, useCallback } from 'react';
import { getThemeConfig, saveThemeConfig, applyTheme, getEffectiveTheme, type ThemeMode, type ThemeConfig } from '../utils/theme';

export const useTheme = () => {
  const [config, setConfig] = useState<ThemeConfig>(getThemeConfig);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(
    getEffectiveTheme(config.mode)
  );

  useEffect(() => {
    applyTheme(config.mode);
  }, [config.mode]);

  useEffect(() => {
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (config.mode === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setEffectiveTheme(newTheme);
      }
    };

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', handleSystemChange);

    return () => {
      mql.removeEventListener('change', handleSystemChange);
    };
  }, [config.mode]);

  const setMode = useCallback((mode: ThemeMode) => {
    const newConfig = { ...config, mode };
    setConfig(newConfig);
    saveThemeConfig({ mode });
    setEffectiveTheme(getEffectiveTheme(mode));
  }, [config]);

  const setAccentColor = useCallback((color: string) => {
    const newConfig = { ...config, accentColor: color };
    setConfig(newConfig);
    saveThemeConfig({ accentColor: color });
  }, [config]);

  return {
    config,
    effectiveTheme,
    setMode,
    setAccentColor,
  };
};