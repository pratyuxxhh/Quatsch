# Authentication Setup Guide

This guide will help you set up the session-based authentication with email OTP verification.

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Email (AUTOMATED - No Manual Setup Needed!)

**Easy Setup (Recommended):**
```bash
cd backend
python setup_email.py
```
Just enter your Gmail address and App Password when prompted. The `.env` file will be created automatically!

**Manual Setup (Alternative):**
1. Create a `.env` file in the `backend` directory
2. Add your email configuration:
   ```
   EMAIL_ADDRESS=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   SECRET_KEY=your-secret-key-here
   ```

**To get your Gmail App Password:**
1. **Enable 2-Step Verification** on your Google Account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Quatsch" as the name
   - Copy the generated 16-character password

### 3. Start the Backend Server

```bash
cd backend
python app/main.py
```

The server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies (if not already done)

```bash
cd frontend
npm install
```

### 2. Start the Frontend Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## How It Works

1. **User enters email** → Backend generates 6-digit OTP
2. **OTP is sent via email** → User receives email with OTP
3. **User enters OTP** → Backend verifies OTP
4. **Session is created** → User is authenticated and can access protected routes

## Protected Routes

The following routes require authentication:
- `/dashboard`
- `/analysis`
- `/compare`

Public routes:
- `/` (Home)
- `/about`
- `/login`

## API Endpoints

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `GET /api/auth/check-session` - Check if user is authenticated
- `POST /api/auth/logout` - Logout and clear session

## Troubleshooting

### Email not sending?
- Check that `.env` file exists in the `backend` directory
- Verify EMAIL_ADDRESS and EMAIL_PASSWORD in `.env` file are correct
- Make sure you're using an App Password, not your regular Gmail password
- Check that 2-Step Verification is enabled on your Google Account
- Run `python setup_email.py` again to reconfigure if needed

### CORS errors?
- Make sure the backend is running on port 5000
- Check that the frontend URL matches the CORS configuration in `backend/app/main.py`

### Session not persisting?
- Make sure cookies are enabled in your browser
- Check that the backend session storage directory exists and is writable

