from openai import OpenAI
from typing import Optional, List
from ..config.settings import settings


class GPTAgent:
    """AI Agent that connects to OpenAI GPT"""
    
    def __init__(self, model: str = "gpt-3.5-turbo", temperature: float = 0.7):
        """
        Initialize the GPT Agent
        
        Args:
            model: The model to use (gpt-3.5-turbo, gpt-4, etc.)
            temperature: Temperature for response generation (0-2)
        """
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = model
        self.temperature = temperature
        self.conversation_history: List[dict] = []
    
    def chat(self, user_message: str, system_prompt: Optional[str] = None) -> str:
        """
        Send a message to GPT and get a response
        
        Args:
            user_message: The user's message
            system_prompt: Optional system prompt for the agent
            
        Returns:
            The assistant's response
        """
        if system_prompt and not self.conversation_history:
            self.conversation_history.append({
                "role": "system",
                "content": system_prompt
            })
        
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.conversation_history,
            temperature=self.temperature
        )
        
        assistant_message = response.choices[0].message.content
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        return assistant_message
    
    def reset_conversation(self) -> None:
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_conversation_history(self) -> List[dict]:
        """Get the conversation history"""
        return self.conversation_history
