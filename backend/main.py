from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from datetime import datetime
from dotenv import load_dotenv
import os, json, re, random

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# ─── In-memory store ────────────────────────────────────────────────
# students: { id: { name, roll, branch, year, responses: [...], risk_score } }
# responses: { week, attended, confidence, struggled_topic, ai_analysis }

STUDENTS = {
    "S001": {"name": "Aarav Sharma",    "roll": "22CS001", "branch": "CS",   "year": 2},
    "S002": {"name": "Priya Patil",     "roll": "22CS002", "branch": "CS",   "year": 2},
    "S003": {"name": "Rohan Kulkarni",  "roll": "22ME001", "branch": "ME",   "year": 2},
    "S004": {"name": "Sneha Desai",     "roll": "22CS003", "branch": "CS",   "year": 2},
    "S005": {"name": "Vikram Joshi",    "roll": "22ME002", "branch": "ME",   "year": 2},
    "S006": {"name": "Ananya Nair",     "roll": "22CS004", "branch": "CS",   "year": 2},
    "S007": {"name": "Karan Mehta",     "roll": "22IT001", "branch": "IT",   "year": 2},
    "S008": {"name": "Divya Reddy",     "roll": "22IT002", "branch": "IT",   "year": 2},
}

# Seed some historical data for demo
RESPONSES = {
    "S001": [
        {"week": 1, "attended": 5, "total_classes": 6, "confidence": 4, "struggled_topic": "Nothing major", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 5, "total_classes": 6, "confidence": 4, "struggled_topic": "Recursion a bit confusing", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 6, "total_classes": 6, "confidence": 5, "struggled_topic": "All clear", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 5, "total_classes": 6, "confidence": 4, "struggled_topic": "Trees traversal", "submitted_at": "2025-01-27"},
    ],
    "S002": [
        {"week": 1, "attended": 6, "total_classes": 6, "confidence": 5, "struggled_topic": "Nothing", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 4, "total_classes": 6, "confidence": 3, "struggled_topic": "Pointers very confusing", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 3, "total_classes": 6, "confidence": 2, "struggled_topic": "Dynamic memory allocation", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 2, "total_classes": 6, "confidence": 1, "struggled_topic": "Everything in DSA feels hard", "submitted_at": "2025-01-27"},
    ],
    "S003": [
        {"week": 1, "attended": 4, "total_classes": 6, "confidence": 3, "struggled_topic": "Thermodynamics basics", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 3, "total_classes": 6, "confidence": 2, "struggled_topic": "Heat transfer equations", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 2, "total_classes": 6, "confidence": 2, "struggled_topic": "Cannot follow lectures", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 1, "total_classes": 6, "confidence": 1, "struggled_topic": "Stopped attending, too lost", "submitted_at": "2025-01-27"},
    ],
    "S004": [
        {"week": 1, "attended": 6, "total_classes": 6, "confidence": 5, "struggled_topic": "Nothing", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 6, "total_classes": 6, "confidence": 5, "struggled_topic": "Nothing", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 5, "total_classes": 6, "confidence": 4, "struggled_topic": "Graph algorithms", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 6, "total_classes": 6, "confidence": 5, "struggled_topic": "All good now", "submitted_at": "2025-01-27"},
    ],
    "S005": [
        {"week": 1, "attended": 5, "total_classes": 6, "confidence": 3, "struggled_topic": "Fluid mechanics", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 4, "total_classes": 6, "confidence": 3, "struggled_topic": "Bernoulli equation", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 4, "total_classes": 6, "confidence": 3, "struggled_topic": "Still fluid mechanics", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 3, "total_classes": 6, "confidence": 2, "struggled_topic": "Falling behind in multiple subjects", "submitted_at": "2025-01-27"},
    ],
    "S006": [
        {"week": 1, "attended": 6, "total_classes": 6, "confidence": 5, "struggled_topic": "Nothing", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 6, "total_classes": 6, "confidence": 5, "struggled_topic": "Nothing", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 6, "total_classes": 6, "confidence": 4, "struggled_topic": "OS scheduling algorithms", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 5, "total_classes": 6, "confidence": 4, "struggled_topic": "Minor doubts only", "submitted_at": "2025-01-27"},
    ],
    "S007": [
        {"week": 1, "attended": 3, "total_classes": 6, "confidence": 2, "struggled_topic": "Almost everything", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 2, "total_classes": 6, "confidence": 2, "struggled_topic": "Database normalization", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 2, "total_classes": 6, "confidence": 1, "struggled_topic": "Gave up on DBMS", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 1, "total_classes": 6, "confidence": 1, "struggled_topic": "Not submitting assignments", "submitted_at": "2025-01-27"},
    ],
    "S008": [
        {"week": 1, "attended": 5, "total_classes": 6, "confidence": 4, "struggled_topic": "Nothing major", "submitted_at": "2025-01-06"},
        {"week": 2, "attended": 5, "total_classes": 6, "confidence": 4, "struggled_topic": "Network layers", "submitted_at": "2025-01-13"},
        {"week": 3, "attended": 4, "total_classes": 6, "confidence": 3, "struggled_topic": "TCP/IP protocols", "submitted_at": "2025-01-20"},
        {"week": 4, "attended": 4, "total_classes": 6, "confidence": 3, "struggled_topic": "Getting clearer now", "submitted_at": "2025-01-27"},
    ],
}

def compute_risk(responses: list) -> dict:
    if not responses:
        return {"score": 0.5, "level": "unknown", "trend": "stable"}

    recent = responses[-3:] if len(responses) >= 3 else responses

    # attendance ratio trend
    att_ratios = [r["attended"] / r["total_classes"] for r in recent]
    conf_scores = [r["confidence"] / 5.0 for r in recent]

    avg_att = sum(att_ratios) / len(att_ratios)
    avg_conf = sum(conf_scores) / len(conf_scores)

    # trend: is it getting worse?
    trend = "stable"
    if len(att_ratios) >= 2:
        if att_ratios[-1] < att_ratios[0] and conf_scores[-1] < conf_scores[0]:
            trend = "declining"
        elif att_ratios[-1] > att_ratios[0] and conf_scores[-1] > conf_scores[0]:
            trend = "improving"

    # risk score 0-1 (higher = more at risk)
    risk = 1.0 - (avg_att * 0.6 + avg_conf * 0.4)
    if trend == "declining":
        risk = min(1.0, risk + 0.15)
    elif trend == "improving":
        risk = max(0.0, risk - 0.1)

    level = "high" if risk > 0.65 else "medium" if risk > 0.35 else "low"
    return {"score": round(risk, 2), "level": level, "trend": trend}

# ─── Models ─────────────────────────────────────────────────────────
class ReflectionSubmit(BaseModel):
    student_id: str
    attended: int
    total_classes: int
    confidence: int       # 1-5
    struggled_topic: str

class AIAnalysisRequest(BaseModel):
    student_id: str

# ─── Routes ─────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "DropWatch API running"}

@app.get("/students")
def get_students():
    result = []
    for sid, info in STUDENTS.items():
        responses = RESPONSES.get(sid, [])
        risk = compute_risk(responses)
        result.append({
            "id": sid,
            **info,
            "responses_count": len(responses),
            "last_submitted": responses[-1]["submitted_at"] if responses else None,
            "risk": risk,
        })
    return result

@app.get("/student/{student_id}")
def get_student(student_id: str):
    if student_id not in STUDENTS:
        return {"error": "Student not found"}
    info = STUDENTS[student_id]
    responses = RESPONSES.get(student_id, [])
    risk = compute_risk(responses)
    return {
        "id": student_id,
        **info,
        "responses": responses,
        "risk": risk,
    }

@app.post("/reflect")
def submit_reflection(req: ReflectionSubmit):
    if req.student_id not in STUDENTS:
        return {"error": "Student not found"}
    if req.student_id not in RESPONSES:
        RESPONSES[req.student_id] = []
    week = len(RESPONSES[req.student_id]) + 1
    entry = {
        "week": week,
        "attended": req.attended,
        "total_classes": req.total_classes,
        "confidence": req.confidence,
        "struggled_topic": req.struggled_topic,
        "submitted_at": datetime.now().strftime("%Y-%m-%d"),
    }
    RESPONSES[req.student_id].append(entry)
    risk = compute_risk(RESPONSES[req.student_id])
    return {"message": "Reflection saved", "risk": risk}

@app.post("/analyze/{student_id}")
async def analyze_student(student_id: str):
    if student_id not in STUDENTS:
        return {"error": "Student not found"}
    info = STUDENTS[student_id]
    responses = RESPONSES.get(student_id, [])
    risk = compute_risk(responses)

    summary = "\n".join([
        f"Week {r['week']}: Attended {r['attended']}/{r['total_classes']}, Confidence {r['confidence']}/5, Struggled with: {r['struggled_topic']}"
        for r in responses
    ])

    prompt = f"""You are an academic counselor AI analyzing a student's dropout risk.

Student: {info['name']}, {info['branch']} Year {info['year']}
Risk Score: {risk['score']} ({risk['level']} risk), Trend: {risk['trend']}

Weekly reflection data:
{summary}

Respond ONLY in this JSON format, no markdown:
{{
  "root_causes": ["cause 1", "cause 2", "cause 3"],
  "warning_signs": ["sign 1", "sign 2"],
  "recommended_interventions": ["action 1", "action 2", "action 3"],
  "counselor_note": "A 2-3 sentence personal note to the academic counselor about this student."
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)

@app.get("/batch/summary")
def batch_summary():
    all_students = []
    for sid, info in STUDENTS.items():
        responses = RESPONSES.get(sid, [])
        risk = compute_risk(responses)
        all_students.append({"id": sid, **info, "risk": risk})

    high_risk = [s for s in all_students if s["risk"]["level"] == "high"]
    medium_risk = [s for s in all_students if s["risk"]["level"] == "medium"]
    low_risk = [s for s in all_students if s["risk"]["level"] == "low"]

    # common struggled topics
    all_topics = []
    for responses in RESPONSES.values():
        for r in responses:
            if r["struggled_topic"].lower() not in ["nothing", "all clear", "nothing major", "all good now"]:
                all_topics.append(r["struggled_topic"])

    return {
        "total": len(STUDENTS),
        "high_risk_count": len(high_risk),
        "medium_risk_count": len(medium_risk),
        "low_risk_count": len(low_risk),
        "high_risk_students": high_risk,
        "avg_risk": round(sum(s["risk"]["score"] for s in all_students) / len(all_students), 2),
        "common_struggle_topics": all_topics[-10:],
    }