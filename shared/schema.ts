import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Enums for controlled vocabularies ---
export const postTypeEnum = pgEnum('post_type', ['wts', 'wtb', 'wtt', 'discussion']);
export const adPositionEnum = pgEnum('ad_position', ['header', 'sidebar', 'footer', 'in-feed']);
export const adSizeEnum = pgEnum('ad_size', ['small', 'medium', 'large']);
export const profileVisibilityEnum = pgEnum('profile_visibility', ['public', 'registered', 'private']);
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system']);
// --- End of Enums ---

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashed_password: text("hashed_password").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  location: text("location"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  isVerified: boolean("is_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  isModerator: boolean("is_moderator").default(false),
  isSuspended: boolean("is_suspended").default(false),
  requirePasswordReset: boolean("require_password_reset").default(false),
  requireUsernameChange: boolean("require_username_change").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: postTypeEnum("type").notNull(),
  description: text("description"),
  icon: text("icon"),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  price: integer("price"),
  location: text("location"),
  contactInfo: text("contact_info"),
  images: json("images").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  views: integer("views").default(0),
  isPinned: boolean("is_pinned").default(false),
  pinnedAt: timestamp("pinned_at"),
  willingToTravel: boolean("willing_to_travel").default(false),
  willingToShip: boolean("willing_to_ship").default(false),
  willingToTrade: boolean("willing_to_trade").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  bumpedAt: timestamp("bumped_at").default(sql`now()`),
});

export const replies = pgTable("replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  postId: varchar("post_id").references(() => posts.id),
  lastMessageAt: timestamp("last_message_at").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  targetUrl: text("target_url").notNull(),
  sponsor: text("sponsor").notNull(),
  sponsorEmail: text("sponsor_email").notNull(),
  position: adPositionEnum("position").notNull(),
  size: adSizeEnum("size").default("medium"),
  isActive: boolean("is_active").default(true),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  startDate: timestamp("start_date").default(sql`now()`),
  endDate: timestamp("end_date"),
  monthlyRate: integer("monthly_rate"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const featuredListings = pgTable("featured_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  sponsorId: varchar("sponsor_id").notNull().references(() => users.id),
  featuredUntil: timestamp("featured_until").notNull(),
  dailyRate: integer("daily_rate").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  emailNotifications: boolean("email_notifications").default(true),
  messageNotifications: boolean("message_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  profileVisibility: profileVisibilityEnum("profile_visibility").default("public"),
  showEmail: boolean("show_email").default(false),
  showLocation: boolean("show_location").default(true),
  theme: themeEnum("theme").default("system"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const passwordHistory = pgTable("password_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});


// --- Zod Schemas and Types ---

export type PasswordHistory = typeof passwordHistory.$inferSelect;
export type InsertPasswordHistory = typeof passwordHistory.$inferInsert;

const passwordValidation = z.string()
  .min(10, "Password must be at least 10 characters long")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)");

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  hashed_password: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  isAdmin: true,
  isModerator: true,
  isSuspended: true,
  requirePasswordReset: true,
  requireUsernameChange: true,
}).extend({
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens (no spaces)"),
  firstName: z.string().min(1, "First name is required").max(50, "First name cannot exceed 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name cannot exceed 50 characters"),
  password: passwordValidation,
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }, "You must be at least 18 years old to register"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordValidation,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation must match",
  path: ["confirmPassword"],
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  bumpedAt: true,
  isActive: true,
  isPinned: true,
  pinnedAt: true,
}).extend({
  images: z.array(z.string()).max(5, "Maximum 5 images allowed").optional(),
  willingToTravel: z.boolean().optional(),
  willingToShip: z.boolean().optional(),
  willingToTrade: z.boolean().optional(),
});

export const insertReplySchema = createInsertSchema(replies).omit({
  id: true,
  authorId: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  senderId: true,
  createdAt: true,
  isRead: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const updateUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  hashed_password: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  isAdmin: true,
  isModerator: true,
  isSuspended: true,
  requirePasswordReset: true,
  requireUsernameChange: true,
  email: true,
  username: true,
}).partial().extend({
  currentPassword: z.string().optional(),
  newPassword: z.string().optional().refine((val) => {
    if (val && val.trim().length > 0 && val.trim().length < 10) {
      return false;
    }
    return true;
  }, "Password must be at least 10 characters"),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.newPassword && data.newPassword.trim().length > 0) {
      if (!data.currentPassword || data.currentPassword.trim().length === 0) {
        return false;
      }
      if (data.newPassword !== data.confirmPassword) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Password confirmation doesn't match or current password is required",
    path: ["confirmPassword"],
  }
);

export const updatePostSchema = createInsertSchema(posts).omit({
  id: true,
  authorId: true,
  createdAt: true,
  views: true,
  bumpedAt: true,
  isPinned: true,
  pinnedAt: true,
}).partial().extend({
  images: z.array(z.string()).max(5, "Maximum 5 images allowed").optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberUsername: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Reply = typeof replies.$inferSelect;
export type InsertReply = z.infer<typeof insertReplySchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = typeof advertisements.$inferInsert;
export type FeaturedListing = typeof featuredListings.$inferSelect;
export type InsertFeaturedListing = typeof featuredListings.$inferInsert;
