// Username storage utilities for remembering usernames
const USERNAME_STORAGE_KEY = 'remembered-usernames';
const ADMIN_USERNAME_KEY = 'remembered-admin-username';

export interface RememberedUsername {
  username: string;
  lastUsed: number;
}

export const UsernameStorage = {
  // Regular user username storage
  saveUsername: (username: string) => {
    try {
      const existing = UsernameStorage.getSavedUsernames();
      const updated = existing.filter(u => u.username !== username);
      updated.unshift({ username, lastUsed: Date.now() });
      
      // Keep only the last 5 usernames
      const limited = updated.slice(0, 5);
      localStorage.setItem(USERNAME_STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.warn('Failed to save username:', error);
    }
  },

  getSavedUsernames: (): RememberedUsername[] => {
    try {
      const stored = localStorage.getItem(USERNAME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load saved usernames:', error);
      return [];
    }
  },

  getMostRecentUsername: (): string => {
    const usernames = UsernameStorage.getSavedUsernames();
    return usernames.length > 0 ? usernames[0].username : '';
  },

  removeUsername: (username: string) => {
    try {
      const existing = UsernameStorage.getSavedUsernames();
      const filtered = existing.filter(u => u.username !== username);
      localStorage.setItem(USERNAME_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Failed to remove username:', error);
    }
  },

  // Admin username storage
  saveAdminUsername: (username: string) => {
    try {
      localStorage.setItem(ADMIN_USERNAME_KEY, username);
    } catch (error) {
      console.warn('Failed to save admin username:', error);
    }
  },

  getSavedAdminUsername: (): string => {
    try {
      return localStorage.getItem(ADMIN_USERNAME_KEY) || '';
    } catch (error) {
      console.warn('Failed to load saved admin username:', error);
      return '';
    }
  },

  clearAdminUsername: () => {
    try {
      localStorage.removeItem(ADMIN_USERNAME_KEY);
    } catch (error) {
      console.warn('Failed to clear admin username:', error);
    }
  },

  // Clear all stored usernames
  clearAll: () => {
    try {
      localStorage.removeItem(USERNAME_STORAGE_KEY);
      localStorage.removeItem(ADMIN_USERNAME_KEY);
    } catch (error) {
      console.warn('Failed to clear username storage:', error);
    }
  }
};