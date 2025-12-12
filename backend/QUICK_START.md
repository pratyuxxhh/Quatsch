# Quick Start Guide - Authentication System

## ⚡ Fast Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Email (AUTOMATED!)

**Option 1: Use the setup script (Recommended):**
```bash
cd backend
python setup_email.py
```
Just enter your Gmail address and App Password when prompted. The script will create a `.env` file automatically!

**Option 2: Manual setup:**
1. Create a file named `.env` in the `backend` directory
2. Copy the content from `.env.example` and fill in your values:
   ```
   EMAIL_ADDRESS=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   SECRET_KEY=any-random-string-here
   ```

**To get your Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate an App Password for "Mail"
3. Copy the 16-character password

### Step 3: Start Backend
```bash
cd backend
python app/main.py
```
✅ Backend running on http://localhost:5000

### Step 5: Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

### Step 6: Test It!
1. Go to http://localhost:5173/login
2. Enter your email
3. Check your Gmail inbox for the OTP
4. Enter the OTP
5. You're logged in! 🎉

## 🔒 Protected Routes
- `/dashboard` - Requires login
- `/analysis` - Requires login  
- `/compare` - Requires login

## 📧 Email Not Working?
- Make sure you're using an **App Password**, not your regular Gmail password
- Check that 2-Step Verification is enabled on your Google Account
- Verify environment variables are set correctly

## 🐛 Troubleshooting
- **Backend won't start?** → Check if port 5000 is available
- **CORS errors?** → Make sure backend is running before frontend
- **OTP not received?** → Check spam folder, verify email config

