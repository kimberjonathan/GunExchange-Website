import { 
  type User, 
  type InsertUser, 
  type Post, 
  type InsertPost, 
  type Category, 
  type Reply, 
  type InsertReply,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type UserPreferences,
  type UpdateUserPreferences,
  type UpdateUserProfile,
  type UpdatePost,
  type Advertisement,
  type InsertAdvertisement,
  type FeaturedListing,
  type InsertFeaturedListing
} from "@shared/schema";
import { randomUUID } from "crypto";
import { validatePassword, hashPassword, verifyPassword } from "@shared/password-utils";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Post methods
  getPosts(): Promise<Post[]>;
  getPostsWithAuthors(): Promise<(Post & { author?: Omit<User, 'password'> })[]>;
  getPostsByCategory(categoryId: string): Promise<(Post & { author?: Omit<User, 'password'> })[]>;
  getPostsByUser(userId: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost, authorId: string): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  updatePostContent(id: string, updates: UpdatePost, authorId: string): Promise<Post | undefined>;
  pinPost(id: string): Promise<Post | undefined>;
  unpinPost(id: string): Promise<Post | undefined>;
  togglePinPost(id: string): Promise<Post | undefined>;
  incrementPostViews(id: string): Promise<void>;
  bumpPost(id: string, authorId: string): Promise<{ success: boolean; message: string; post?: Post }>;
  
  // Reply methods
  getRepliesByPost(postId: string): Promise<Reply[]>;
  createReply(reply: InsertReply, authorId: string): Promise<Reply>;
  
  // Stats
  getStats(): Promise<{
    totalMembers: number;
    activeListings: number;
    postsToday: number;
  }>;
  getCategoryPostCounts(): Promise<{ categoryId: string; postCount: number }[]>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  toggleUserSuspension(userId: string): Promise<User | undefined>;
  deleteUser(userId: string): Promise<boolean>;
  deletePost(postId: string): Promise<boolean>;
  makeUserAdmin(userId: string): Promise<User | undefined>;
  toggleUserModerator(userId: string): Promise<User | undefined>;
  updateUserUsername(userId: string, newUsername: string): Promise<User | undefined>;
  flagUserForPasswordReset(userId: string): Promise<User | null>;
  clearPasswordResetFlag(userId: string): Promise<void>;
  flagUserForUsernameChange(userId: string): Promise<User | null>;
  clearUsernameChangeFlag(userId: string): Promise<void>;
  
  // Messaging methods
  getConversations(userId: string): Promise<(Conversation & { otherUser: User; lastMessage?: Message; unreadCount: number })[]>;
  getConversation(conversationId: string, userId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getMessages(conversationId: string, userId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage, senderId: string): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // User preferences methods
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: string, preferences: UpdateUserPreferences): Promise<UserPreferences>;
  updateUserProfile(userId: string, profile: UpdateUserProfile, hashedPassword?: string): Promise<User | undefined>;
  
  // Password methods
  addPasswordToHistory(userId: string, passwordHash: string): Promise<void>;
  checkPasswordHistory(userId: string, newPassword: string): Promise<boolean>;
  changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }>;
  
  // Advertisement methods
  getAdvertisements(position?: string): Promise<Advertisement[]>;
  createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: string, updates: Partial<Advertisement>): Promise<Advertisement | undefined>;
  incrementAdImpressions(id: string): Promise<void>;
  incrementAdClicks(id: string): Promise<void>;
  
  // Featured listing methods
  getFeaturedListings(): Promise<(FeaturedListing & { post: Post })[]>;
  createFeaturedListing(listing: InsertFeaturedListing): Promise<FeaturedListing>;
  getActiveFeaturedListings(): Promise<(FeaturedListing & { post: Post })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private posts: Map<string, Post>;
  private replies: Map<string, Reply>;
  private advertisements: Map<string, Advertisement>;
  private featuredListings: Map<string, FeaturedListing>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.posts = new Map();
    this.replies = new Map();
    this.advertisements = new Map();
    this.featuredListings = new Map();
    
    this.initializeCategories();
  }

  private initializeCategories() {
    const defaultCategories: Category[] = [
      { id: randomUUID(), name: "Handguns", slug: "wts-handguns", type: "wts", description: "Handguns for sale", icon: "fas fa-handgun" },
      { id: randomUUID(), name: "Long Guns", slug: "wts-long-guns", type: "wts", description: "Rifles and shotguns for sale", icon: "fas fa-gun" },
      { id: randomUUID(), name: "Antique Firearms", slug: "wts-antique", type: "wts", description: "Antique firearms for sale", icon: "fas fa-history" },
      { id: randomUUID(), name: "Ammunition", slug: "wts-ammo", type: "wts", description: "Ammunition for sale", icon: "fas fa-circle" },
      { id: randomUUID(), name: "Parts & Accessories", slug: "wts-parts", type: "wts", description: "Parts and accessories for sale", icon: "fas fa-cog" },
      
      { id: randomUUID(), name: "Handguns", slug: "wtb-handguns", type: "wtb", description: "Looking for handguns", icon: "fas fa-handgun" },
      { id: randomUUID(), name: "Long Guns", slug: "wtb-long-guns", type: "wtb", description: "Looking for rifles and shotguns", icon: "fas fa-gun" },
      { id: randomUUID(), name: "Antique Firearms", slug: "wtb-antique", type: "wtb", description: "Looking for antique firearms", icon: "fas fa-history" },
      { id: randomUUID(), name: "Ammunition", slug: "wtb-ammo", type: "wtb", description: "Looking for ammunition", icon: "fas fa-circle" },
      { id: randomUUID(), name: "Parts & Accessories", slug: "wtb-parts", type: "wtb", description: "Looking for parts and accessories", icon: "fas fa-cog" },
      
      { id: randomUUID(), name: "General Discussion", slug: "general", type: "discussion", description: "General discussions", icon: "fas fa-comments" },
      { id: randomUUID(), name: "CA Gun Laws", slug: "ca-laws", type: "discussion", description: "California gun law discussions", icon: "fas fa-gavel" },
      { id: randomUUID(), name: "Reviews & Recommendations", slug: "reviews", type: "discussion", description: "Product reviews and recommendations", icon: "fas fa-star" },
      { id: randomUUID(), name: "Training & Safety", slug: "training", type: "discussion", description: "Training and safety discussions", icon: "fas fa-shield-alt" },
      { id: randomUUID(), name: "Off Topic", slug: "off-topic", type: "discussion", description: "Off topic discussions", icon: "fas fa-chat" },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      dateOfBirth: new Date(insertUser.dateOfBirth),
      location: insertUser.location || null,
      isVerified: false,
      isAdmin: false,
      isModerator: false,
      isSuspended: false,
      requirePasswordReset: false,
      requireUsernameChange: false,
      createdAt: new Date(),
      updatedAt: null
    };
    this.users.set(id, user);
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => {
        // First sort by pinned status (pinned posts first)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then sort by bump/creation date
        return (b.bumpedAt?.getTime() || b.createdAt?.getTime() || 0) - (a.bumpedAt?.getTime() || a.createdAt?.getTime() || 0);
      });
  }

  async getPostsWithAuthors(): Promise<(Post & { author?: Omit<User, 'password'> })[]> {
    const posts = Array.from(this.posts.values())
      .sort((a, b) => {
        // First sort by pinned status (pinned posts first)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then sort by bump/creation date
        return (b.bumpedAt?.getTime() || b.createdAt?.getTime() || 0) - (a.bumpedAt?.getTime() || a.createdAt?.getTime() || 0);
      });
      
    return posts.map(post => {
      const author = this.users.get(post.authorId);
      if (author) {
        const { password, ...authorWithoutPassword } = author;
        return {
          ...post,
          author: authorWithoutPassword
        };
      }
      return {
        ...post,
        author: undefined
      };
    });
  }

  async getPostsByCategory(categoryId: string): Promise<(Post & { author?: Omit<User, 'password'> })[]> {
    // First get all posts with authors using the working method
    const allPostsWithAuthors = await this.getPostsWithAuthors();
    
    // Then filter by category and sort
    return allPostsWithAuthors
      .filter(post => post.categoryId === categoryId)
      .sort((a, b) => {
        // First sort by pinned status (pinned posts first)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then sort by bump/creation date
        return (b.bumpedAt?.getTime() || b.createdAt?.getTime() || 0) - (a.bumpedAt?.getTime() || a.createdAt?.getTime() || 0);
      });
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => {
        // First sort by pinned status (pinned posts first)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then sort by bump/creation date
        return (b.bumpedAt?.getTime() || b.createdAt?.getTime() || 0) - (a.bumpedAt?.getTime() || a.createdAt?.getTime() || 0);
      });
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(post: InsertPost, authorId: string): Promise<Post> {
    const id = randomUUID();
    const newPost: Post = {
      ...post,
      id,
      authorId,
      location: post.location || null,
      price: post.price || null,
      contactInfo: post.contactInfo || null,
      images: post.images || null,
      willingToTravel: post.willingToTravel || false,
      willingToShip: post.willingToShip || false,
      willingToTrade: post.willingToTrade || false,
      views: 0,
      isActive: true,
      isPinned: false,
      pinnedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      bumpedAt: new Date(),
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async updatePostContent(id: string, updates: UpdatePost, authorId: string): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    if (post.authorId !== authorId) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async pinPost(id: string): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      isPinned: true,
      pinnedAt: new Date(),
      updatedAt: new Date()
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async unpinPost(id: string): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      isPinned: false,
      pinnedAt: null,
      updatedAt: new Date()
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async togglePinPost(id: string): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      isPinned: !post.isPinned,
      pinnedAt: !post.isPinned ? new Date() : null,
      updatedAt: new Date()
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async incrementPostViews(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.posts.set(id, post);
    }
  }

  async getRepliesByPost(postId: string): Promise<Reply[]> {
    return Array.from(this.replies.values())
      .filter(reply => reply.postId === postId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createReply(reply: InsertReply, authorId: string): Promise<Reply> {
    const id = randomUUID();
    const newReply: Reply = {
      ...reply,
      id,
      authorId,
      createdAt: new Date(),
    };
    this.replies.set(id, newReply);
    return newReply;
  }

  async getStats(): Promise<{ totalMembers: number; activeListings: number; postsToday: number; }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalMembers = this.users.size;
    const activeListings = Array.from(this.posts.values()).filter(post => post.isActive).length;
    const postsToday = Array.from(this.posts.values()).filter(post => 
      post.createdAt && post.createdAt >= today
    ).length;

    return { totalMembers, activeListings, postsToday };
  }

  async getCategoryPostCounts(): Promise<{ categoryId: string; postCount: number }[]> {
    const postCountMap: { [categoryId: string]: number } = {};
    
    Array.from(this.posts.values())
      .filter(post => post.isActive)
      .forEach(post => {
        postCountMap[post.categoryId] = (postCountMap[post.categoryId] || 0) + 1;
      });

    return Object.entries(postCountMap).map(([categoryId, postCount]) => ({
      categoryId,
      postCount
    }));
  }

  async bumpPost(id: string, authorId: string): Promise<{ success: boolean; message: string; post?: Post }> {
    const post = this.posts.get(id);
    if (!post) {
      return { success: false, message: "Post not found" };
    }

    if (post.authorId !== authorId) {
      return { success: false, message: "You can only bump your own posts" };
    }

    const now = new Date();
    const lastBump = post.bumpedAt;
    
    if (lastBump) {
      const hoursSinceLastBump = (now.getTime() - lastBump.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastBump < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastBump);
        return { success: false, message: `You can bump this post again in ${hoursRemaining} hours` };
      }
    }

    post.bumpedAt = now;
    this.posts.set(id, post);
    
    return { success: true, message: "Post bumped successfully", post };
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async toggleUserSuspension(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.isSuspended = !user.isSuspended;
    this.users.set(userId, user);
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.users.delete(userId);
  }

  async deletePost(postId: string): Promise<boolean> {
    return this.posts.delete(postId);
  }

  async makeUserAdmin(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.isAdmin = true;
    this.users.set(userId, user);
    return user;
  }

  async toggleUserModerator(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.isModerator = !user.isModerator;
    this.users.set(userId, user);
    return user;
  }

  async updateUserUsername(userId: string, newUsername: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    // Check if username already exists (case-insensitive)
    const existingUser = Array.from(this.users.values()).find(u => 
      u.id !== userId && u.username.toLowerCase() === newUsername.toLowerCase()
    );
    
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    user.username = newUsername;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  async flagUserForUsernameChange(userId: string): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    
    user.requireUsernameChange = true;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  async clearUsernameChangeFlag(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.requireUsernameChange = false;
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async flagUserForPasswordReset(userId: string): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    
    user.requirePasswordReset = true;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  async clearPasswordResetFlag(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;
    
    user.requirePasswordReset = false;
    user.updatedAt = new Date();
    this.users.set(userId, user);
  }

  // Messaging stubs - not implemented in memory storage
  async getConversations(userId: string): Promise<any[]> {
    return [];
  }

  async getConversation(conversationId: string, userId: string): Promise<any> {
    return undefined;
  }

  async createConversation(conversation: any): Promise<any> {
    return { id: randomUUID(), ...conversation };
  }

  async getMessages(conversationId: string, userId: string): Promise<any[]> {
    return [];
  }

  async sendMessage(message: any, senderId: string): Promise<any> {
    return { id: randomUUID(), ...message, senderId };
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // stub
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return 0;
  }

  // User preferences stubs
  async getUserPreferences(userId: string): Promise<any> {
    return undefined;
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<any> {
    return { userId, ...preferences };
  }

  async updateUserProfile(userId: string, profile: any, hashedPassword?: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    Object.assign(user, profile);
    if (hashedPassword) user.password = hashedPassword;
    this.users.set(userId, user);
    return user;
  }

  // Advertisement methods
  async getAdvertisements(position?: string): Promise<Advertisement[]> {
    const ads = Array.from(this.advertisements.values()).filter(ad => ad.isActive);
    return position ? ads.filter(ad => ad.position === position) : ads;
  }

  async createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement> {
    const newAd: Advertisement = {
      id: randomUUID(),
      ...ad,
      size: ad.size || null,
      isActive: ad.isActive ?? true,
      imageUrl: ad.imageUrl ?? null,
      impressions: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      startDate: ad.startDate || null,
      endDate: ad.endDate || null,
      monthlyRate: ad.monthlyRate || null,
    };
    this.advertisements.set(newAd.id, newAd);
    return newAd;
  }

  async updateAdvertisement(id: string, updates: Partial<Advertisement>): Promise<Advertisement | undefined> {
    const ad = this.advertisements.get(id);
    if (!ad) return undefined;
    
    const updatedAd = { ...ad, ...updates, updatedAt: new Date() };
    this.advertisements.set(id, updatedAd);
    return updatedAd;
  }

  async incrementAdImpressions(id: string): Promise<void> {
    const ad = this.advertisements.get(id);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.advertisements.set(id, ad);
    }
  }

  async incrementAdClicks(id: string): Promise<void> {
    const ad = this.advertisements.get(id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.advertisements.set(id, ad);
    }
  }

  // Featured listing methods
  async getFeaturedListings(): Promise<(FeaturedListing & { post: Post })[]> {
    const listings = Array.from(this.featuredListings.values()).filter(listing => listing.isActive);
    return listings.map(listing => ({
      ...listing,
      post: this.posts.get(listing.postId)!
    })).filter(item => item.post);
  }

  async createFeaturedListing(listing: InsertFeaturedListing): Promise<FeaturedListing> {
    const newListing: FeaturedListing = {
      id: randomUUID(),
      ...listing,
      isActive: listing.isActive ?? true,
      createdAt: new Date(),
    };
    this.featuredListings.set(newListing.id, newListing);
    return newListing;
  }

  async getActiveFeaturedListings(): Promise<(FeaturedListing & { post: Post })[]> {
    const now = new Date();
    const listings = Array.from(this.featuredListings.values()).filter(listing => 
      listing.isActive && new Date(listing.featuredUntil) > now
    );
    return listings.map(listing => ({
      ...listing,
      post: this.posts.get(listing.postId)!
    })).filter(item => item.post);
  }

  // Password methods - stub implementations for MemStorage
  async addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
    // MemStorage doesn't persist password history
    return;
  }

  async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    // MemStorage always allows password changes
    return true;
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Verify current password
    if (!(await verifyPassword(currentPassword, user.password))) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Validate new password format
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return { success: false, message: passwordValidation.errors.join(", ") };
    }

    // Update password in memory
    const newPasswordHash = await hashPassword(newPassword);
    user.password = newPasswordHash;
    user.updatedAt = new Date();

    return { success: true, message: "Password changed successfully" };
  }
}

// Database storage implementation
import { db } from "./db";
import { eq, sql, and, or, desc, ilike, inArray } from "drizzle-orm";
import { categories, posts, replies, users, conversations, messages, userPreferences, advertisements, featuredListings, passwordHistory } from "@shared/schema";

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureCategoriesExist() {
    if (this.initialized) return;
    
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) {
      this.initialized = true;
      return;
    }

    const defaultCategories = [
      { id: randomUUID(), name: "Handguns", slug: "wts-handguns", type: "wts", description: "Handguns for sale", icon: "fas fa-handgun" },
      { id: randomUUID(), name: "Long Guns", slug: "wts-long-guns", type: "wts", description: "Rifles and shotguns for sale", icon: "fas fa-gun" },
      { id: randomUUID(), name: "Antique Firearms", slug: "wts-antique", type: "wts", description: "Antique firearms for sale", icon: "fas fa-history" },
      { id: randomUUID(), name: "Ammunition", slug: "wts-ammo", type: "wts", description: "Ammunition for sale", icon: "fas fa-circle" },
      { id: randomUUID(), name: "Parts & Accessories", slug: "wts-parts", type: "wts", description: "Parts and accessories for sale", icon: "fas fa-cog" },
      
      { id: randomUUID(), name: "Handguns", slug: "wtb-handguns", type: "wtb", description: "Looking for handguns", icon: "fas fa-handgun" },
      { id: randomUUID(), name: "Long Guns", slug: "wtb-long-guns", type: "wtb", description: "Looking for rifles and shotguns", icon: "fas fa-gun" },
      { id: randomUUID(), name: "Antique Firearms", slug: "wtb-antique", type: "wtb", description: "Looking for antique firearms", icon: "fas fa-history" },
      { id: randomUUID(), name: "Ammunition", slug: "wtb-ammo", type: "wtb", description: "Looking for ammunition", icon: "fas fa-circle" },
      { id: randomUUID(), name: "Parts & Accessories", slug: "wtb-parts", type: "wtb", description: "Looking for parts and accessories", icon: "fas fa-cog" },
      
      { id: randomUUID(), name: "General Discussion", slug: "general", type: "discussion", description: "General discussions", icon: "fas fa-comments" },
      { id: randomUUID(), name: "CA Gun Laws", slug: "ca-laws", type: "discussion", description: "California gun law discussions", icon: "fas fa-gavel" },
      { id: randomUUID(), name: "Reviews & Recommendations", slug: "reviews", type: "discussion", description: "Product reviews and recommendations", icon: "fas fa-star" },
      { id: randomUUID(), name: "Training & Safety", slug: "training", type: "discussion", description: "Training and safety discussions", icon: "fas fa-shield-alt" },
      { id: randomUUID(), name: "Off Topic", slug: "off-topic", type: "discussion", description: "Off topic discussions", icon: "fas fa-chat" },
    ];

    try {
      await db.insert(categories).values(defaultCategories).execute();
      this.initialized = true;
    } catch (error) {
      // Categories might already exist
      this.initialized = true;
    }
  }
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(ilike(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        dateOfBirth: new Date(insertUser.dateOfBirth),
        location: insertUser.location || null,
        isVerified: false,
        isAdmin: false,
        isSuspended: false,
        createdAt: new Date()
      })
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    try {
      await this.ensureCategoriesExist();
      return await db.select().from(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async getPosts(): Promise<Post[]> {
    try {
      return await db.select().from(posts).orderBy(sql`${posts.bumpedAt} DESC NULLS LAST, ${posts.createdAt} DESC`);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  async getPostsWithAuthors(): Promise<(Post & { author?: Omit<User, 'password'> })[]> {
    try {
      const allPosts = await this.getPosts();
      const postsWithAuthors = [];
      
      for (const post of allPosts) {
        const [author] = await db.select().from(users).where(eq(users.id, post.authorId));
        if (author) {
          const { password, ...authorWithoutPassword } = author;
          postsWithAuthors.push({
            ...post,
            author: authorWithoutPassword
          });
        } else {
          postsWithAuthors.push({
            ...post,
            author: undefined
          });
        }
      }
      
      return postsWithAuthors;
    } catch (error) {
      console.error('Error fetching posts with authors:', error);
      return [];
    }
  }

  async getPostsByCategory(categoryId: string): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.categoryId, categoryId))
      .orderBy(sql`${posts.bumpedAt} DESC NULLS LAST, ${posts.createdAt} DESC`);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(sql`${posts.bumpedAt} DESC NULLS LAST, ${posts.createdAt} DESC`);
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(post: InsertPost, authorId: string): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values({
        ...post,
        authorId,
        location: post.location || null,
        price: post.price || null,
        contactInfo: post.contactInfo || null,
        images: post.images || null,
        willingToTravel: post.willingToTravel || false,
        willingToShip: post.willingToShip || false,
        willingToTrade: post.willingToTrade || false,
        views: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        bumpedAt: new Date(),
      })
      .returning();
    return newPost;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async updatePostContent(id: string, updates: UpdatePost, authorId: string): Promise<Post | undefined> {
    // First verify the post exists and the user owns it
    const [existingPost] = await db.select().from(posts).where(eq(posts.id, id));
    if (!existingPost) return undefined;
    if (existingPost.authorId !== authorId) return undefined;

    const [updatedPost] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async pinPost(id: string): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set({ 
        isPinned: true,
        pinnedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async unpinPost(id: string): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set({ 
        isPinned: false,
        pinnedAt: null,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async togglePinPost(id: string): Promise<Post | undefined> {
    // First get the current post to check if it's pinned
    const [currentPost] = await db.select().from(posts).where(eq(posts.id, id));
    if (!currentPost) return undefined;

    const [updatedPost] = await db
      .update(posts)
      .set({ 
        isPinned: !currentPost.isPinned,
        pinnedAt: !currentPost.isPinned ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async incrementPostViews(id: string): Promise<void> {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id));
  }

  async bumpPost(id: string, authorId: string): Promise<{ success: boolean; message: string; post?: Post }> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) {
      return { success: false, message: "Post not found" };
    }

    if (post.authorId !== authorId) {
      return { success: false, message: "You can only bump your own posts" };
    }

    const now = new Date();
    const lastBump = post.bumpedAt;
    
    if (lastBump) {
      const hoursSinceLastBump = (now.getTime() - lastBump.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastBump < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastBump);
        return { success: false, message: `You can bump this post again in ${hoursRemaining} hours` };
      }
    }

    const [updatedPost] = await db
      .update(posts)
      .set({ bumpedAt: now })
      .where(eq(posts.id, id))
      .returning();
    
    return { success: true, message: "Post bumped successfully", post: updatedPost };
  }

  async getRepliesByPost(postId: string): Promise<Reply[]> {
    const allReplies = await db.select().from(replies)
      .where(eq(replies.postId, postId))
      .orderBy(replies.createdAt);
    
    // Add author information to each reply
    const repliesWithAuthors = [];
    for (const reply of allReplies) {
      const [author] = await db.select().from(users).where(eq(users.id, reply.authorId));
      if (author) {
        const { password, ...authorWithoutPassword } = author;
        repliesWithAuthors.push({
          ...reply,
          author: authorWithoutPassword
        });
      } else {
        repliesWithAuthors.push({
          ...reply,
          author: undefined
        });
      }
    }
    
    return repliesWithAuthors as Reply[];
  }

  async searchPosts(query: string): Promise<any[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const searchResults = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        price: posts.price,
        images: posts.images,
        location: posts.location,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        isActive: posts.isActive,
        isPinned: posts.isPinned,
        bumpedAt: posts.bumpedAt,
        username: users.username,
        views: posts.views
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(
        and(
          eq(posts.isActive, true),
          or(
            sql`LOWER(${posts.title}) LIKE ${searchTerm}`,
            sql`LOWER(${posts.content}) LIKE ${searchTerm}`,
            sql`LOWER(${posts.location}) LIKE ${searchTerm}`
          )
        )
      )
      .orderBy(desc(posts.bumpedAt), desc(posts.createdAt));

    return searchResults;
  }

  async searchUsers(query: string): Promise<any[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const searchResults = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        location: users.location,
        bio: users.bio,
        profilePicture: users.profilePicture,
        createdAt: users.createdAt,
        isVerified: users.isVerified
      })
      .from(users)
      .where(
        and(
          eq(users.isSuspended, false),
          or(
            sql`LOWER(${users.username}) LIKE ${searchTerm}`,
            sql`LOWER(${users.firstName}) LIKE ${searchTerm}`,
            sql`LOWER(${users.lastName}) LIKE ${searchTerm}`,
            sql`LOWER(${users.location}) LIKE ${searchTerm}`
          )
        )
      )
      .orderBy(users.username);

    return searchResults;
  }

  async createReply(reply: InsertReply, authorId: string): Promise<Reply> {
    const [newReply] = await db
      .insert(replies)
      .values({
        ...reply,
        authorId,
        createdAt: new Date(),
      })
      .returning();
    return newReply;
  }

  async getStats(): Promise<{ totalMembers: number; activeListings: number; postsToday: number; }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [totalMembersResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [activeListingsResult] = await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.isActive, true));
      const [postsTodayResult] = await db.select({ count: sql<number>`count(*)` }).from(posts).where(sql`${posts.createdAt} >= ${today}`);

      return {
        totalMembers: totalMembersResult?.count || 0,
        activeListings: activeListingsResult?.count || 0,
        postsToday: postsTodayResult?.count || 0
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalMembers: 0,
        activeListings: 0,
        postsToday: 0
      };
    }
  }

  async getCategoryPostCounts(): Promise<{ categoryId: string; postCount: number }[]> {
    try {
      const counts = await db
        .select({
          categoryId: posts.categoryId,
          postCount: sql<number>`count(*)`
        })
        .from(posts)
        .where(eq(posts.isActive, true))
        .groupBy(posts.categoryId);
      
      return counts;
    } catch (error) {
      console.error('Error fetching category post counts:', error);
      return [];
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async toggleUserSuspension(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ isSuspended: !user.isSuspended })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async deletePost(postId: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, postId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async makeUserAdmin(userId: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async toggleUserModerator(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ isModerator: !user.isModerator })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserUsername(userId: string, newUsername: string): Promise<User | undefined> {
    try {
      // Check if username already exists (case-insensitive)
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(
          eq(sql`lower(${users.username})`, newUsername.toLowerCase()),
          sql`${users.id} != ${userId}`
        ));
      
      if (existingUser) {
        throw new Error("Username already exists");
      }
      
      const [updatedUser] = await db
        .update(users)
        .set({ username: newUsername, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error updating username:", error);
      throw error;
    }
  }

  async flagUserForPasswordReset(userId: string): Promise<User | null> {
    try {
      const [user] = await db
        .update(users)
        .set({ requirePasswordReset: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return user || null;
    } catch (error) {
      console.error("Error flagging user for password reset:", error);
      return null;
    }
  }

  async clearPasswordResetFlag(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({ requirePasswordReset: false, updatedAt: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error clearing password reset flag:", error);
    }
  }

  async flagUserForUsernameChange(userId: string): Promise<User | null> {
    try {
      const [user] = await db
        .update(users)
        .set({ requireUsernameChange: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return user || null;
    } catch (error) {
      console.error("Error flagging user for username change:", error);
      return null;
    }
  }

  async clearUsernameChangeFlag(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({ requireUsernameChange: false, updatedAt: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error clearing username change flag:", error);
    }
  }

  // Messaging methods
  async getConversations(userId: string): Promise<(Conversation & { otherUser: User; lastMessage?: Message; unreadCount: number })[]> {
    const userConversations = await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
      .orderBy(desc(conversations.lastMessageAt));

    const result = [];
    for (const conversation of userConversations) {
      const otherUserId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
      const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
      
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const [unreadResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversation.id),
            eq(messages.isRead, false),
            eq(messages.senderId, otherUserId)
          )
        );

      result.push({
        ...conversation,
        otherUser,
        lastMessage: lastMessage || undefined,
        unreadCount: unreadResult?.count || 0
      });
    }

    return result;
  }

  async getConversation(conversationId: string, userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.participant1Id, userId),
            eq(conversations.participant2Id, userId)
          )
        )
      );
    return conversation || undefined;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    // Check if conversation already exists between these participants
    const [existing] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participant1Id, conversation.participant1Id),
            eq(conversations.participant2Id, conversation.participant2Id)
          ),
          and(
            eq(conversations.participant1Id, conversation.participant2Id),
            eq(conversations.participant2Id, conversation.participant1Id)
          )
        )
      );

    if (existing) {
      return existing;
    }

    const [newConversation] = await db
      .insert(conversations)
      .values({
        ...conversation,
        createdAt: new Date(),
        lastMessageAt: new Date(),
      })
      .returning();
    return newConversation;
  }

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    // Verify user is part of this conversation
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async sendMessage(message: InsertMessage, senderId: string): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        senderId,
        createdAt: new Date(),
        isRead: false,
      })
      .returning();

    // Update conversation last message time
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false),
          sql`${messages.senderId} != ${userId}`
        )
      );
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false),
          sql`${messages.senderId} != ${userId}`
        )
      );
  }

  async deleteConversations(conversationIds: string[], userId: string): Promise<void> {
    // Verify user is part of all conversations
    const userConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          inArray(conversations.id, conversationIds),
          or(
            eq(conversations.participant1Id, userId),
            eq(conversations.participant2Id, userId)
          )
        )
      );

    const verifiedIds = userConversations.map(c => c.id);
    
    if (verifiedIds.length !== conversationIds.length) {
      throw new Error("Cannot delete conversations that don't belong to user");
    }

    // Delete messages first
    await db
      .delete(messages)
      .where(inArray(messages.conversationId, verifiedIds));

    // Then delete conversations
    await db
      .delete(conversations)
      .where(inArray(conversations.id, verifiedIds));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const userConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)));

    if (userConversations.length === 0) return 0;

    const conversationIds = userConversations.map(c => c.id);
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          inArray(messages.conversationId, conversationIds),
          eq(messages.isRead, false),
          sql`${messages.senderId} != ${userId}`
        )
      );

    return Number(result?.count) || 0;
  }

  // User preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    
    if (!preferences) {
      // Create default preferences
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          userId,
          emailNotifications: true,
          messageNotifications: true,
          marketingEmails: false,
          profileVisibility: "public",
          showEmail: false,
          showLocation: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newPreferences;
    }
    
    return preferences;
  }

  async updateUserPreferences(userId: string, preferences: UpdateUserPreferences): Promise<UserPreferences> {
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    if (!updatedPreferences) {
      // Create if doesn't exist
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          ...preferences,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newPreferences;
    }

    return updatedPreferences;
  }

  async updateUserProfile(userId: string, profile: UpdateUserProfile, hashedPassword?: string): Promise<User | undefined> {
    const updateData: any = {
      ...profile,
      updatedAt: new Date(),
    };

    // Remove password fields from update data
    delete updateData.currentPassword;
    delete updateData.newPassword;
    delete updateData.confirmPassword;

    if (hashedPassword) {
      updateData.password = hashedPassword;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return updatedUser || undefined;
  }

  // Advertisement methods
  async getAdvertisements(position?: string): Promise<Advertisement[]> {
    try {
      if (position) {
        return await db.select().from(advertisements).where(
          and(eq(advertisements.isActive, true), eq(advertisements.position, position))
        );
      }
      
      return await db.select().from(advertisements).where(eq(advertisements.isActive, true));
    } catch (error) {
      console.error(`Error fetching advertisements for position ${position}:`, error);
      return [];
    }
  }

  async createAdvertisement(ad: InsertAdvertisement): Promise<Advertisement> {
    const [newAd] = await db
      .insert(advertisements)
      .values({
        ...ad,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newAd;
  }

  async updateAdvertisement(id: string, updates: Partial<Advertisement>): Promise<Advertisement | undefined> {
    const [updatedAd] = await db
      .update(advertisements)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(advertisements.id, id))
      .returning();

    return updatedAd || undefined;
  }

  async incrementAdImpressions(id: string): Promise<void> {
    await db
      .update(advertisements)
      .set({
        impressions: sql`${advertisements.impressions} + 1`,
      })
      .where(eq(advertisements.id, id));
  }

  async incrementAdClicks(id: string): Promise<void> {
    await db
      .update(advertisements)
      .set({
        clicks: sql`${advertisements.clicks} + 1`,
      })
      .where(eq(advertisements.id, id));
  }

  // Featured listing methods
  async getFeaturedListings(): Promise<(FeaturedListing & { post: Post })[]> {
    const results = await db
      .select()
      .from(featuredListings)
      .leftJoin(posts, eq(featuredListings.postId, posts.id))
      .where(eq(featuredListings.isActive, true));

    return results.map(result => ({
      ...result.featured_listings,
      post: result.posts!
    }));
  }

  async createFeaturedListing(listing: InsertFeaturedListing): Promise<FeaturedListing> {
    const [newListing] = await db
      .insert(featuredListings)
      .values({
        ...listing,
        createdAt: new Date(),
      })
      .returning();
    return newListing;
  }

  async getActiveFeaturedListings(): Promise<(FeaturedListing & { post: Post })[]> {
    const results = await db
      .select()
      .from(featuredListings)
      .leftJoin(posts, eq(featuredListings.postId, posts.id))
      .where(
        and(
          eq(featuredListings.isActive, true),
          sql`${featuredListings.featuredUntil} > NOW()`
        )
      );

    return results.map(result => ({
      ...result.featured_listings,
      post: result.posts!
    }));
  }

  // Password history methods
  async addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
    // Add new password to history
    await db.insert(passwordHistory).values({
      userId,
      passwordHash,
    });

    // Keep only the last 4 passwords
    const allPasswords = await db
      .select()
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt));

    if (allPasswords.length > 4) {
      const toDelete = allPasswords.slice(4);
      await db
        .delete(passwordHistory)
        .where(inArray(passwordHistory.id, toDelete.map(p => p.id)));
    }
  }

  async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    const recentPasswords = await db
      .select({ passwordHash: passwordHistory.passwordHash })
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt))
      .limit(4);

    // Check if new password matches any of the last 4 passwords
    for (const record of recentPasswords) {
      if (await verifyPassword(newPassword, record.passwordHash)) {
        return false; // Password was used recently
      }
    }
    
    return true; // Password is new
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Verify current password - handle both hashed and plain text passwords
    let isCurrentPasswordValid = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Hashed password - use bcrypt
      isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    } else {
      // Plain text password (legacy) - direct comparison
      isCurrentPasswordValid = user.password === currentPassword;
    }

    if (!isCurrentPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Validate new password format
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return { success: false, message: passwordValidation.errors.join(", ") };
    }

    // Check password history
    const isPasswordNew = await this.checkPasswordHistory(userId, newPassword);
    if (!isPasswordNew) {
      return { success: false, message: "New password cannot be the same as any of your last 4 passwords" };
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ 
        password: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Add to password history
    await this.addPasswordToHistory(userId, newPasswordHash);

    return { success: true, message: "Password changed successfully" };
  }
}

export const storage = new DatabaseStorage();
