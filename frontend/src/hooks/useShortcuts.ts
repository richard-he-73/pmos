import { useEffect, useCallback, useRef } from 'react';
import { shortcutManager, type Shortcut } from '../utils/shortcuts';

export const useShortcuts = (shortcuts: Shortcut[]) => {
  const registeredIds = useRef<string[]>([]);

  useEffect(() => {
    shortcuts.forEach(shortcut => {
      const id = shortcutManager.register(shortcut);
      registeredIds.current.push(id);
    });

    return () => {
      registeredIds.current.forEach(id => {
        shortcutManager.unregister(id);
      });
      registeredIds.current = [];
    };
  }, [shortcuts]);
};

export const useGlobalShortcuts = () => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcutManager.handleKeyEvent(event);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: shortcutManager.getShortcuts(),
    categories: shortcutManager.getCategories(),
    enabled: shortcutManager.isEnabled(),
    toggle: shortcutManager.toggle.bind(shortcutManager),
    enable: shortcutManager.enable.bind(shortcutManager),
    disable: shortcutManager.disable.bind(shortcutManager),
  };
};