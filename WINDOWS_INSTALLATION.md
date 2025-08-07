# Windows Installation Guide for Crystal Copilot

## 🚨 **Windows-Specific Installation (No Compilation Issues)**

### **Quick Installation:**

1. **Pull the latest code:**
   ```batch
   git pull origin main
   ```

2. **Run the automated installer:**
   ```batch
   install-backend-windows.bat
   ```

### **Manual Installation (if needed):**

1. **Navigate to backend:**
   ```batch
   cd backend
   ```

2. **Upgrade pip:**
   ```batch
   python -m pip install --upgrade pip
   ```

3. **Install Windows-compatible requirements:**
   ```batch
   pip install -r requirements-windows-simple.txt
   ```

4. **Set up your .env file:**
   ```batch
   copy .env.example .env
   ```
   *(Your Supabase credentials are already in the .env.example)*

5. **Run the Supabase schema setup:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Open **SQL Editor**
   - Copy and paste the contents of `supabase_schema.sql`
   - **Run the query**

6. **Test the backend:**
   ```batch
   python main.py
   ```

## ✅ **What This Installation Includes:**

- **✅ FastAPI** - Web framework
- **✅ Supabase** - Cloud database (REST API only)
- **✅ OpenAI/Anthropic** - AI integrations
- **✅ All utilities** - File handling, logging, etc.

## ❌ **What We Skip (to avoid compilation):**

- **❌ PostgreSQL drivers** - Use Supabase REST API instead
- **❌ SQLAlchemy/Alembic** - Direct database access
- **❌ AsyncPG** - PostgreSQL async driver
- **❌ Complex monitoring** - OpenTelemetry (optional)

## 🎯 **Expected Results:**

After installation, you should see:

```
✅ Supabase connected successfully!
INFO:     Started server process [1234]
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

## 🐛 **Troubleshooting:**

### **If you still get compilation errors:**

1. **Try installing packages one by one:**
   ```batch
   pip install fastapi uvicorn pydantic
   pip install supabase
   pip install python-dotenv requests httpx
   ```

2. **Check your Python version:**
   ```batch
   python --version
   ```
   *(Should be Python 3.8+ but not 3.13 which has compatibility issues)*

3. **Use conda instead of pip:**
   ```batch
   conda install -c conda-forge fastapi uvicorn pydantic
   pip install supabase python-dotenv
   ```

### **If Supabase connection fails:**

1. **Check your .env file** has the correct credentials
2. **Test the connection manually:**
   ```batch
   python -c "
   import requests
   response = requests.get('https://rsfqitxywldiebcffvqq.supabase.co/rest/v1/', 
                          headers={'apikey': 'your-anon-key'})
   print('✅ Connected!' if response.status_code == 200 else '❌ Failed')
   "
   ```

### **If Crystal Reports service fails:**

1. **Make sure it's built:**
   ```batch
   cd crystal-service
   ..\build-crystal-webapi.bat
   ```

2. **Run it manually:**
   ```batch
   bin\Release\CrystalReportsService.exe
   ```

## 🚀 **Next Steps:**

1. **✅ Install backend** (this guide)
2. **✅ Start Crystal Reports service**
3. **✅ Start frontend** (`npm run dev`)
4. **✅ Upload a report** and test!

## 📞 **Need Help?**

If you're still having issues:

1. **Check the error message** - most are self-explanatory
2. **Try the manual installation** steps above
3. **Share the specific error** you're getting