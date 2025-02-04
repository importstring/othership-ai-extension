const getSelectedEmailContent = () => {
  const emailElement = document.querySelector(".email-body");
  return emailElement ? emailElement.innerText : "";
};

const insertDraftResponse = (responseText) => {
  const composeBox = document.querySelector('[role="dialog"]');
  if (composeBox) {
    const draftInput = composeBox.querySelector('div[aria-label="Message Body"]');
    if (draftInput) {
      draftInput.focus();
      document.execCommand("insertText", false, responseText);
    }
  }
};

const createContextItem = (ctx) => {
  const item = document.createElement('div');
  item.className = 'context-item';
  item.innerHTML = `
    <div class="context-content">${ctx.content.substring(0, 50)}...</div>
    <div class="context-time">${new Date(ctx.timestamp).toLocaleString()}</div>
  `;
  item.onclick = () => loadContext(ctx.id);
  return item;
};

const injectUIComponents = () => {
  const composeBox = document.querySelector('[role="dialog"]');
  if (!composeBox) return;

  // AI Response Button
  const aiButton = document.createElement('button');
  aiButton.innerHTML = '🤖 AI Suggest';
  aiButton.style.cssText = 'margin: 8px; padding: 8px 12px;';
  aiButton.onclick = async () => {
    const response = await chrome.runtime.sendMessage({
      action: "generateResponse",
      email: getSelectedEmailContent()
    });
    insertDraftResponse(response.draft);
  };

  // Save Context Button
  const saveButton = document.createElement('button');
  saveButton.innerHTML = '💾 Save Context';
  saveButton.style.cssText = 'margin-left: 8px; padding: 8px 12px;';
  saveButton.onclick = () => chrome.runtime.sendMessage({
    action: "saveConversation",
    content: getSelectedEmailContent()
  });

  // UI Container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; align-items: center; padding: 8px;';
  buttonContainer.append(aiButton, saveButton);
  composeBox.prepend(buttonContainer);

  // History Panel
  const historyPanel = document.createElement('div');
  historyPanel.id = 'ai-context-panel';
  historyPanel.style.cssText = `
    position: fixed;
    right: 20px;
    top: 20px;
    width: 300px;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 16px;
    z-index: 1000;
  `;
  historyPanel.innerHTML = '<h3>Conversation History</h3>';
  const list = document.createElement('div');
  historyPanel.appendChild(list);
  document.body.appendChild(historyPanel);

  // Load initial history
  chrome.storage.local.get(['conversations'], ({ conversations }) => {
    conversations?.forEach(ctx => {
      list.appendChild(createContextItem(ctx));
    });
  });
};

// Initial injection
setTimeout(injectUIComponents, 2000);
