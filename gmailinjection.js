// Helper: Get the selected email content (simple example; adjust as needed)
function getSelectedEmailContent() {
  const emailElement = document.querySelector(".email-body");
  return emailElement ? emailElement.innerText : "";
}

// Helper: Insert the AI-generated draft response into the compose box
function insertDraftResponse(responseText) {
  const composeBox = document.querySelector('[role="dialog"]');
  if (composeBox) {
    const draftInput = composeBox.querySelector(
      'div[aria-label="Message Body"]'
    );
    if (draftInput) {
      draftInput.focus();
      // Using execCommand for simplicity – depending on Gmail updates this might change.
      document.execCommand("insertText", false, responseText);
    }
  }
}

// Function to inject the AI suggestion button into Gmail’s compose dialog
const injectReplyButton = () => {
  const composeBox = document.querySelector('[role="dialog"]');
  if (!composeBox) return;

  const aiButton = document.createElement("div");
  aiButton.innerHTML = `
      <div style="padding: 8px; margin: 5px; cursor: pointer; background: #4285f4; color: white; border-radius: 4px;">
        ✨ AI Suggest
      </div>`;

  aiButton.addEventListener("click", async () => {
    const emailText = getSelectedEmailContent();
    const response = await chrome.runtime.sendMessage({
      action: "generateResponse",
      email: emailText,
    });
    insertDraftResponse(response.draft);
  });

  // Insert the button into the compose dialog header (adjust selector as needed)
  const headerBar = composeBox.querySelector(".dC");
  if (headerBar) {
    headerBar.prepend(aiButton);
  }
};

// Use MutationObserver to watch for Gmail's compose dialog appearance dynamically
const observer = new MutationObserver(() => {
  const dialog = document.querySelector('[role="dialog"]');
  if (dialog) {
    injectReplyButton();
  }
});

// Start observing the DOM
observer.observe(document.body, { childList: true, subtree: true });
