/**
 * ARC Chatbot - Interacts with website data from Firebase
 */

// Website data cache
let websiteData = {
  events: [],
  blogs: [],
  research: [
    { title: "Teacher Training for Inclusive Learning", description: "Programs that help educators understand and address the unique challenges disabled students face in their disciplines." },
    { title: "Digital Accessibility Systems", description: "Exploring how digital technologies can improve accessibility in public spaces like museums, libraries, art galleries and more." },
    { title: "Augmented & Virtual Reality (AR/VR)", description: "Developing immersive, accessible learning environments through AR/VR technologies." },
    { title: "The Future Of Accessibility", description: "Research on AI-driven personalized learning and integrating disability studies into academic curriculum." }
  ],
  partners: [
    { name: "Great Eastern Foundation (GEF)", type: "Funding Partner" },
    { name: "Sightsavers", type: "Friend of ARC" },
    { name: "Sense International", type: "Friend of ARC" },
    { name: "National Programme on Technology Enhanced Learning", type: "Friend of ARC" },
    { name: "Tamilnadu Science and Technology Centre", type: "Friend of ARC" },
    { name: "Karna Vidya Foundation", type: "Friend of ARC" }
  ],
  contact: {
    email: "arcoffice@smail.iitm.ac.in",
    phone: ["022-2257-5638", "6380617367"],
    address: "Room 001, New Academic Complex 2 - NAC2 block, Alumni Ave, Indian Institute of Technology Madras, Chennai, Tamil Nadu 600036",
    hours: "10 am - 5 pm"
  }
};

// Variables to store DOM elements
let chatButton;
let chatWindow;
let closeChatBtn;
let chatMessages;
let chatInput;
let sendButton;
let chatContainer;

// Handle touch devices
let isTouchDevice = false;
let isHovering = false;
let hoverTimeout = null;

// Detect touch devices
window.addEventListener('touchstart', function onFirstTouch() {
  isTouchDevice = true;
  window.removeEventListener('touchstart', onFirstTouch);
}, false);

// Function to set up all event listeners and DOM elements
window.initializeChatbotControls = function() {
  console.log('Initializing chatbot controls...');
  
  // Get DOM elements
  chatButton = document.getElementById('chat-button');
  chatWindow = document.getElementById('chat-window');
  closeChatBtn = document.getElementById('close-chat');
  chatMessages = document.getElementById('chat-messages');
  chatInput = document.getElementById('chat-input');
  sendButton = document.getElementById('send-message');
  chatContainer = document.getElementById('arc-chatbot-container');

  if (!chatButton || !sendButton) {
    console.error('Chatbot elements not found!', {
      chatButton: !!chatButton,
      chatWindow: !!chatWindow,
      closeChatBtn: !!closeChatBtn,
      chatMessages: !!chatMessages,
      chatInput: !!chatInput,
      sendButton: !!sendButton
    });
    return;
  }

  console.log('Chatbot elements found, setting up listeners');

  // Event Listeners
  chatButton.addEventListener('click', toggleChat);
  closeChatBtn.addEventListener('click', closeChat);
  
  // Fix for send button - ensure it's clickable and working
  sendButton.addEventListener('click', function(e) {
    console.log('Send button clicked');
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
  });
  
  // Enter key in chat input
  chatInput.addEventListener('keypress', function(e) {
    console.log('Key pressed in chat input:', e.key);
    if (e.key === 'Enter') {
      console.log('Enter key pressed');
      e.preventDefault();
      sendMessage();
    }
  });

  // Add additional click event in case the first one doesn't work
  document.querySelector('.send-message i').addEventListener('click', function(e) {
    console.log('Send icon clicked');
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
  });

  // Handle hover interactions
  if (chatContainer) {
    // For mobile: prevent hover behavior on touch devices
    chatContainer.addEventListener('touchstart', function(e) {
      if (isTouchDevice && !chatWindow.classList.contains('active')) {
        e.preventDefault();
        toggleChat();
      }
    });

    // Add mouseenter/mouseleave for better control over hover behavior
    chatContainer.addEventListener('mouseenter', function() {
      isHovering = true;
      clearTimeout(hoverTimeout);
    });
    
    chatContainer.addEventListener('mouseleave', function() {
      if (!chatWindow.classList.contains('active')) {
        isHovering = false;
        // Give the user a chance to move to the chat window
        hoverTimeout = setTimeout(() => {
          if (!isHovering && !chatWindow.classList.contains('active')) {
            chatWindow.style.display = 'none';
          }
        }, 300);
      }
    });
    
    // Keep the chat window open when hovering over it
    chatWindow.addEventListener('mouseenter', function() {
      isHovering = true;
      clearTimeout(hoverTimeout);
    });
    
    chatWindow.addEventListener('mouseleave', function() {
      if (!chatWindow.classList.contains('active')) {
        isHovering = false;
        // Give the user a chance to move back to the button
        hoverTimeout = setTimeout(() => {
          if (!isHovering && !chatWindow.classList.contains('active')) {
            chatWindow.style.display = 'none';
          }
        }, 300);
      }
    });
  }

  console.log('All chatbot event listeners have been set up');
}

// Toggle chat visibility
function toggleChat() {
  if (!chatWindow) return;
  chatWindow.classList.toggle('active');
  if (chatWindow.classList.contains('active') && chatInput) {
    chatInput.focus();
  }
}

// Close chat function
function closeChat() {
  if (!chatWindow) return;
  chatWindow.classList.remove('active');
}

// Process user's message and determine response
async function processUserQuery(query) {
  if (!query || query.trim() === '') return "I didn't catch that. How can I help you?";
  
  try {
    // Use local processing only
    return processQueryLocally(query);
  } catch (error) {
    console.error('Error processing query:', error);
    return "I'm having trouble processing your request. Please try again.";
  }
}

// Send a message
function sendMessage() {
  if (!chatInput || !chatMessages) {
    console.error('Send message failed: chatInput or chatMessages is null', {
      chatInput: !!chatInput,
      chatMessages: !!chatMessages
    });
    return;
  }
  
  const message = chatInput.value.trim();
  if (!message) {
    console.log('No message to send');
    return;
  }
  
  console.log('Sending message:', message);
  
  // Add user message to chat
  addMessage(message, 'user');
  chatInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
  typingIndicator.innerHTML = '<div class="message-content"><span>●</span><span>●</span><span>●</span></div>';
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Process the message and get a response with a simulated delay
  setTimeout(async () => {
    try {
      const response = await processUserQuery(message);
      console.log('Generated response:', response);
      
      // Remove typing indicator
      if (typingIndicator.parentNode) {
        chatMessages.removeChild(typingIndicator);
      }
      
      // Add the response
      addMessage(response, 'bot');
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Remove typing indicator
      if (typingIndicator.parentNode) {
        chatMessages.removeChild(typingIndicator);
      }
      
      // Add error message
      addMessage("I'm having trouble processing your request. Please try again.", 'bot');
    }
  }, 500); // 500ms delay to simulate thinking
}

// Add a message to the chat window
function addMessage(text, sender) {
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);
  
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('message-content');
  contentDiv.textContent = text;
  
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  
  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Local fallback function if API is not available
function processQueryLocally(query) {
  query = query.toLowerCase();
  
  // Check for greetings
  if (/^(hi|hello|hey)($|\s)/i.test(query)) {
    return "Hello! How can I help you with information about The Accessibility Research Centre?";
  }
  
  // Check for contact information requests
  if (query.includes('contact') || query.includes('email') || query.includes('phone') || query.includes('address')) {
    return `Contact Information:
Email: ${websiteData.contact.email}
Phone: ${websiteData.contact.phone.join(', ')}
Address: ${websiteData.contact.address}
Hours: ${websiteData.contact.hours}`;
  }
  
  // Check for research related queries
  if (query.includes('research') || query.includes('project') || query.includes('study')) {
    return `Our research focuses on:
1. ${websiteData.research[0].title} - ${websiteData.research[0].description}
2. ${websiteData.research[1].title} - ${websiteData.research[1].description}
3. ${websiteData.research[2].title} - ${websiteData.research[2].description}
4. ${websiteData.research[3].title} - ${websiteData.research[3].description}`;
  }
  
  // Check for partner information
  if (query.includes('partner') || query.includes('collaboration') || query.includes('sponsor')) {
    let partnerText = `Our main funding partner is ${websiteData.partners[0].name}.\n\nFriends of ARC include:\n`;
    for (let i = 1; i < websiteData.partners.length; i++) {
      partnerText += `- ${websiteData.partners[i].name}\n`;
    }
    return partnerText;
  }
  
  // Event information
  if (query.includes('event')) {
    if (websiteData.events.length > 0) {
      let eventText = "Upcoming events:\n";
      websiteData.events.slice(0, 3).forEach((event, index) => {
        const dateStr = event.date instanceof Date 
          ? event.date.toLocaleDateString() 
          : 'Date to be announced';
        eventText += `${index + 1}. ${event.title} (${dateStr})\n`;
      });
      return eventText;
    } else {
      return "I'm currently loading event information. Please check our Events page for the latest updates.";
    }
  }
  
  // Blog information
  if (query.includes('blog') || query.includes('article')) {
    if (websiteData.blogs.length > 0) {
      let blogText = "Latest blog posts:\n";
      websiteData.blogs.slice(0, 3).forEach((blog, index) => {
        const dateStr = blog.date instanceof Date 
          ? blog.date.toLocaleDateString() 
          : 'Recently published';
        blogText += `${index + 1}. ${blog.title} (${dateStr})\n`;
      });
      return blogText;
    } else {
      return "I'm currently loading blog information. Please check our Blog section for the latest articles.";
    }
  }
  
  // About ARC
  if (query.includes('about') || query.includes('arc') || query.includes('accessibility research centre')) {
    return "The Accessibility Research Centre at IIT Madras focuses on creating inclusive knowledge learning environments. Our vision is a world where academic disciplines are fully inclusive, where disability is no longer an obstacle to learning and participation.";
  }
  
  // For other queries
  return "I'd be happy to help you with information about the Accessibility Research Centre. You can ask about our research, events, contact information, or partnerships. If you're looking for specific details, please visit our website sections for more information.";
}

// Initialize the chatbot when Firebase is loaded
function initChatbot() {
  // Load events and blogs from Firebase if available
  if (window.firebase && firebase.firestore) {
    const db = firebase.firestore();
    
    // Load events
    db.collection('events').orderBy('date', 'desc').limit(10).get()
      .then(snapshot => {
        websiteData.events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            date: data.date ? new Date(data.date.seconds * 1000) : new Date(),
            description: data.description || ''
          };
        });
        console.log('Chatbot loaded events data:', websiteData.events.length);
      })
      .catch(error => {
        console.error('Error loading events for chatbot:', error);
      });
    
    // Load blogs
    db.collection('blogs').orderBy('date', 'desc').limit(10).get()
      .then(snapshot => {
        websiteData.blogs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            date: data.date ? new Date(data.date.seconds * 1000) : new Date(),
            summary: data.summary || '',
            content: data.content || ''
          };
        });
        console.log('Chatbot loaded blogs data:', websiteData.blogs.length);
      })
      .catch(error => {
        console.error('Error loading blogs for chatbot:', error);
      });
  }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize immediately, but will be enhanced when Firebase loads
  initChatbot();
  
  // Try to initialize controls as soon as possible
  setTimeout(() => {
    window.initializeChatbotControls();
  }, 100);
  
  // Check for Firebase loading
  if (window.firebase) {
    console.log('Firebase already loaded, initializing chatbot');
    initChatbot();
  } else {
    // Set up a check for when Firebase might be loaded later
    const checkFirebase = setInterval(() => {
      if (window.firebase) {
        console.log('Firebase detected, initializing chatbot');
        initChatbot();
        clearInterval(checkFirebase);
      }
    }, 1000);
    
    // Stop checking after 10 seconds regardless
    setTimeout(() => {
      clearInterval(checkFirebase);
      console.log('Finished waiting for Firebase');
    }, 10000);
  }
}); 