// This file MUST be located in your project root: GunExchange/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Import the official Tailwind CSS plugin
import path from "path";

export default defineConfig({
  // This correctly tells Vite that the "root" of the frontend
  // application is the 'client' folder.
  root: "client",

  // This allows Vite to access files outside the 'client' root,
  // like your 'shared' folder.
  server: {
    fs: {
      allow: [".."],
    },
  },

  // THIS IS THE FIX: We are now explicitly telling the tailwindcss plugin
  // the exact path to its configuration file. This path is relative
  // to the project root, where this vite.config.ts file lives.
  plugins: [
    react(),
    tailwindcss({
      config: path.resolve(__dirname, 'tailwind.config.js'),
    })
  ],
  
  // These aliases are correct.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
