# othership-ai-extension
If I get the internship the backend is super easy to finish

## Implementation Checklist

### Dependency Setup
```bash
pip install flask python-dotenv
npm install --save @mui/material @emotion/react
Architecture Flow
```
```text
Gmail UI → Content Script → Background Service → Python API → AI Model
             ↑                  ↓
        Chrome Storage ← Context Data
```

### Testing Strategy
```javascript
// Sample Jest test
test('saves conversation correctly', async () => {
  await chrome.runtime.sendMessage({
    action: "saveConversation",
    content: "Test content"
  });
  const {conversations} = await chrome.storage.local.get();
  expect(conversations).toHaveLength(1);
});
```
