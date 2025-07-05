# ASL Dictionary Tool

A Chrome extension and dataset for searching and viewing American Sign Language (ASL) sign videos for English words, phrases, and place names. This is the project for testing my idea about the archetecture. This is my first Demo project

## 📽️ Demo Video (I tried fixing the audio issue, my mic keep dropping, it is mostly visual)

[![ASL Word Highlighter Demo](https://img.youtube.com/vi/23a5A6wCwOo/maxresdefault.jpg)](https://www.youtube.com/watch?v=23a5A6wCwOo)

**Features demonstrated:**
- Real-time ASL word search
- Chrome extension interface
- Video integration capabilities
- User Highighted word to fetch the correct videos of a word
- Word suggestion 

*Click the thumbnail to watch the full demonstration (YouTube)*

**Demo highlights:**
- ASL word search functionality
- Real-time video integration
- User-friendly interface design

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Prerequisites for Beginners](#prerequisites-for-beginners)
- [Directory Structure](#directory-structure)
- [Key Files and Documentation](#key-files-and-documentation)
- [How to Use](#how-to-use)
- [Extending the Project](#extending-the-project)
- [Dataset Source, Terms of Use, and Citation](#dataset-source-terms-of-use-and-citation)

---

## ASL Dictionary Demo Video

Here is the Demo video if you want to see how this works: [ASL Dictionary Demo Video](https://www.youtube.com/watch?v=23a5A6wCwO0&list=PL3To-7h-Rd9y88FTn0-WfYM58014LUYC4&index=40&ab_channel=WeyehnReeves)

## Project Overview

This project provides a Chrome extension that allows users to:

- Search for an English word or phrase and see the corresponding ASL sign video(s).
- Handle synonyms, plurals, and place names (cities, states, countries).
- Suggest close matches if an exact match is not found.
- Open videos in fullscreen via a new tab.

The project also includes scripts and data for managing the ASL video dataset and generating the synonym mappings.

---

## Architecture

**Main Components:**

- **Chrome Extension (`extension/`)**
  - `popup.html`, `popup.js`, `styles.css`: The user interface and logic for the popup.
  - `search.js`: Core search and synonym logic.
  - `glossary.json`: Maps glosses (ASL words/phrases) to video filenames.
  - `synonyms.json`: Maps English words/phrases/abbreviations to glosses (supports multiple meanings).
  - `asl_videos/`: Directory of ASL sign videos, organized by first letter and gloss.
  - `contextMenu/background.js`: Adds right-click context menu support.

- **Data and Scripts**
  - `batch_download_transcode/`, `extract_gloss_prefix_postfix/`: Python scripts for managing and processing the video dataset.
  - `dataset/`: Contains CSVs and other data for the ASL dataset.

---

## Prerequisites for Beginners

If you are new to programming or web development, you should learn:

- **Basic JavaScript**: Variables, functions, objects, arrays, and ES6+ syntax.
- **HTML & CSS**: How web pages are structured and styled.
- **JSON**: Data format for configuration and data files.
- **Chrome Extensions**: How browser extensions work, especially manifest v3.
- **Basic Python** (optional): For running dataset management scripts.

**Recommended Resources:**

- [MDN Web Docs: JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [MDN Web Docs: HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [MDN Web Docs: CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Google Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [JSON Introduction](https://www.json.org/json-en.html)
- [Python Official Tutorial](https://docs.python.org/3/tutorial/)

---

## Directory Structure

```text
special-parakeet/
│
├── extension/
│   ├── popup.html
│   ├── popup.js
│   ├── search.js
│   ├── styles.css
│   ├── manifest.json
│   ├── glossary.json
│   ├── synonyms.json
│   ├── asl_videos/
│   └── contextMenu/
│       └── background.js
│
├── batch_download_transcode/
│   └── *.py
├── extract_gloss_prefix_postfix/
│   └── *.py, *.txt
├── dataset/
│   └── *.csv, WLASL/
├── docs/
│   └── *.pdf, *.png
├── extract_places_states.py
├── .gitignore
└── ...
```

---

## Key Files and Documentation

### `extension/popup.js`

- **Purpose:** Handles the popup UI, user input, and search results.
- **Key Functions:**
  - `performSearch(word)`: Main search logic, handles synonyms, partial matches, and video rendering.
  - `renderVideos(videoPaths, label)`: Renders video elements and a button to open in fullscreen (new tab).
  - `renderSuggestions(suggestions, label, onClick)`: Renders clickable suggestions for close matches.
  - `clearResults()`: Clears previous search results from the UI.

### `extension/search.js`

- **Purpose:** Core search and synonym logic.
- **Key Class:**
  - `GlossarySearcher`: Handles loading data, searching for videos, handling synonyms, and fuzzy matching.
    - `initialize()`: Loads glossary and synonym data.
    - `findVideos(word)`: Returns video paths for a word or its synonyms.
    - `findPartialMatches(word)`: Returns close/fuzzy matches.
    - `getCanonicalWord(word)`: Returns the canonical gloss(es) for a word.
    - `getSynonyms(word)`: Returns all synonyms for a word.
    - Helper methods: `normalizeWord`, `getAllSynonymVariants`, `getPossibleGlossKeys`, `searchGlossaryForWord`, `binarySearch`, `normalizeForFuzzy`.

### `extension/glossary.json`

- **Purpose:** Maps glosses (ASL words/phrases) to arrays of video filenames.

### `extension/synonyms.json`

- **Purpose:** Maps English words/phrases/abbreviations to glosses (can be multiple for ambiguous words).

### `extension/asl_videos/`

- **Purpose:** Contains all ASL sign videos, organized by first letter and gloss.

### `extension/contextMenu/background.js`

- **Purpose:** Adds right-click context menu support for searching highlighted words.

### `batch_download_transcode/`, `extract_gloss_prefix_postfix/`

- **Purpose:** Python scripts for managing, downloading, and processing the video dataset.

### `extract_places_states.py`

- **Purpose:** Script for extracting and merging place/state names into the synonym mapping.

---

## How to Use

1. **Install the Extension:**
   - Load the `extension/` folder as an unpacked extension in Chrome.

2. **Search for a Word:**
   - Type or highlight a word/phrase and use the popup to search for its ASL sign.

3. **View Results:**
   - If found, videos will be shown. Use the "Open Fullscreen" button to view in a new tab.
   - If not found, close matches or suggestions will be shown.

4. **Right-Click Search:**
   - Highlight a word on any page, right-click, and use the context menu to search.

---

## Extending the Project

- **Add More Synonyms:** Edit `synonyms.json` to add new mappings or handle more ambiguous words.
- **Add More Videos:** Place new videos in the correct `asl_videos/` subfolder and update `glossary.json`.
- **Improve Search Logic:** Edit `search.js` for more advanced matching or new features.
- **Dataset Management:** Use the Python scripts to automate video and data management.

---

## Dataset Source, Terms of Use, and Citation

This project uses the **American Sign Language Lexicon Video Dataset (ASLLVD)** from Boston University.

**Terms of Use:**  
The data are available for research and educational purposes only. Redistribution or commercial use is not allowed without explicit permission. No patents or copyrights may be based on this material.  
For more details, see the [official terms of use](http://www.bu.edu/asllrp/).

**Official Citation:**  

> Carol Neidle, Ashwin Thangali, and Stan Sclaroff [2012] "Challenges in Development of the American Sign Language Lexicon Video Dataset (ASLLVD) Corpus," Proceedings of the 5th Workshop on the Representation and Processing of Sign Languages: Interactions between Corpus and Lexicon, LREC 2012, Istanbul, Turkey, May 27, 2012.  
> [http://www.bu.edu/linguistics/UG/LREC2012/LREC-asllvd-final.pdf](http://www.bu.edu/linguistics/UG/LREC2012/LREC-asllvd-final.pdf)

And include the dataset URL:  
[http://www.bu.edu/asllrp/lexicon/](http://www.bu.edu/asllrp/lexicon/)

**Additional recommended citations:**

- Carol Neidle and Christian Vogler [2012] "A New Web Interface to Facilitate Access to Corpora: Development of the ASLLRP Data Access Interface," Proceedings of the 5th Workshop on the Representation and Processing of Sign Languages: Interactions between Corpus and Lexicon, LREC 2012, Istanbul, Turkey. [PDF](http://www.bu.edu/linguistics/UG/LREC2012/LREC-dai-final.pdf)

