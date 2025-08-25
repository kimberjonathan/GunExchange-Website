// Session management utilities for admin authentication
export const AdminSession = {
  setUser: (user: any) => {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    sessionStorage.setItem("adminLastActivity", Date.now().toString());
  },

  getUser: () => {
    // Check session storage for admin user
    const sessionUser = sessionStorage.getItem("currentUser");
    if (sessionUser) {
      const lastActivity = sessionStorage.getItem("adminLastActivity");
      if (lastActivity && Date.now() - parseInt(lastActivity) < 60 * 60 * 1000) { // 1 hour inactivity
        // Update last activity
        sessionStorage.setItem("adminLastActivity", Date.now().toString());
        return JSON.parse(sessionUser);
      } else {
        // Session expired due to inactivity
        AdminSession.clearUser();
        return null;
      }
    }

    return null;
  },

  clearUser: () => {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("adminLastActivity");
  },

  isLoggedIn: () => {
    return AdminSession.getUser() !== null;
  }
};