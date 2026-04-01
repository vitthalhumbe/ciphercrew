from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import json, os, re
from dotenv import load_dotenv
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


load_dotenv()
# --- Configure Gemini ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

# --- Knowledge Graph ---
# Each concept: { prereq: parent concept or None }
KNOWLEDGE_GRAPH = {
    "Sets":            {"prereq": None,          "order": 0},
    "Relations":       {"prereq": "Sets",         "order": 1},
    "Functions":       {"prereq": "Relations",    "order": 2},
    "Limits":          {"prereq": "Functions",    "order": 3},
    "Continuity":      {"prereq": "Limits",       "order": 4},
    "Derivatives":     {"prereq": "Continuity",   "order": 5},
    "Applications":    {"prereq": "Derivatives",  "order": 6},
    "Integration":     {"prereq": "Derivatives",  "order": 7},
    "Definite Integrals": {"prereq": "Integration", "order": 8},
}

# In-memory session store: { session_id: { concept: score } }
sessions = {}

def get_session(session_id: str):
    if session_id not in sessions:
        sessions[session_id] = {c: 0.5 for c in KNOWLEDGE_GRAPH}
    return sessions[session_id]

def get_weakest_concept(scores: dict) -> str:
    return min(scores, key=lambda c: scores[c])

def get_prereq(concept: str) -> str | None:
    return KNOWLEDGE_GRAPH[concept]["prereq"]

def update_score(scores: dict, concept: str, correct: bool):
    delta = 0.2 if correct else -0.25
    scores[concept] = max(0.0, min(1.0, scores[concept] + delta))

# --- Models ---
class StartRequest(BaseModel):
    session_id: str

class AnswerRequest(BaseModel):
    session_id: str
    concept: str
    correct: bool

# --- Routes ---

@app.get("/graph")
def get_graph():
    return {
        "concepts": [
            {"id": c, "prereq": KNOWLEDGE_GRAPH[c]["prereq"], "order": KNOWLEDGE_GRAPH[c]["order"]}
            for c in KNOWLEDGE_GRAPH
        ]
    }

@app.post("/session/start")
def start_session(req: StartRequest):
    scores = get_session(req.session_id)
    return {"session_id": req.session_id, "scores": scores}

@app.get("/session/{session_id}/scores")
def get_scores(session_id: str):
    return {"scores": get_session(session_id)}

@app.post("/question")
async def get_question(req: StartRequest):
    scores = get_session(req.session_id)
    concept = get_weakest_concept(scores)
    return await generate_question(concept)

@app.get("/question/{concept}")
async def get_question_for_concept(concept: str):
    if concept not in KNOWLEDGE_GRAPH:
        return {"error": "Unknown concept"}
    return await generate_question(concept)

async def generate_question(concept: str):
    prompt = f"""Generate a multiple choice question about "{concept}" for a JEE Maths student.
Return ONLY valid JSON in this exact format, nothing else:
{{
  "concept": "{concept}",
  "question": "the question text here",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correct_index": 0,
  "explanation": "brief explanation of the answer"
}}
correct_index is 0-based index of the correct option."""

    response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    raw = response.text.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    data = json.loads(raw)
    return data

@app.post("/answer")
def submit_answer(req: AnswerRequest):
    scores = get_session(req.session_id)
    update_score(scores, req.concept, req.correct)

    # if wrong, backtrack to prereq
    next_concept = req.concept
    if not req.correct:
        prereq = get_prereq(req.concept)
        if prereq:
            next_concept = prereq

    return {
        "scores": scores,
        "next_concept": next_concept,
        "message": "Good job!" if req.correct else f"Let's revisit: {next_concept}"
    }

@app.get("/")
def root():
    return {"status": "Adaptive Learn API running"}