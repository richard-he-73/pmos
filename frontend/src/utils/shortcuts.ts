type KeyHandler = () => void;

interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  handler: KeyHandler;
  description: string;
  category: string;
}

interface RegisteredShortcut extends Shortcut {
  id: string;
}

class ShortcutManager {
  private shortcuts: RegisteredShortcut[] = [];
  private enabled: boolean = true;

  register(shortcut: Shortcut): string {
    const id = `${shortcut.key}-${shortcut.modifiers?.join('-') || 'none'}`;
    
    const existing = this.shortcuts.find(s => s.id === id);
    if (existing) {
      console.warn(`Shortcut ${id} already registered`);
      return id;
    }

    this.shortcuts.push({ ...shortcut, id });
    return id;
  }

  unregister(id: string): void {
    this.shortcuts = this.shortcuts.filter(s => s.id !== id);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  toggle(): void {
    this.enabled = !this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getShortcuts(category?: string): RegisteredShortcut[] {
    if (category) {
      return this.shortcuts.filter(s => s.category === category);
    }
    return [...this.shortcuts];
  }

  getCategories(): string[] {
    return [...new Set(this.shortcuts.map(s => s.category))];
  }

  handleKeyEvent(event: KeyboardEvent): boolean {
    if (!this.enabled) return false;

    const key = event.key.toLowerCase();
    const modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[] = [];

    if (event.ctrlKey || event.metaKey) {
      modifiers.push('ctrl');
    }
    if (event.altKey) {
      modifiers.push('alt');
    }
    if (event.shiftKey) {
      modifiers.push('shift');
    }

    const shortcut = this.shortcuts.find(s => {
      const shortcutKey = s.key.toLowerCase();
      const shortcutModifiers = s.modifiers || [];

      if (shortcutKey !== key) return false;
      if (shortcutModifiers.length !== modifiers.length) return false;

      return shortcutModifiers.every(m => modifiers.includes(m));
    });

    if (shortcut) {
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;

      if (!isInput || (isInput && shortcut.modifiers?.includes('ctrl'))) {
        event.preventDefault();
        shortcut.handler();
        return true;
      }
    }

    return false;
  }
}

const shortcutManager = new ShortcutManager();

export { ShortcutManager, shortcutManager };
export type { Shortcut, RegisteredShortcut };