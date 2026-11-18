from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="standard_user", nullable=False) # super_admin, moderator, community_manager, standard_user
    is_active = Column(Boolean, default=True, nullable=False)
    preferred_language = Column(String(10), default="en") # en, ml
    default_lat = Column(Float, nullable=True)
    default_lon = Column(Float, nullable=True)
    default_city = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    saved_locations = relationship("SavedLocation", back_populates="user", cascade="all, delete-orphan")
    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    routines = relationship("DailyRoutine", back_populates="user", cascade="all, delete-orphan")
    room_assessments = relationship("RoomAssessment", back_populates="user", cascade="all, delete-orphan")
    impact_logs = relationship("ImpactLog", back_populates="user", cascade="all, delete-orphan")
    community_memberships = relationship("CommunityMember", back_populates="user", cascade="all, delete-orphan")
    challenge_participations = relationship("UserChallengeParticipation", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("AssistantConversation", back_populates="user", cascade="all, delete-orphan")
    notification_pref = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class SavedLocation(Base):
    __tablename__ = "saved_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="saved_locations")

class FamilyMember(Base):
    __tablename__ = "family_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    relation = Column(String(50), nullable=False) # self, child, elderly, spouse, parent, other
    age_group = Column(String(50), nullable=False) # infant, child, teen, adult, senior
    sensitivity_profile = Column(String(50), default="standard") # standard, respiratory_sensitive, cardiovascular_sensitive, outdoor_athlete, outdoor_worker, student
    activity_preferences = Column(Text, default="indoor_exercise,walking") # comma-separated
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="family_members")

class DailyRoutine(Base):
    __tablename__ = "daily_routines"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    commute_mode = Column(String(50), nullable=False) # car_petrol, car_diesel, two_wheeler, bus, metro, bicycle, walk
    daily_distance_km = Column(Float, default=10.0)
    schedule_type = Column(String(50), default="work_standard") # work_standard, college, flexible, night_shift
    alternatives_selected = Column(Text, nullable=True) # JSON of chosen alternatives
    estimated_daily_co2_kg = Column(Float, default=0.0)
    estimated_daily_pm25_g = Column(Float, default=0.0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="routines")

class RoomAssessment(Base):
    __tablename__ = "room_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_name = Column(String(100), nullable=False)
    room_size_sqft = Column(Float, default=150.0)
    occupants = Column(Integer, default=2)
    ventilation_type = Column(String(50), default="cross_windows") # cross_windows, single_window, sealed_ac, exhaust_only
    has_purifier = Column(Boolean, default=False)
    purifier_filter_type = Column(String(50), default="hepa_h13") # hepa_h13, basic, carbon, none
    filter_installed_date = Column(DateTime(timezone=True), nullable=True)
    cooking_smoke_exposure = Column(String(50), default="low") # high, moderate, low, none
    calculated_score = Column(Integer, default=70) # 0-100
    recommendations = Column(Text, nullable=True) # JSON list of tips
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    user = relationship("User", back_populates="room_assessments")

class Community(Base):
    __tablename__ = "communities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    city = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="neighborhood") # neighborhood, school_college, workplace, environmental_club
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    members = relationship("CommunityMember", back_populates="community", cascade="all, delete-orphan")
    reports = relationship("CommunityReport", back_populates="community")

class CommunityMember(Base):
    __tablename__ = "community_members"
    
    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="member") # admin, moderator, member
    total_points = Column(Integer, default=0)
    joined_at = Column(DateTime(timezone=True), default=utcnow)
    
    community = relationship("Community", back_populates="members")
    user = relationship("User", back_populates="community_memberships")

class CommunityChallenge(Base):
    __tablename__ = "community_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    challenge_type = Column(String(50), nullable=False) # no_car_week, clean_air_school, reduce_energy, sustainable_commute, zero_waste
    points_reward = Column(Integer, default=100)
    duration_days = Column(Integer, default=7)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    participations = relationship("UserChallengeParticipation", back_populates="challenge")

class UserChallengeParticipation(Base):
    __tablename__ = "user_challenge_participations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("community_challenges.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="joined") # joined, in_progress, completed
    progress_days = Column(Integer, default=0)
    self_reported_notes = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="challenge_participations")
    challenge = relationship("CommunityChallenge", back_populates="participations")

class CommunityReport(Base):
    __tablename__ = "community_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    community_id = Column(Integer, ForeignKey("communities.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    report_type = Column(String(50), nullable=False) # waste_burning, construction_dust, traffic_idling, industrial_emission, crop_burning, other
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), default="")
    status = Column(String(50), default="pending") # pending, reviewed, resolved, flagged_spam
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    community = relationship("Community", back_populates="reports")

class ImpactLog(Base):
    __tablename__ = "impact_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False) # public_transit_used, cycling_trip, walking_trip, carpooling, energy_saved, waste_segregated, no_waste_burning
    units_count = Column(Float, default=1.0) # km or kWh or events
    co2_saved_kg = Column(Float, default=0.0)
    pm25_avoided_g = Column(Float, default=0.0)
    fuel_saved_liters = Column(Float, default=0.0)
    money_saved_estimate = Column(Float, default=0.0)
    log_date = Column(Date, default=date.today)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="impact_logs")

class AssistantConversation(Base):
    __tablename__ = "assistant_conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), default="New Conversation")
    language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("AssistantMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AssistantMessage.created_at")

class AssistantMessage(Base):
    __tablename__ = "assistant_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("assistant_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    structured_data = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    conversation = relationship("AssistantConversation", back_populates="messages")

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    high_aqi_alert = Column(Boolean, default=True)
    aqi_threshold = Column(Integer, default=150)
    daily_morning_briefing = Column(Boolean, default=True)
    purifier_filter_reminders = Column(Boolean, default=True)
    community_challenge_reminders = Column(Boolean, default=True)
    quiet_hours_start = Column(String(10), default="22:00")
    quiet_hours_end = Column(String(10), default="07:00")
    preferred_channel = Column(String(20), default="in_app")
    
    user = relationship("User", back_populates="notification_pref")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)
