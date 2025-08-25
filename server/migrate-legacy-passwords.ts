// Legacy password migration script
// This script flags existing users with weak passwords for mandatory password reset

import { storage } from "./storage";

export async function migrateLegacyPasswords() {
  console.log("Starting legacy password migration...");
  
  try {
    // Get all users
    const users = await storage.getAllUsers();
    
    let flaggedCount = 0;
    
    for (const user of users) {
      // THE FIX IS HERE: Check the 'hashed_password' field instead of 'password'
      if (user.hashed_password && !user.hashed_password.startsWith('$2b$') && !user.hashed_password.startsWith('$2a$')) {
        console.log(`Flagging user ${user.username} for password reset (plain text password detected)`);
        await storage.flagUserForPasswordReset(user.id);
        flaggedCount++;
      }
    }
    
    console.log(`Migration complete. Flagged ${flaggedCount} users for password reset.`);
    return { success: true, flaggedCount };
  } catch (error) {
    console.error("Error during legacy password migration:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Run migration if this script is executed directly
// Note: This part of the script might not be needed anymore since you're starting with a fresh database,
// but we'll keep it for completeness.
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLegacyPasswords().then((result) => {
    if (result.success) {
      console.log(`Migration completed successfully. ${result.flaggedCount} users flagged.`);
      process.exit(0);
    } else {
      console.error("Migration failed:", result.error);
      process.exit(1);
    }
  });
}
