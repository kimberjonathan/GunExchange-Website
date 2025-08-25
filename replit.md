# CA Gun Exchange Forum

## Overview
The CA Gun Exchange Forum is a California-focused online marketplace and discussion platform for firearms. Its primary purpose is to facilitate the legal buying, selling, and trading of firearms and related accessories, strictly adhering to California's FFL (Federal Firearms License) dealer compliance laws. The platform aims to provide a safe, regulated environment for gun enthusiasts within California, alongside general discussion forums.

## User Preferences
- Forum-based design with multiple categories
- Age verification required for account creation
- Clear separation between buying/selling and general discussion
- California-focused user base
- Emphasis on legal compliance (FFL dealers)

## System Architecture
The project utilizes a modern web stack designed for scalability and maintainability.
- **Frontend**: Developed with React and TypeScript, using Wouter for routing and TanStack Query for data fetching. Styling is handled by Tailwind CSS and shadcn/ui components. Forms are managed with React Hook Form and Zod validation.
- **Backend**: Built with Express.js and TypeScript, providing a RESTful API.
- **Database**: PostgreSQL is used as the relational database, managed via Drizzle ORM for schema management.
- **Authentication**: A custom user authentication system is implemented, including role-based access control for admin and moderator functionalities.
- **UI/UX Decisions**: The interface features responsive design, dark/light theme support, and a clear, forum-centric layout. Key UI elements include threaded replies, user profiles, and an admin dashboard for moderation.

Core features include:
- **Marketplace**: Dedicated categories for "Want To Sell (WTS)", "Want To Buy (WTB)", and "Want To Trade (WTT)" across various firearm types, ammunition, parts, and accessories.
- **Discussion Forum**: Separate areas for general discussions not related to transactions.
- **User Management**: Account creation with age verification, user profiles, posting history, private messaging, and comprehensive moderator/admin tools for user and content management.
- **Content Management**: Features for creating, viewing, and managing forum posts/listings, including image uploads, a 24-hour bump system, and view tracking.
- **Moderation System**: A robust admin and moderator portal with capabilities for user suspension, post deletion, content flagging, post pinning, and password management. Moderator controls are integrated directly into forum pages for efficiency.

## Recent Changes
- **Enhanced Marketplace Tiles with Subcategory Navigation** (Aug 22, 2025): Redesigned home page marketplace section with enhanced tiles showing subcategory links and real-time post counts. Each marketplace tile (WTS, WTB, WTT) now displays individual links for Handguns, Long Guns, Antiques, Ammunition, and Parts & Accessories with current post counts. Added new API endpoint for category post counts and created MarketplaceTile component with color-coded design (green for WTS, blue for WTB, orange for WTT).
- **Complete Delivery Options** (Aug 22, 2025): Added comprehensive delivery options for Want To Sell/Buy/Trade posts including "Willing to Travel" (green badge), "Willing to Ship" (blue badge), and "Willing to Trade" (orange badge) checkboxes. These badges are displayed on both post cards and detail views, appearing only in marketplace categories. Full functionality available in both create and edit post forms.
- **Username Display Fix** (Aug 22, 2025): Resolved issue where category pages showed "Unknown User" instead of actual usernames by fixing backend API endpoint to include author data.
- **Pin/Unpin System** (Aug 21, 2025): Implemented comprehensive post pinning functionality with moderator controls and consistent toggle behavior across all forum sections.

## External Dependencies
- **Replit Object Storage**: Utilized for storing image uploads associated with posts and user profiles, with defined ACL policies for public and private content.