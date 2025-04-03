/**
 * This script adds the ARC Chatbot to any page that includes it
 * To use it, add this script to any page and the chatbot will be automatically loaded
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up chatbot...');
  
  // Create chatbot HTML
  const chatbotHTML = `
    <div id="arc-chatbot-container" class="arc-chatbot-container">
      <!-- Chat Button -->
      <button id="chat-button" class="chat-button" aria-label="Open chat assistant">
        <i class="fas fa-comment"></i>
      </button>
      
      <!-- Chat Window -->
      <div id="chat-window" class="chat-window">
        <div class="chat-header">
          <div class="chat-title">
            <img src="./assets/images/fevi-icon.png" alt="ARC Logo" class="chat-logo">
            <span>ARC Assistant</span>
          </div>
          <button id="close-chat" class="close-chat" aria-label="Close chat">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div id="chat-messages" class="chat-messages">
          <div class="message bot-message">
            <div class="message-content">
              Hello! I'm the ARC Assistant. How can I help you with information about The Accessibility Research Centre?
            </div>
          </div>
        </div>
        
        <div class="chat-input-container">
          <input type="text" id="chat-input" class="chat-input" placeholder="Type your question..." aria-label="Type your message">
          <button id="send-message" class="send-message" aria-label="Send message">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Create chatbot styles
  const chatbotStyles = `
    .arc-chatbot-container {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 1000;
      font-family: inherit;
    }
    
    .chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #0c4965;
      color: white;
      border: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1001;
    }
    
    .chat-button:hover {
      transform: scale(1.1);
    }
    
    /* Create a hover bridge between button and chat window */
    .chat-button::after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 20px;
      background-color: transparent;
    }
    
    /* Show chat window on hover with delay for closing */
    .arc-chatbot-container:hover .chat-window:not(.active) {
      display: flex;
      animation: slideIn 0.3s ease forwards;
    }
    
    .chat-window.active {
      display: flex;
    }
    
    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 450px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    /* Add a hover bridge from window to button */
    .chat-window::after {
      content: '';
      position: absolute;
      top: 100%;
      right: 30px;
      width: 80px;
      height: 20px;
      background-color: transparent;
    }
    
    /* Keep chat window visible with a delay when transitioning */
    .chat-window:hover,
    .chat-window:focus-within {
      display: flex;
    }
    
    /* Add a transition delay when hovering out */
    .arc-chatbot-container .chat-window:not(.active) {
      transition-delay: 0.2s;
    }
    
    .chat-header {
      background-color: #0c4965;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chat-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: bold;
    }
    
    .chat-logo {
      width: 24px;
      height: 24px;
    }
    
    .close-chat {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
    }
    
    .chat-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .message {
      max-width: 80%;
      padding: 10px 15px;
      border-radius: 15px;
      margin-bottom: 5px;
    }
    
    .bot-message {
      align-self: flex-start;
      background-color: #f1f1f1;
    }
    
    .user-message {
      align-self: flex-end;
      background-color: #0c4965;
      color: white;
    }
    
    .chat-input-container {
      display: flex;
      padding: 10px;
      border-top: 1px solid #e0e0e0;
    }
    
    .chat-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
    }
    
    .send-message {
      background: #0c4965;
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-left: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1003;
    }
    
    .send-message:hover {
      background: #0e5a7a;
      transform: scale(1.05);
    }
    
    .send-message i {
      display: block;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Typing indicator animation */
    .typing-indicator {
      background-color: #f1f1f1;
      padding: 10px 15px;
    }
    
    .typing-indicator .message-content {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .typing-indicator span {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: #888;
      border-radius: 50%;
      opacity: 0.4;
      animation: typing-dot 1.4s infinite both;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing-dot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    
    /* Animation for chat window */
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Mobile responsiveness */
    @media (max-width: 576px) {
      .chat-window {
        width: calc(100vw - 60px);
        right: -15px;
      }
    }
  `;

  // Inject styles
  const styleElement = document.createElement('style');
  styleElement.innerHTML = chatbotStyles;
  document.head.appendChild(styleElement);

  // Inject chatbot HTML
  const chatbotContainer = document.createElement('div');
  chatbotContainer.innerHTML = chatbotHTML;
  document.body.appendChild(chatbotContainer.firstElementChild);

  // Function to initialize the chatbot
  function initializeChatbot() {
    console.log('Attempting to initialize chatbot...');
    if (window.initializeChatbotControls) {
      console.log('initializeChatbotControls function found, calling it...');
      try {
        window.initializeChatbotControls();
      } catch (e) {
        console.error('Error initializing chatbot controls:', e);
      }
    } else {
      console.warn('initializeChatbotControls function not found, will retry in 500ms');
      setTimeout(initializeChatbot, 500);
    }
  }

  // Load the chatbot script
  const chatbotScript = document.createElement('script');
  chatbotScript.src = "./assets/js/chatbot.js";
  chatbotScript.onload = function() {
    console.log('Chatbot script loaded');
    // Initialize after a small delay to ensure all functions are defined
    setTimeout(initializeChatbot, 100);
  };
  document.body.appendChild(chatbotScript);
}); 