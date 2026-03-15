# AI Agent Project

A comprehensive AI Agent system that connects to OpenAI's GPT models with a Python backend and modern web client.

## 📋 Project Structure

```
ResumeScreening/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   └── gpt_agent.py          # GPT Agent implementation
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py            # Configuration management
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── .env.example              # Environment variables template
├── frontend/
│   ├── index.html                # Chat UI
│   ├── styles.css                # Styling
│   └── script.js                 # Client-side logic
└── README.md                     # This file
```

## 🚀 Features

- **GPT Agent**: Python-based agent that maintains conversation context
- **FastAPI Backend**: RESTful API for agent communication
- **Web Client**: Modern, responsive chat interface
- **Conversation History**: Track and review conversation history
- **System Prompts**: Guide agent behavior with custom system prompts
- **CORS Support**: Cross-origin requests from web client

## 📦 Prerequisites

- Python 3.8+
- OpenAI API Key
- Modern web browser

## 🔧 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a .env file from the template
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

### 2. Install Python Dependencies

```bash
# It's recommended to use a virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the Backend Server

```bash
python main.py
```

The server will start at `http://localhost:8000`

### 4. Open the Frontend

- Open `frontend/index.html` in your web browser, or
- Use a local server:

```bash
cd frontend
python -m http.server 3000
```

Then visit `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns API status and configured model.

### Chat
```
POST /chat
Content-Type: application/json

{
  "message": "Your message here",
  "system_prompt": "Optional system instruction"
}
```

### Reset Conversation
```
POST /reset
Content-Type: application/json

{
  "clear_history": true
}
```

### Get Conversation History
```
GET /history
```

## 🛠️ Configuration

Edit `backend/config/settings.py` to configure:

- **Model**: Change GPT model (default: gpt-3.5-turbo)
- **Temperature**: Adjust response creativity (0-2)
- **Server Host/Port**: Server configuration
- **CORS Origins**: Allowed frontend URLs

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_api_key_here
HOST=0.0.0.0
PORT=8000
DEBUG=True
CORS_ORIGINS=["http://localhost:3000", "http://localhost"]
```

## 💡 Usage Examples

### Using the Web Client
1. Enter optional system prompt (e.g., "You are a helpful assistant")
2. Type your message in the input field
3. Click "Send" or press Enter
4. View the agent's response
5. Use "Show History" to review the conversation
6. Use "Clear History" to start fresh

### Using the API with cURL

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Who are you?",
    "system_prompt": "You are a helpful assistant"
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/chat",
    json={
        "message": "What is machine learning?",
        "system_prompt": "You are an AI expert"
    }
)

print(response.json()["response"])
```

## 🧠 GPT Agent

The `GPTAgent` class provides:

- **Chat**: Send messages and get responses with context
- **Conversation History**: Automatic context management
- **System Prompts**: Guide agent behavior
- **Reset**: Clear history when needed

## 🐛 Troubleshooting

### API Connection Error
- Ensure backend is running on port 8000
- Check CORS settings in `backend/config/settings.py`
- Verify frontend URL is in `CORS_ORIGINS`

### Invalid API Key
- Verify `OPENAI_API_KEY` in `.env` is correct
- Get API key from https://platform.openai.com/api-keys

### CORS Errors
- Frontend URL must be in `CORS_ORIGINS` list
- Check browser console for specific origin
- Add it to settings and restart server

## 📚 Dependencies

### Backend
- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **openai**: OpenAI API client
- **pydantic**: Data validation
- **langchain**: AI framework (optional, for advanced features)

### Frontend
- Plain HTML5, CSS3, JavaScript (no dependencies)

## 🚀 Next Steps

1. Customize the `GPTAgent` with additional features
2. Add database integration for persistent storage
3. Implement user authentication
4. Add file upload/download capabilities
5. Deploy to cloud platform (AWS, Heroku, etc.)

## 📝 License

This project is provided as-is for educational purposes.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check OpenAI API status
4. Review browser console for errors

---

**Built with:** Python • FastAPI • OpenAI GPT • HTML5 • CSS3 • JavaScript
