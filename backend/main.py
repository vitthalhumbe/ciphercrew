from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os, json, re, random

# --- Database Setup (SQLAlchemy) ---
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session

SQLALCHEMY_DATABASE_URL = "sqlite:///./dropwatch.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBStudent(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    roll = Column(String, unique=True, index=True)
    password = Column(String) # Simple plaintext for hackathon MVP
    branch = Column(String)
    year = Column(Integer)

class DBReflection(Base):
    __tablename__ = "reflections"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"))
    date = Column(Date)
    attended = Column(Integer)
    total_classes = Column(Integer)
    confidence = Column(Integer)
    struggled_topic = Column(String)

Base.metadata.create_all(bind=engine)

# --- Dependency to get DB session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- App & AI Setup ---
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# --- Risk Algorithm (Updated for Daily Data) ---
def compute_risk(reflections: list) -> dict:
    if not reflections:
        return {"score": 0.5, "level": "unknown", "trend": "stable"}

    # Sort by date and take the last 5 days to determine immediate risk
    reflections.sort(key=lambda x: x.date)
    recent = reflections[-5:] if len(reflections) >= 5 else reflections

    att_ratios = [r.attended / max(1, r.total_classes) for r in recent]
    conf_scores = [r.confidence / 5.0 for r in recent]

    avg_att = sum(att_ratios) / len(att_ratios)
    avg_conf = sum(conf_scores) / len(conf_scores)

    # Trend calculation comparing the first half of the window to the second half
    trend = "stable"
    if len(recent) >= 4:
        early_att = sum(att_ratios[:2]) / 2
        late_att = sum(att_ratios[-2:]) / 2
        early_conf = sum(conf_scores[:2]) / 2
        late_conf = sum(conf_scores[-2:]) / 2

        if late_att < early_att and late_conf < early_conf:
            trend = "declining"
        elif late_att > early_att and late_conf > early_conf:
            trend = "improving"

    # Base risk (inverted: lower attendance/confidence = higher risk)
    risk = 1.0 - (avg_att * 0.6 + avg_conf * 0.4)
    
    # Apply trend multipliers
    if trend == "declining": risk = min(1.0, risk + 0.15)
    elif trend == "improving": risk = max(0.0, risk - 0.1)

    level = "high" if risk > 0.65 else "medium" if risk > 0.35 else "low"
    return {"score": round(risk, 2), "level": level, "trend": trend}

# --- Auto-Seeding Dummy Data ---
def seed_database():
    db = SessionLocal()
    if db.query(DBStudent).first():
        db.close()
        return # Already seeded

    print("🌱 Seeding database with 15 days of daily dummy data...")
    
    students_data = [
        {"id": "S001", "name": "Aarav Sharma", "roll": "22CS001", "branch": "CS", "profile": "declining"},
        {"id": "S002", "name": "Priya Patil", "roll": "22CS002", "branch": "IT", "profile": "stable_good"},
        {"id": "S003", "name": "Rohan Kulkarni", "roll": "22ME001", "branch": "ME", "profile": "chronically_low"},
        {"id": "S004", "name": "Sneha Desai", "roll": "22CS003", "branch": "CS", "profile": "improving"},
        {"id": "S005", "name": "Vikram Joshi", "roll": "22ME002", "branch": "ME", "profile": "stable_average"},
        {"id": "S006", "name": "Ananya Nair", "roll": "22CS004", "branch": "CS", "profile": "stable_good"},
        {"id": "S007", "name": "Karan Mehta", "roll": "22IT001", "branch": "IT", "profile": "declining_fast"},
        {"id": "S008", "name": "Divya Reddy", "roll": "22IT002", "branch": "IT", "profile": "stable_good"},
    ]

    topics = ["Pointers", "Dynamic Programming", "Thermodynamics", "Database Normalization", "Graph Theory", "Fluid Mechanics", "Time Complexity", "Nothing major", "All clear"]
    
    today = datetime.now().date()
    
    for s_info in students_data:
        # Create student (password is just 'pass123' for hackathon)
        student = DBStudent(id=s_info["id"], name=s_info["name"], roll=s_info["roll"], branch=s_info["branch"], year=2, password="pass123")
        db.add(student)
        
        # Generate 15 days of historical data
        profile = s_info["profile"]
        for i in range(15, 0, -1):
            day_date = today - timedelta(days=i)
            # Base values
            total = 6
            att = 5
            conf = 4
            topic = random.choice(topics[-2:]) # default happy topics
            
            # Apply profile logic to simulate realistic trends over time
            progress = (15 - i) / 15.0 # 0.0 to 1.0 representing time passed
            
            if profile == "declining":
                att = max(1, int(6 - (progress * 4))) # Starts 6, ends ~2
                conf = max(1, int(5 - (progress * 3))) # Starts 5, ends ~2
                if progress > 0.5: topic = "Pointers are making no sense"
            elif profile == "declining_fast":
                att = max(0, int(5 - (progress * 5))) 
                conf = max(1, int(4 - (progress * 4)))
                if progress > 0.3: topic = "Completely lost in all subjects"
            elif profile == "improving":
                att = min(6, int(2 + (progress * 4))) # Starts 2, ends 6
                conf = min(5, int(1 + (progress * 4))) # Starts 1, ends 5
                if progress < 0.5: topic = "Graph algorithms are tough"
            elif profile == "chronically_low":
                att = random.choice([1, 2, 3])
                conf = random.choice([1, 2])
                topic = "Thermodynamics"
            elif profile == "stable_average":
                att = random.choice([3, 4, 5])
                conf = 3
                topic = random.choice(topics[:4])
            
            ref = DBReflection(student_id=student.id, date=day_date, attended=att, total_classes=total, confidence=conf, struggled_topic=topic)
            db.add(ref)
            
    db.commit()
    db.close()
    print("✅ Database successfully seeded.")

# Run seeder on startup
seed_database()

# --- Pydantic Models ---
class LoginRequest(BaseModel):
    roll: str
    password: str

class ReflectionSubmit(BaseModel):
    student_id: str
    attended: int
    total_classes: int
    confidence: int
    struggled_topic: str

# --- Routes ---
@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    student = db.query(DBStudent).filter(DBStudent.roll == req.roll, DBStudent.password == req.password).first()
    if not student:
        raise HTTPException(status_code=401, detail="Invalid roll number or password")
    
    return {"id": student.id, "name": student.name, "roll": student.roll, "branch": student.branch}

@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(DBStudent).all()
    result = []
    for s in students:
        refs = db.query(DBReflection).filter(DBReflection.student_id == s.id).all()
        risk = compute_risk(refs)
        result.append({
            "id": s.id, "name": s.name, "roll": s.roll, "branch": s.branch,
            "responses_count": len(refs),
            "last_submitted": str(refs[-1].date) if refs else None,
            "risk": risk
        })
    return result

@app.get("/student/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DBStudent).filter(DBStudent.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    refs = db.query(DBReflection).filter(DBReflection.student_id == student_id).order_by(DBReflection.date).all()
    risk = compute_risk(refs)
    
    return {
        "id": student.id, "name": student.name, "roll": student.roll, "branch": student.branch, "year": student.year,
        "responses": [{"date": str(r.date), "attended": r.attended, "total_classes": r.total_classes, "confidence": r.confidence, "struggled_topic": r.struggled_topic} for r in refs],
        "risk": risk
    }

@app.post("/reflect")
def submit_reflection(req: ReflectionSubmit, db: Session = Depends(get_db)):
    today = datetime.now().date()
    
    # Check if already submitted today (Optional: remove this if you want to allow multiple test submissions per day)
    existing = db.query(DBReflection).filter(DBReflection.student_id == req.student_id, DBReflection.date == today).first()
    if existing:
        return {"message": "Already checked in today!", "risk": compute_risk(db.query(DBReflection).filter(DBReflection.student_id == req.student_id).all())}

    new_ref = DBReflection(
        student_id=req.student_id,
        date=today,
        attended=req.attended,
        total_classes=req.total_classes,
        confidence=req.confidence,
        struggled_topic=req.struggled_topic
    )
    db.add(new_ref)
    db.commit()
    
    all_refs = db.query(DBReflection).filter(DBReflection.student_id == req.student_id).all()
    return {"message": "Reflection saved", "risk": compute_risk(all_refs)}

@app.post("/analyze/{student_id}")
async def analyze_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(DBStudent).filter(DBStudent.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    refs = db.query(DBReflection).filter(DBReflection.student_id == student_id).order_by(DBReflection.date.desc()).limit(10).all() # Send last 10 days to AI
    refs.reverse()
    risk = compute_risk(refs)

    summary = "\n".join([
        f"Date {r.date}: Attended {r.attended}/{r.total_classes}, Confidence {r.confidence}/5, Struggled with: {r.struggled_topic}"
        for r in refs
    ])

    prompt = f"""You are an academic counselor AI analyzing a student's daily dropout risk.

Student: {student.name}, {student.branch} Year {student.year}
Risk Score: {risk['score']} ({risk['level']} risk), Trend: {risk['trend']}

Recent DAILY reflection data:
{summary}

Respond ONLY in this JSON format, no markdown:
{{
  "root_causes": ["cause 1", "cause 2", "cause 3"],
  "warning_signs": ["sign 1", "sign 2"],
  "recommended_interventions": ["action 1", "action 2", "action 3"],
  "counselor_note": "A 2-3 sentence personal note to the academic counselor about this student's recent daily trends."
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        print(f"Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI analysis")

@app.get("/batch/summary")
def batch_summary(db: Session = Depends(get_db)):
    students = db.query(DBStudent).all()
    all_students_data = []
    all_topics = []

    for s in students:
        refs = db.query(DBReflection).filter(DBReflection.student_id == s.id).all()
        risk = compute_risk(refs)
        all_students_data.append({"id": s.id, "risk": risk})
        
        # Gather recent topics for word cloud/common struggles
        recent_refs = refs[-5:] if len(refs) >= 5 else refs
        for r in recent_refs:
            if r.struggled_topic.lower() not in ["nothing", "all clear", "nothing major", "all good now"]:
                all_topics.append(r.struggled_topic)

    high_risk = [s for s in all_students_data if s["risk"]["level"] == "high"]
    medium_risk = [s for s in all_students_data if s["risk"]["level"] == "medium"]
    low_risk = [s for s in all_students_data if s["risk"]["level"] == "low"]

    return {
        "total": len(students),
        "high_risk_count": len(high_risk),
        "medium_risk_count": len(medium_risk),
        "low_risk_count": len(low_risk),
        "avg_risk": round(sum(s["risk"]["score"] for s in all_students_data) / len(all_students_data), 2) if all_students_data else 0,
        "common_struggle_topics": list(set(all_topics))[-8:], # Top 8 unique recent struggles
    }