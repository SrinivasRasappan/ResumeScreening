from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from agents import GPTAgent
from config.settings import settings

# Initialize FastAPI app
app = FastAPI(
    title="AI Agent API",
    description="FastAPI backend for AI Agent with GPT integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GPT Agent
agent = GPTAgent()


# Request/Response Models
class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str
    timestamp: str


class ResetRequest(BaseModel):
    """Request model for reset endpoint"""
    clear_history: bool = True


# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "Online",
        "message": "AI Agent API is running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api": "AI Agent API",
        "model": agent.model
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Send a message to the GPT Agent
    
    Args:
        request: ChatRequest with message and optional system_prompt
        
    Returns:
        ChatResponse with the assistant's response
    """
    try:
        response = agent.chat(
            user_message=request.message,
            system_prompt=request.system_prompt
        )
        
        from datetime import datetime
        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reset")
async def reset(request: ResetRequest):
    """
    Reset the agent's conversation history
    
    Args:
        request: ResetRequest with clear_history flag
        
    Returns:
        Confirmation message
    """
    if request.clear_history:
        agent.reset_conversation()
    
    return {"message": "Conversation history cleared"}


@app.get("/history")
async def get_history():
    """
    Get the conversation history
    
    Returns:
        List of conversation messages
    """
    return {
        "history": agent.get_conversation_history(),
        "message_count": len(agent.get_conversation_history())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
