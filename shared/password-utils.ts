export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 10) {
    errors.push("Password must be at least 10 characters long");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for special character
  if (!/[@$!%*?&]/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)");
  }

  // Check for only alphanumeric and allowed special characters
  if (!/^[A-Za-z\d@$!%*?&]+$/.test(password)) {
    errors.push("Password can only contain letters, numbers, and these special characters: @$!%*?&");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Server-side only functions - import bcrypt dynamically
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  return bcrypt.default.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return bcrypt.default.compare(password, hash);
}

export function getPasswordRequirements(): string[] {
  return [
    "At least 10 characters long",
    "Contains at least one lowercase letter (a-z)",
    "Contains at least one uppercase letter (A-Z)",
    "Contains at least one number (0-9)",
    "Contains at least one special character (@$!%*?&)",
    "Only contains letters, numbers, and allowed special characters"
  ];
}