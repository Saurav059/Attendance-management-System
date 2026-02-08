# Supabase Migration Guide

> [!IMPORTANT]
> **Migration Status**: Prisma schema has been updated for Supabase compatibility ✅

## Prerequisites Completed

- ✅ Prisma schema updated with `directUrl` support for connection pooling
- ✅ PostgreSQL provider configured
- ✅ Environment template created (`.env.supabase.example`)

## Step 1: Get Supabase Database Credentials

Visit your Supabase project dashboard at: https://dzoywdlhzkonywtynbrf.supabase.co

### Database Connection Strings

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **Database** tab
3. Scroll to **Connection string** section
4. You'll need TWO connection strings:

   **For DATABASE_URL (Pooler - Transaction mode):**
   - Select "URI" format
   - Mode: "Transaction" (recommended for Prisma)
   - Copy the connection string (looks like: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`)
   - Replace `[YOUR-PASSWORD]` with your actual database password

   **For DIRECT_URL (Direct connection):**
   - Select "URI" format  
   - Mode: "Session" or use the direct connection
   - Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
   - Replace `[YOUR-PASSWORD]` with your actual database password

### API Keys

1. Go to **Project Settings** → **API** tab
2. Copy these keys:
   - **anon / public key** (for NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (for SUPABASE_SERVICE_ROLE_KEY) - Click "Reveal" to see it

### Your Supabase Project URL

Your project URL is: `https://dzoywdlhzkonywtynbrf.supabase.co`

## Step 2: Update .env File

Once you have the credentials, update your `.env` file with:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://dzoywdlhzkonywtynbrf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Step 3: Update Your .env File

Replace the contents of your `.env` file with the values from `.env.supabase.example`, filling in:
- Your Supabase database password
- Your Supabase anon key
- Your Supabase service role key

You can also copy the example file:
```bash
cp .env.supabase.example .env
```

Then edit `.env` and replace all placeholder values.

## Step 4: Push Schema to Supabase

Once your `.env` file is configured with Supabase credentials, run:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Supabase (creates tables)
npx prisma db push

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

## Step 5: Verify Connection

Test the connection by starting your development server:

```bash
npm run dev
```

## What Changed for Supabase Compatibility

### Prisma Schema Updates
- ✅ Added `directUrl` to datasource configuration
- ✅ Configured for PostgreSQL (Supabase uses PostgreSQL)
- ✅ Connection pooling support via `pgbouncer=true` parameter

### Environment Variables
- ✅ `DATABASE_URL`: Pooled connection for queries (Transaction mode)
- ✅ `DIRECT_URL`: Direct connection for migrations (Session mode)
- ✅ Supabase API keys for additional features

### Key Differences from Render
- **Connection Pooling**: Supabase uses PgBouncer for connection pooling
- **Two URLs**: Separate URLs for queries (pooled) and migrations (direct)
- **Additional Features**: Access to Supabase Auth, Storage, and Realtime APIs

## Troubleshooting

### "Can't reach database server"
- Verify your database password is correct
- Check that you're using the correct region in the connection string
- Ensure your IP is not blocked (Supabase allows all IPs by default)

### "Error: P1001: Can't reach database"
- Make sure you're using the `DIRECT_URL` for migrations
- Verify the connection string format is correct

### Migration Issues
- Use `npx prisma db push` instead of `npx prisma migrate dev` for Supabase
- The `directUrl` is required for migrations to work properly

**Need help? Check the Supabase documentation: https://supabase.com/docs/guides/database/connecting-to-postgres**

