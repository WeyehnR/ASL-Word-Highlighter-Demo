// Create a context menu item for selected text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'aslDictionarySearch',
    title: 'Search ASL for "%s"',
    contexts: ['selection']
  });
});

// Listen for context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'aslDictionarySearch' && info.selectionText) {
    // Store the selected word in chrome.storage for the popup to use
    chrome.storage.local.set({ selectedWord: info.selectionText }, () => {
      // Send message to popup if it's open
      chrome.runtime.sendMessage({ action: 'updateSearch', word: info.selectionText });
      // If popup isn't open, open it
      chrome.action.openPopup();
    });
  }
}); 