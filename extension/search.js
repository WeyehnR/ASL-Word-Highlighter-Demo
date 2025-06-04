// Binary search implementation for glossary lookup
class GlossarySearcher {
    constructor() {
        this.glossaryCache = null;
        this.synonymMap = null;
        this.isLoading = false;
    }

    async initialize() {
        if (this.glossaryCache && this.synonymMap) return;
        this.isLoading = true;
        try {
            const glossaryResponse = await fetch(chrome.runtime.getURL('glossary.json'));
            this.glossaryCache = await glossaryResponse.json();
            const synonymResponse = await fetch(chrome.runtime.getURL('synonyms.json'));
            this.synonymMap = await synonymResponse.json();
        } finally {
            this.isLoading = false;
        }
    }

    normalizeWord(word) {
        return word.trim().toUpperCase();
    }

    getAllSynonymVariants(word) {
        const normalized = this.normalizeWord(word);
        if (this.synonymMap && this.synonymMap[normalized]) {
            return this.synonymMap[normalized];
        }
        return [normalized];
    }

    getPossibleGlossKeys(word) {
        // For place names, try with and without ns- and ns-# prefixes
        const normalized = this.normalizeWord(word);
        return [
            normalized,
            `ns-${normalized}`,
            `ns-#${normalized}`
        ];
    }

    searchGlossaryForWord(glossary, word) {
        const firstLetter = word[0];
        if (!glossary[firstLetter]) return [];
        const match = this.binarySearch(word, glossary[firstLetter]);
        if (match && glossary[firstLetter][match]) {
            return glossary[firstLetter][match].map(
                fname => `asl_videos/${firstLetter}/${match}/${fname}`
            );
        }
        return [];
    }

    // Binary search implementation
    binarySearch(word, obj) {
        const keys = Object.keys(obj).sort();
        let left = 0;
        let right = keys.length - 1;
        const searchWord = word.toUpperCase();
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const currentWord = keys[mid].toUpperCase();
            if (currentWord === searchWord) {
                return keys[mid];
            }
            if (currentWord < searchWord) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return null;
    }

    async findVideos(word) {
        await this.initialize();
        const allVariants = this.getAllSynonymVariants(word);
        let allVideos = [];
        for (const variant of allVariants) {
            for (const key of this.getPossibleGlossKeys(variant)) {
                const videos = this.searchGlossaryForWord(this.glossaryCache, key);
                if (videos.length > 0) {
                    allVideos = allVideos.concat(videos);
                }
            }
        }
        return allVideos;
    }

    // Get all possible matches for partial word
    async findPartialMatches(word) {
        await this.initialize();
        const normalizedWord = this.normalizeWord(word);
        const fuzzyWord = this.normalizeForFuzzy(normalizedWord);
        let partsList = [[normalizedWord]];
        if (normalizedWord.length > 6) {
            for (let i = 3; i < normalizedWord.length - 2; i++) {
                const left = normalizedWord.slice(0, i);
                const right = normalizedWord.slice(i);
                partsList.push([left, right]);
            }
        }
        const matches = [];
        for (const letter of Object.keys(this.glossaryCache)) {
            for (const entry of Object.keys(this.glossaryCache[letter])) {
                const fuzzyEntry = this.normalizeForFuzzy(entry);
                if (fuzzyEntry.includes(fuzzyWord) || fuzzyWord.includes(fuzzyEntry)) {
                    matches.push({
                        word: entry,
                        paths: this.glossaryCache[letter][entry].map(
                            fname => `asl_videos/${letter}/${entry}/${fname}`
                        )
                    });
                    continue;
                }
                for (const parts of partsList) {
                    if (parts.every(part => entry.includes(part))) {
                        matches.push({
                            word: entry,
                            paths: this.glossaryCache[letter][entry].map(
                                fname => `asl_videos/${letter}/${entry}/${fname}`
                            )
                        });
                        break;
                    }
                }
            }
        }
        return matches;
    }

    normalizeForFuzzy(str) {
        return str.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    }

    getCanonicalWord(word) {
        const normalized = this.normalizeWord(word);
        if (this.synonymMap && this.synonymMap[normalized]) {
            return this.synonymMap[normalized];
        }
        return [normalized];
    }

    getSynonyms(word) {
        const normalized = this.normalizeWord(word);
        if (this.synonymMap && this.synonymMap[normalized]) {
            return this.synonymMap[normalized];
        }
        return null;
    }
}

const glossarySearcher = new GlossarySearcher();
export default glossarySearcher;

export function getCanonicalWord(word) {
    return glossarySearcher.getCanonicalWord(word);
}

export function getSynonyms(word) {
    return glossarySearcher.getSynonyms(word);
} 