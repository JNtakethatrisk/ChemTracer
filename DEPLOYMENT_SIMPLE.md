# Simple Deployment Guide for ChemTracer

## Quick Deploy Options

### Option 1: Railway (Easiest)

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

### Option 2: Render (Alternative)

1. **Connect your GitHub repository to Render**
2. **Create a Web Service**
3. **Set environment variables:**
   - `DATABASE_URL` (get from Neon, Supabase, or Railway)
   - `NODE_ENV=production`
4. **Build Command:** `npm run build`
5. **Start Command:** `npm start`

### Option 3: Heroku (Classic)

1. **Install Heroku CLI**
2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```
3. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
4. **Deploy:**
   ```bash
   git push heroku main
   ```

## Database Setup

You need a PostgreSQL database. Get one from:
- **Neon** (Free): https://neon.tech
- **Supabase** (Free): https://supabase.com  
- **Railway** (Free): https://railway.app

## Environment Variables

Set these in your deployment platform:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

## After Deployment

Run this command to set up your database tables:
```bash
npm run db:push
```

## Recommended: Railway + Neon

This is the easiest combination:
1. **Railway**: For hosting your app
2. **Neon**: For your PostgreSQL database (free tier)

## Troubleshooting

- **Database Connection**: Make sure `DATABASE_URL` is correct
- **Build Failures**: Check that all dependencies are installed
- **Static Files**: Ensure the client builds to `client/dist/`

Your app will be available at the URL provided by your hosting platform!
