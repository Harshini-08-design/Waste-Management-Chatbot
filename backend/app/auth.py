from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import random
import smtplib
from email.mime.text import MIMEText

from app.db import SessionLocal
from app.models import User, OTP

router = APIRouter()

# --- 1. Security Configuration ---
# CryptContext handles the internal passlib bugs on Windows more gracefully.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔹 DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 📩 Send Email (SMTP_SSL - Port 465 for better stability)
def send_email(email, otp):
    sender = "vaishujyodevi@gmail.com"
    password = "yvodgxvdggtcevug" # Ensure this is a fresh App Password

    msg = MIMEText(f"Your OTP for EcoGuide is: {otp}")
    msg["Subject"] = "EcoGuide OTP Verification"
    msg["From"] = f"EcoGuide Support <{sender}>"
    msg["To"] = email

    try:
        # Port 465 with SMTP_SSL is generally more reliable for Gmail scripts
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(sender, password)
        server.send_message(msg)
        server.quit()
        print(f"✅ Mail Dispatched: OTP {otp} sent to {email}")
    except Exception as e:
        print(f"❌ SMTP Error: {e}")

# 🟢 Register
@router.post("/register")
def register(username: str, email: str, password: str, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()

    if existing:
        return {"error": "User already exists"}

    # 🛠️ Truncate to 72 bytes to avoid bcrypt ValueError on Windows
    safe_pwd = password[:72]
    hashed = pwd_context.hash(safe_pwd)

    user = User(username=username, email=email, password=hashed)
    db.add(user)
    db.commit()

    return {"msg": "User registered successfully"}

# 🟢 Login
@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=email).first()

    if user:
        # Cleanup old OTPs upon login attempt
        db.query(OTP).filter_by(username=user.username).delete()
        db.commit()

    if not user or not pwd_context.verify(password[:72], user.password):
        return {"error": "Invalid email or password"}

    return {"msg": "Login successful", "user_id": user.id}

# 🔢 Send OTP
@router.post("/send-otp")
def send_otp(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=username).first()

    if not user:
        return {"error": "User not found"}

    # Delete old OTP records
    db.query(OTP).filter_by(username=username).delete()
    db.commit()

    otp = str(random.randint(1000, 9999))
    db.add(OTP(username=username, otp=otp))
    db.commit()

    # Trigger Email
    send_email(user.email, otp)

    return {"msg": "OTP sent to email"}

# 🔢 Verify OTP
@router.post("/verify-otp")
def verify_otp(username: str, otp: str, db: Session = Depends(get_db)):
    record = db.query(OTP).filter_by(username=username, otp=otp).first()

    if not record:
        return {"error": "Invalid OTP"}

    db.delete(record)
    db.commit()

    return {"msg": "OTP verified successfully"}

# 🔁 Forgot Password
@router.post("/forgot-password")
def forgot_password(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=username).first()

    if not user:
        return {"error": "User not found"}

    db.query(OTP).filter_by(username=username).delete()
    db.commit()

    otp = str(random.randint(1000, 9999))
    db.add(OTP(username=username, otp=otp))
    db.commit()

    send_email(user.email, otp)

    return {"msg": "OTP sent to email"}

# 🔐 Reset Password
@router.post("/reset-password")
def reset_password(username: str, otp: str, new_password: str, db: Session = Depends(get_db)):
    record = db.query(OTP).filter_by(username=username, otp=otp).first()

    if not record:
        return {"error": "Invalid OTP"}

    user = db.query(User).filter_by(username=username).first()
    if not user:
        return {"error": "User not found"}

    # Update with hashed and truncated password
    user.password = pwd_context.hash(new_password[:72])
    
    db.delete(record)
    db.commit()

    return {"msg": "Password updated successfully"}