import { db } from "./db";
import { categories, users } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

async function seedCategories() {
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
    
    { id: randomUUID(), name: "Handguns", slug: "wtt-handguns", type: "wtt", description: "Want to trade handguns", icon: "fas fa-handgun" },
    { id: randomUUID(), name: "Long Guns", slug: "wtt-long-guns", type: "wtt", description: "Want to trade rifles and shotguns", icon: "fas fa-gun" },
    { id: randomUUID(), name: "Antique Firearms", slug: "wtt-antique", type: "wtt", description: "Want to trade antique firearms", icon: "fas fa-history" },
    { id: randomUUID(), name: "Ammunition", slug: "wtt-ammo", type: "wtt", description: "Want to trade ammunition", icon: "fas fa-circle" },
    { id: randomUUID(), name: "Parts & Accessories", slug: "wtt-parts", type: "wtt", description: "Want to trade parts and accessories", icon: "fas fa-cog" },
    
    { id: randomUUID(), name: "General Discussion", slug: "general", type: "discussion", description: "General discussions", icon: "fas fa-comments" },
    { id: randomUUID(), name: "CA Gun Laws", slug: "ca-laws", type: "discussion", description: "California gun law discussions", icon: "fas fa-gavel" },
    { id: randomUUID(), name: "Reviews & Recommendations", slug: "reviews", type: "discussion", description: "Product reviews and recommendations", icon: "fas fa-star" },
    { id: randomUUID(), name: "Training & Safety", slug: "training", type: "discussion", description: "Training and safety discussions", icon: "fas fa-shield-alt" },
    { id: randomUUID(), name: "Off Topic", slug: "off-topic", type: "discussion", description: "Off topic discussions", icon: "fas fa-chat" },
  ];

  try {
    await db.insert(categories).values(defaultCategories).execute();
    console.log("Successfully seeded categories");
  } catch (error) {
    console.log("Categories may already exist, skipping seed");
  }
}

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminUser = {
      id: randomUUID(),
      username: "admin",
      email: "admin@cagunexchange.com",
      password: hashedPassword,
      dateOfBirth: new Date("1990-01-01"),
      firstName: "Site",
      lastName: "Administrator",
      location: "California",
      bio: "Site Administrator",
      isVerified: true,
      isAdmin: true,
      isSuspended: false,
      profilePicture: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(users).values(adminUser).execute();
    console.log("Successfully created admin user:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Please change the password after first login!");
  } catch (error) {
    console.log("Admin user may already exist, skipping creation");
  }
}

async function seedDatabase() {
  await seedCategories();
  await createAdminUser();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { seedCategories, createAdminUser, seedDatabase };