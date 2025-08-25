// Activity tracker for session management
import { AdminSession } from './session';

export class ActivityTracker {
  private static instance: ActivityTracker;
  private isTrackingUser = false;
  private isTrackingAdmin = false;

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  private updateUserActivity = () => {
    // Simply update the activity timestamp - authentication is handled by React Query now
    sessionStorage.setItem('last-activity', Date.now().toString());
  };

  private updateAdminActivity = () => {
    const adminUser = AdminSession.getUser();
    if (adminUser) {
      sessionStorage.setItem("adminLastActivity", Date.now().toString());
    }
  };

  startTrackingUser() {
    if (this.isTrackingUser) return;
    
    this.isTrackingUser = true;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.updateUserActivity, { passive: true });
    });
  }

  startTrackingAdmin() {
    if (this.isTrackingAdmin) return;
    
    this.isTrackingAdmin = true;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.updateAdminActivity, { passive: true });
    });
  }

  stopTrackingUser() {
    if (!this.isTrackingUser) return;
    
    this.isTrackingUser = false;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.removeEventListener(event, this.updateUserActivity);
    });
  }

  stopTrackingAdmin() {
    if (!this.isTrackingAdmin) return;
    
    this.isTrackingAdmin = false;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.removeEventListener(event, this.updateAdminActivity);
    });
  }

  stopAllTracking() {
    this.stopTrackingUser();
    this.stopTrackingAdmin();
  }
}

// Hook for user activity tracking
export const useActivityTracker = () => {
  const tracker = ActivityTracker.getInstance();
  
  return {
    startTrackingUser: () => tracker.startTrackingUser(),
    startTrackingAdmin: () => tracker.startTrackingAdmin(),
    stopTrackingUser: () => tracker.stopTrackingUser(),
    stopTrackingAdmin: () => tracker.stopTrackingAdmin(),
    stopAllTracking: () => tracker.stopAllTracking(),
  };
};