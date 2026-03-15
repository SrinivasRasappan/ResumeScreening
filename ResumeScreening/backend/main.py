import io

import pdfplumber
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents import ResumeScreeningAgent
from config.settings import settings

app = FastAPI(
    title="Resume Screening API",
    description="AI-powered resume screening with Claude Opus",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = ResumeScreeningAgent()


class ScreenRequest(BaseModel):
    resume_text: str
    job_description: str


@app.get("/")
def root():
    return {"message": "Resume Screening API", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy", "model": "claude-opus-4-6"}


@app.post("/screen")
def screen_resume(request: ScreenRequest):
    """Screen a resume (plain text) against a job description."""
    try:
        result = agent.screen(request.resume_text, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/screen/upload")
async def screen_resume_upload(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...),
):
    """Screen an uploaded resume file (PDF or TXT) against a job description."""
    try:
        content = await resume_file.read()

        filename = resume_file.filename or ""
        if filename.lower().endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                resume_text = "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
        else:
            resume_text = content.decode("utf-8", errors="replace")

        if not resume_text.strip():
            raise HTTPException(
                status_code=400, detail="Could not extract text from the uploaded file."
            )

        result = agent.screen(resume_text, job_description)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
