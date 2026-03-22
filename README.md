# BackIt — Crowdfunding Platform

A full-stack crowdfunding platform built with **Next.js**, **MongoDB**, and **React**. Creators can launch campaigns, and backers can pledge to support projects they believe in.

## Features

- **User Authentication** — JWT-based auth with httpOnly cookies, bcrypt password hashing
- **Campaign Management** — Create, edit, delete campaigns with categories and deadlines
- **Pledging** — Back campaigns with any amount, real-time progress tracking
- **Dashboard** — View your campaigns, stats, funding charts, and recent backers
- **Creator Profiles** — Public profiles with follow/unfollow functionality
- **Explore** — Search, filter by category, and sort campaigns

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Next.js (App Router), Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Charts | Recharts |
| Icons | Lucide React |

## Getting Started

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd crowdfunding
   npm install
   ```

2. **Set up environment:**
   Create `.env.local` with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=crowdfunding
   JWT_SECRET=your_64_character_random_secret
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── api/                 # API routes
│   ├── auth/            # Login, register, logout, me
│   ├── campaigns/       # CRUD operations
│   ├── dashboard/       # Aggregated stats
│   ├── followers/       # Follow/unfollow
│   ├── pledges/         # Create & list pledges
│   └── profile/         # User profiles
├── components/          # Reusable UI components
├── lib/                 # Database & shared helpers
├── models/              # Mongoose schemas
└── [pages]/             # App pages (home, explore, create, etc.)
```
