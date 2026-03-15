import json
import random
from typing import Any

import anthropic

from config.settings import settings


class ResumeScreeningAgent:
    def __init__(self):
        self.dry_run = settings.dry_run
        self.model = "claude-opus-4-6"

        if not self.dry_run:
            self.client = anthropic.Anthropic()
        else:
            self.client = None

    def _dry_run_response(self, resume_text: str, job_description: str) -> dict[str, Any]:
        # Simple deterministic stub response for UI testing without an API key.
        base = {
            "match_percentage": 65,
            "matched_requirements": ["Communication", "Teamwork"],
            "missing_requirements": ["Cloud Infrastructure", "Kubernetes"],
            "strengths": [
                "Clear, concise writing",
                "Relevant experience in related domains",
            ],
            "concerns": [
                "Limited hands-on experience with the exact tech stack",
            ],
            "recommendation": "REVIEW",
            "recommendation_reason": "The candidate shows relevant skills but is missing key technical requirements.",
            "ai_generated": False,
            "ai_confidence": 25,
            "ai_indicators": [],
            "overall_summary": "The candidate has strong communication and domain experience but may need support on core infrastructure technologies.",
        }

        if "senior" in job_description.lower():
            base["recommendation"] = "REVIEW"
            base["recommendation_reason"] = "Role requires senior-level experience; candidate appears to be mid-level."
            base["match_percentage"] = 55

        return base

    def screen(self, resume_text: str, job_description: str) -> dict:
        if self.dry_run:
            return self._dry_run_response(resume_text, job_description)

        system_prompt = """You are an expert HR recruiter and resume screening specialist with 15+ years of experience. Analyze resumes against job descriptions and return a structured evaluation.

Respond ONLY with a valid JSON object — no markdown, no extra text — containing exactly these fields:
{
  "match_percentage": <integer 0-100>,
  "matched_requirements": [<list of matched skills/requirements as strings>],
  "missing_requirements": [<list of missing skills/requirements as strings>],
  "strengths": [<list of candidate strengths as strings>],
  "concerns": [<list of concerns or weaknesses as strings>],
  "recommendation": <"APPROVE" | "REVIEW" | "REJECT">,
  "recommendation_reason": <string explaining the recommendation>,
  "ai_generated": <boolean>,
  "ai_confidence": <integer 0-100>,
  "ai_indicators": [<list of specific AI-generation indicators found, or []>],
  "overall_summary": <2-3 sentence summary of the candidate>
}

RECOMMENDATION RULES:
- APPROVE: match_percentage >= 75 and no critical missing requirements
- REVIEW: match_percentage 50-74, or has some gaps worth discussing
- REJECT: match_percentage < 50, or missing multiple critical requirements

AI GENERATION DETECTION — look for these indicators:
- Overly generic buzzword-heavy language without specific details
- Perfect prose with no personality, voice, or minor imperfections
- Achievements lacking concrete metrics, company context, or unique details
- Skills list suspiciously mirrors the job description keywords
- Uniform use of power verbs (leveraged, spearheaded, orchestrated, synergized)
- Unnaturally well-rounded profile covering every single listed requirement
- Absence of specific dates, company names, team sizes, project names
- Every bullet point follows identical length and grammatical structure
- No typos, no contractions, no informal language whatsoever
- Generic hobbies/interests that match a "model employee" profile"""

        user_message = f"""Screen this resume against the job description below.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}"""

        with self.client.messages.stream(
            model=self.model,
            max_tokens=4096,
            thinking={"type": "adaptive"},
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            final_message = stream.get_final_message()

        result_text = ""
        for block in final_message.content:
            if block.type == "text":
                result_text = block.text
                break

        # Strip markdown code fences if present
        result_text = result_text.strip()
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]

        return json.loads(result_text.strip())
