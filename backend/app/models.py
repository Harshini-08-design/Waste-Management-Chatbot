from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password = Column(String)


class OTP(Base):
    __tablename__ = "otp"

    id = Column(Integer, primary_key=True)
    username = Column(String)
    otp = Column(String)


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question = Column(Text)
    answer = Column(Text)