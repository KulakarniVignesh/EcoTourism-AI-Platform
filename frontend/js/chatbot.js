document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Chatbot loaded');

    // 1. Inject Chatbot HTML globally if it doesn't exist
    if (!document.getElementById('chat-container')) {
        const chatbotHTML = `
            <div id="chat-container" class="hidden">
                <div id="chat-header">
                    <span>EcoTour AI Assistant</span>
                    <button id="chat-close">✕</button>
                </div>
                <div id="chat-box"></div>
                <form id="chat-form">
                    <input type="text" id="chat-input" placeholder="Type a message..." required autocomplete="off" />
                    <button type="submit">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
            <div id="chat-toggle">💬</div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatContainer = document.getElementById('chat-container');
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    if (!chatToggle || !chatClose || !chatContainer || !chatForm || !chatInput || !chatBox) {
        console.error('❌ Chatbot: Required elements not found. Check your HTML IDs.');
        return;
    }

    // Toggle Chatbot
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    // Close Chatbot
    chatClose.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // Initial greeting (only once)
    const greeting = document.createElement('div');
    greeting.className = 'bot-msg';
    greeting.innerText = 'Hello! I am your EcoTour Assistant. How can I help you today? 🌿';
    chatBox.appendChild(greeting);

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        console.log(`📩 User Message: "${message}"`);

        // Display user message
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'user-msg';
        userMsgDiv.innerText = message;
        chatBox.appendChild(userMsgDiv);
        
        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Display loading state (Typing...)
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.className = 'bot-msg';
        loadingDiv.innerHTML = '<span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span>';
        chatBox.appendChild(loadingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            console.log(`📤 Sending message: "${message}"`);
            const response = await fetch('http://localhost:5000/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors',
                cache: 'no-cache',
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            console.log('📥 Received response:', data);
            
            // Remove loading indicator
            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();

            if (response.ok) {
                const botMsgDiv = document.createElement('div');
                botMsgDiv.className = 'bot-msg';
                botMsgDiv.innerText = data.reply;
                chatBox.appendChild(botMsgDiv);
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'bot-msg';
                errorDiv.innerText = data.reply || 'Sorry, I encountered an error.';
                chatBox.appendChild(errorDiv);
            }
        } catch (err) {
            console.error('❌ Network Error:', err);
            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bot-msg';
            errorDiv.innerText = `Server connection failed: ${err.message}. Please ensure the backend is running at http://localhost:5000.`;
            chatBox.appendChild(errorDiv);
        }

        chatBox.scrollTop = chatBox.scrollHeight;
    });
});