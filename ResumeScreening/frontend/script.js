// Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
    CHAT: `${API_BASE_URL}/chat`,
    RESET: `${API_BASE_URL}/reset`,
    HISTORY: `${API_BASE_URL}/history`,
    HEALTH: `${API_BASE_URL}/health`
};

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const systemPromptInput = document.getElementById('systemPrompt');
const statusIndicator = document.getElementById('status');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const closeBtn = document.querySelector('.close');

// State
let isLoading = false;
let systemPromptSet = false;

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
resetBtn.addEventListener('click', resetConversation);
showHistoryBtn.addEventListener('click', showConversationHistory);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isLoading) {
        sendMessage();
    }
});
closeBtn.addEventListener('click', () => {
    historyModal.classList.remove('open');
});
window.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        historyModal.classList.remove('open');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkApiHealth();
});

// Functions
async function checkApiHealth() {
    try {
        const response = await fetch(API_ENDPOINTS.HEALTH);
        if (response.ok) {
            const data = await response.json();
            updateStatus(`Ready - Model: ${data.model}`, 'ready');
        } else {
            updateStatus('API Not Available', 'error');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        updateStatus('API Not Available', 'error');
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    if (isLoading) {
        return;
    }

    // Mark that system prompt has been set (if any)
    if (systemPromptInput.value.trim() && !systemPromptSet) {
        systemPromptSet = true;
    }

    // Add user message to chat
    addMessageToChat(message, 'user');
    messageInput.value = '';

    isLoading = true;
    updateStatus('Thinking...', 'loading');
    sendBtn.disabled = true;

    try {
        const systemPrompt = systemPromptInput.value.trim() || null;

        const response = await fetch(API_ENDPOINTS.CHAT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                system_prompt: systemPrompt
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        addMessageToChat(data.response, 'assistant');
        updateStatus('Ready', 'ready');
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat(`Error: ${error.message}`, 'system');
        updateStatus('Error sending message', 'error');
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
    }
}

function addMessageToChat(message, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const messageP = document.createElement('p');
    messageP.textContent = message;

    messageDiv.appendChild(messageP);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateStatus(text, type = 'ready') {
    statusIndicator.textContent = text;
    statusIndicator.className = 'status ' + type;
}

async function resetConversation() {
    if (confirm('Are you sure you want to clear the conversation history?')) {
        try {
            const response = await fetch(API_ENDPOINTS.RESET, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clear_history: true
                })
            });

            if (response.ok) {
                chatMessages.innerHTML = '';
                addMessageToChat('Conversation cleared. Ready for a new chat!', 'system');
                systemPromptSet = false;
                updateStatus('Ready', 'ready');
            }
        } catch (error) {
            console.error('Error resetting conversation:', error);
            updateStatus('Error resetting conversation', 'error');
        }
    }
}

async function showConversationHistory() {
    try {
        const response = await fetch(API_ENDPOINTS.HISTORY);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const history = data.history;

        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p style="color: #999;">No messages in history yet.</p>';
        } else {
            history.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${item.role}`;

                const roleDiv = document.createElement('div');
                roleDiv.className = 'history-role';
                roleDiv.textContent = item.role.charAt(0).toUpperCase() + item.role.slice(1);

                const contentDiv = document.createElement('div');
                contentDiv.className = 'history-content';
                contentDiv.textContent = item.content;

                historyItem.appendChild(roleDiv);
                historyItem.appendChild(contentDiv);
                historyList.appendChild(historyItem);
            });
        }

        historyModal.classList.add('open');
    } catch (error) {
        console.error('Error fetching history:', error);
        updateStatus('Error fetching history', 'error');
    }
}
