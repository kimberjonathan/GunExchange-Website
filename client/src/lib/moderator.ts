import type { User } from "@shared/schema";

export function isModerator(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.isAdmin === true || user.isModerator === true; // Both admins and moderators have moderator privileges
}

export function canDeletePost(user: User | null | undefined, postAuthorId?: string): boolean {
  if (!user) return false;
  return user.isAdmin === true || user.isModerator === true || user.id === postAuthorId;
}

export function canSuspendUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.isAdmin === true || user.isModerator === true;
}

export function canPinPost(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.isAdmin === true || user.isModerator === true;
}