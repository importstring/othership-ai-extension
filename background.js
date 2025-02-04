const initializeGmailAPI = async () => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        gapi.load("client", async () => {
          try {
            await gapi.client.init({
              apiKey: "YOUR_API_KEY",
              discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
              clientId: "YOUR_CLIENT_ID.apps.googleusercontent.com",
              scope: "https://www.googleapis.com/auth/gmail.modify",
            });
            resolve(gapi.client);
          } catch (error) {
            reject(error);
          }
        });
      }
    });
  });
};

// Enhanced message handler with conversation persistence
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateResponse") {
    generateAIResponse(request.email).then(response => {
      sendResponse({ draft: response });
    });
    return true;
  }
  
  if (request.action === "saveConversation") {
    chrome.storage.local.get(['conversations'], (result) => {
      const updated = [...(result.conversations || []), {
        id: Date.now(),
        content: request.content,
        timestamp: new Date().toISOString()
      }];
      chrome.storage.local.set({ conversations: updated });
    });
  }
});

// Modified AI integration with Python service
async function generateAIResponse(emailText) {
  try {
    const context = await loadConversationContext();
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: emailText,
        context: context
      })
    });
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('AI Generation Error:', error);
    return "Error generating response. Please try again.";
  }
}

async function loadConversationContext() {
  const { conversations } = await chrome.storage.local.get(['conversations']);
  return conversations?.slice(-5) || [];
}
