import random
import string
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple

# In-memory storage for OTPs (use Redis or database in production)
otp_storage: Dict[str, Dict] = {}

# Email configuration - using Gmail SMTP
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.environ.get('EMAIL_ADDRESS', '')  # Your Gmail address
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')  # Your Gmail app password


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(email: str, otp: str) -> bool:
    """
    Send OTP via email using Gmail SMTP
    Returns True if successful, False otherwise
    """
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("⚠️ Warning: Email credentials not configured. Set EMAIL_ADDRESS and EMAIL_PASSWORD environment variables.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = email
        msg['Subject'] = 'Your OTP Verification Code - Quatsch'
        
        # Email body
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid #06b6d4;">
              <h2 style="color: #06b6d4; text-align: center;">OTP Verification</h2>
              <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
              <p style="font-size: 16px; line-height: 1.6;">Your One-Time Password (OTP) for Quatsch is:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #06b6d4; color: #000000; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                  {otp}
                </div>
              </div>
              <p style="font-size: 14px; color: #888888; line-height: 1.6;">This OTP will expire in 10 minutes.</p>
              <p style="font-size: 14px; color: #888888; line-height: 1.6;">If you didn't request this code, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
              <p style="font-size: 12px; color: #666666; text-align: center;">© 2025 Quatsch. All rights reserved.</p>
            </div>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP server and send
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False


def store_otp(email: str, otp: str) -> None:
    """Store OTP with expiration time (10 minutes)"""
    otp_storage[email] = {
        'otp': otp,
        'expires_at': datetime.now() + timedelta(minutes=10),
        'attempts': 0
    }


def verify_otp(email: str, otp: str) -> Tuple[bool, str]:
    """
    Verify OTP for given email
    Returns (is_valid, message)
    """
    if email not in otp_storage:
        return False, "OTP not found. Please request a new OTP."
    
    stored_data = otp_storage[email]
    
    # Check if expired
    if datetime.now() > stored_data['expires_at']:
        del otp_storage[email]
        return False, "OTP has expired. Please request a new OTP."
    
    # Check attempts (max 5 attempts)
    if stored_data['attempts'] >= 5:
        del otp_storage[email]
        return False, "Too many failed attempts. Please request a new OTP."
    
    # Verify OTP
    if stored_data['otp'] == otp:
        # Clean up on success
        del otp_storage[email]
        return True, "OTP verified successfully."
    else:
        stored_data['attempts'] += 1
        remaining = 5 - stored_data['attempts']
        return False, f"Invalid OTP. {remaining} attempts remaining."


def cleanup_expired_otps() -> None:
    """Remove expired OTPs from storage"""
    current_time = datetime.now()
    expired_emails = [
        email for email, data in otp_storage.items()
        if current_time > data['expires_at']
    ]
    for email in expired_emails:
        del otp_storage[email]

