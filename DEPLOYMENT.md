# ChemTracer Deployment Guide

## Option 1: Vercel (Recommended)

### Prerequisites
1. **Database Setup**: You'll need a PostgreSQL database. Options:
   - **Neon** (Free tier): https://neon.tech
   - **Supabase** (Free tier): https://supabase.com
   - **Railway** (Free tier): https://railway.app

### Steps:

1. **Set up your database:**
   ```bash
   # Get your database URL (e.g., from Neon)
   # Format: postgresql://username:password@host:port/database
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI (if not already installed)
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project in Vercel dashboard
   - Go to Settings > Environment Variables
   - Add: `DATABASE_URL` = your PostgreSQL connection string

4. **Push Database Schema:**
   ```bash
   # After deployment, run this to set up your database tables
   npm run db:push
   ```

## Option 2: Railway (Alternative)

### Steps:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Database:**
   ```bash
   railway add postgresql
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set DATABASE_URL=$DATABASE_URL
   ```

## Option 3: Render (Alternative)

### Steps:

1. **Connect GitHub repository to Render**
2. **Create a Web Service**
3. **Set environment variables:**
   - `DATABASE_URL`
   - `NODE_ENV=production`
4. **Build Command:** `npm run build`
5. **Start Command:** `npm start`

## Environment Variables Needed:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

## Database Setup:

After deployment, run:
```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Important Notes:

1. **Database**: You need a PostgreSQL database. The app uses Drizzle ORM with PostgreSQL.

2. **Environment Variables**: Make sure to set `DATABASE_URL` in your deployment platform.

3. **Build Process**: The app builds both frontend (React/Vite) and backend (Express) automatically.

4. **Static Files**: The client builds to `client/dist/` and is served as static files.

5. **API Routes**: All `/api/*` routes are handled by the Express server.

## Troubleshooting:

- **Database Connection Issues**: Check your `DATABASE_URL` format
- **Build Failures**: Ensure all dependencies are in `package.json`
- **Static File Issues**: Check that `client/dist/` exists after build

## Recommended: Vercel + Neon

This combination works best:
- **Vercel**: For hosting the full-stack app
- **Neon**: For PostgreSQL database (free tier available)
