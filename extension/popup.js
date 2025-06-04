import glossarySearcher, { getCanonicalWord, getSynonyms } from './search.js';

// Autofill the search bar with the selected word from chrome.storage.local
window.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const videoResults = document.getElementById('video-results');
  const resultDiv = document.getElementById('result');
  const synonymDiv = document.getElementById('synonym-message');
  
  function clearResults() {
    videoResults.innerHTML = '';
    resultDiv.textContent = '';
    synonymDiv.textContent = '';
  }

  function renderVideos(videoPaths, label) {
    resultDiv.textContent = label;
    videoPaths.forEach(path => {
      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = false;
      video.src = chrome.runtime.getURL(path);
      video.className = 'asl-video';

      // Add a button to open in new tab
      const openBtn = document.createElement('button');
      openBtn.textContent = 'Open Fullscreen';
      openBtn.onclick = () => {
        window.open(video.src, '_blank');
      };

      const container = document.createElement('div');
      container.appendChild(video);
      container.appendChild(openBtn);

      videoResults.appendChild(container);
    });
  }

  function renderSuggestions(suggestions, label, onClick) {
    resultDiv.textContent = label;
    const ul = document.createElement('ul');
    suggestions.forEach(suggestion => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = suggestion.replace(/_/g, ' ');
      link.onclick = e => {
        e.preventDefault();
        onClick(suggestion);
      };
      li.appendChild(link);
      ul.appendChild(li);
    });
    resultDiv.appendChild(ul);
  }

  // Function to perform the search
  async function performSearch(word) {
    if (!word) return;
    clearResults();
    resultDiv.textContent = 'Searching...';
    
    const synonyms = getSynonyms(word);
    if (synonyms && synonyms.length > 1) {
      renderSuggestions(synonyms, 'Did you mean:', async gloss => {
        clearResults();
        const videoPaths = await glossarySearcher.findVideos(gloss);
        renderVideos(videoPaths, `Showing ASL sign(s) for "${gloss.replace(/_/g, ' ')}"`);
      });
      return;
    }

    const videoPaths = await glossarySearcher.findVideos(word);
    const canonicalArr = getCanonicalWord(word);
    const canonicalWord = canonicalArr[0];
    const usedSynonym = canonicalWord !== word.trim().toUpperCase();
    synonymDiv.textContent = usedSynonym
      ? `Showing results for "${canonicalWord.toLowerCase()}" (synonym for "${word}")`
      : '';

    if (videoPaths.length > 0) {
      renderVideos(videoPaths, `Found ${videoPaths.length} ASL sign(s) for "${usedSynonym ? canonicalWord.toLowerCase() : word}"`);
      return;
    }

    const partialMatches = await glossarySearcher.findPartialMatches(word);
    const isShort = word.length <= 3 && word === word.toUpperCase();
    let filteredMatches;

    if (isShort) {
      // Only allow exact ns-#WORD or ns-WORD matches for short, all-uppercase input
      filteredMatches = partialMatches
        .map(match => match.word)
        .filter(w => w === `ns-#${word}` || w === `ns-${word}`);
    } else {
      filteredMatches = partialMatches
        .map(match => match.word)
        .filter(w => w.startsWith('ns-') || w.length > 1);
    }

    if (filteredMatches.length > 0) {
      renderSuggestions(
        filteredMatches,
        `No exact match found for "${word}". Did you mean:`,
        async matchWord => {
          clearResults();
          const match = partialMatches.find(m => m.word === matchWord);
          if (match) {
            renderVideos(match.paths, `Showing ASL sign(s) for "${match.word}"`);
          }
        }
      );
      return;
    }

    resultDiv.textContent = `No ASL sign found for "${word}"`;
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateSearch') {
      searchInput.value = message.word;
      performSearch(message.word);
    }
  });

  // Add search button click handler
  searchBtn.addEventListener('click', () => {
    performSearch(searchInput.value);
  });

  // Add enter key handler
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
    }
  });

  // Initial load from storage
  chrome.storage.local.get('selectedWord', (data) => {
    if (data.selectedWord) {
      searchInput.value = data.selectedWord;
      performSearch(data.selectedWord);
      // Optionally clear the stored word after use
      chrome.storage.local.remove('selectedWord');
    }
  });
}); 