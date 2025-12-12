import os
import secrets

def setup_email_config():
    """Interactive script to set up email configuration"""
    print("=" * 50)
    print("Quatsch Email Configuration Setup")
    print("=" * 50)
    print()
    
    # Get email address
    email = input("Enter your Gmail address: ").strip()
    if not email:
        print("❌ Email address is required!")
        return
    
    # Get app password
    print()
    print("To get your Gmail App Password:")
    print("1. Go to: https://myaccount.google.com/apppasswords")
    print("2. Generate an App Password for 'Mail'")
    print("3. Copy the 16-character password")
    print()
    app_password = input("Enter your Gmail App Password (16 characters): ").strip()
    if not app_password:
        print("❌ App Password is required!")
        return
    
    # Generate secret key
    secret_key = secrets.token_urlsafe(32)
    
    # Create .env file
    env_content = f"""# Email Configuration (Gmail)
EMAIL_ADDRESS={email}
EMAIL_PASSWORD={app_password}
SECRET_KEY={secret_key}
"""
    
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    try:
        with open(env_path, 'w') as f:
            f.write(env_content)
        print()
        print("✅ Configuration saved successfully!")
        print(f"📁 Config file: {env_path}")
        print()
        print("You can now start the backend server with:")
        print("  python app/main.py")
        print()
        print("Note: The .env file is automatically loaded - no need to set environment variables manually!")
    except Exception as e:
        print(f"❌ Error saving configuration: {e}")

if __name__ == '__main__':
    setup_email_config()

