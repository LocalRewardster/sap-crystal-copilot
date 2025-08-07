# Supabase Setup for Crystal Copilot

## 🚀 Quick Setup Guide

### 1. Create a Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up** or **Sign in** with GitHub
3. **Create a new project**:
   - Choose a name: `crystal-copilot`
   - Choose a region (closest to you)
   - Create a strong database password
4. **Wait for setup** (takes ~2 minutes)

### 2. Get Your Project Credentials

1. **Go to Settings** → **API**
2. **Copy these values**:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon public` key
   - `service_role` key (⚠️ Keep this secret!)

### 3. Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Create a new query**
3. **Copy and paste** the contents of `supabase_schema.sql`
4. **Run the query**

### 4. Configure Your Backend

1. **Copy your `.env.example` to `.env`**:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Update your `.env` file**:
   ```env
   # Database - Supabase
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   ```

3. **Replace the placeholders**:
   - `your-project-id` → Your actual project ID
   - `your-anon-key-here` → Your anon public key
   - `your-service-role-key-here` → Your service role key
   - `[password]` → Your database password

### 5. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 6. Test the Connection

```bash
cd backend
python -c "
from app.services.supabase_service import get_supabase_service
service = get_supabase_service()
print('✅ Supabase connected!' if service.is_available() else '❌ Connection failed')
"
```

## 🎯 Benefits of Using Supabase

### ✅ **What You Get:**

1. **🌐 Cloud Database** - No local setup needed
2. **🔄 Real-time Updates** - Live data synchronization
3. **📊 Built-in Dashboard** - View your data easily
4. **🔐 Row Level Security** - Built-in security features
5. **📈 Auto-scaling** - Handles growth automatically
6. **🆓 Free Tier** - 500MB database, 2GB bandwidth
7. **🔧 Easy Backups** - Automatic backups included

### 🔄 **Automatic Fallback:**

The system automatically chooses:
- **Supabase** if configured properly
- **SQLite** if Supabase is not available

## 🛠️ Advanced Configuration

### Custom Database Connection

If you want to use a custom PostgreSQL connection:

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Public API key | Yes |
| `SUPABASE_SERVICE_KEY` | Service role key (admin) | Yes |
| `DATABASE_URL` | Direct PostgreSQL connection | Optional |

## 🚨 Security Notes

1. **Never commit** your `service_role` key to Git
2. **Use environment variables** for all secrets
3. **Configure RLS policies** for production use
4. **Rotate keys regularly** in production

## 🐛 Troubleshooting

### Connection Issues
```bash
# Test your connection
curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/
```

### Database Access
- Check your **RLS policies** in Supabase dashboard
- Verify your **service role key** has proper permissions
- Ensure **database password** is correct

### Logs
Check your backend logs for detailed error messages:
```bash
cd backend
python main.py
```

## 📚 Next Steps

1. **✅ Set up Supabase** (this guide)
2. **🔄 Test the connection** 
3. **📊 Upload a report** to see it in your Supabase dashboard
4. **🎨 Customize the schema** if needed
5. **🚀 Deploy to production** with proper security