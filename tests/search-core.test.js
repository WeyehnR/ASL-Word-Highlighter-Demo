import { GlossarySearcher } from '../extension/search.js';

global.chrome = {
  runtime: {
    getURL: (path) => path
  }
};
global.fetch = jest.fn();

describe('GlossarySearcher Core', () => {
  let searcher;
  beforeEach(() => {
    searcher = new GlossarySearcher();
    if (fetch.mockClear) fetch.mockClear();
    jest.clearAllMocks();
    // Ensure synonymMap is never empty
    searcher.synonymMap = { 'DUMMY': ['DUMMY'] };
    searcher.glossaryCache = {
      'H': {
        'HELLO': ['video1.mp4', 'video2.mp4'],
        'HELLO WORLD': ['video4.mp4']
      },
      'W': {
        'WORLD': ['video3.mp4']
      }
    };
    searcher.synonymMap = {
      'HI': 'HELLO',
      'GREETING': 'HELLO',
      'EARTH': 'WORLD',
      'GLOBE': 'WORLD'
    };
  });

  describe('normalizeWord', () => {
    test('should trim and convert to uppercase', () => {
      expect(searcher.normalizeWord('  hello  ')).toBe('HELLO');
      expect(searcher.normalizeWord('World')).toBe('WORLD');
    });
    test('should handle special characters', () => {
      expect(searcher.normalizeWord('hello-world')).toBe('HELLO-WORLD');
      expect(searcher.normalizeWord('hello.world')).toBe('HELLO.WORLD');
    });
    test('should handle empty strings', () => {
      expect(searcher.normalizeWord('')).toBe('');
      expect(searcher.normalizeWord('   ')).toBe('');
    });
  });

  describe('getAllSynonymVariants', () => {
    beforeEach(() => {
      searcher.synonymMap = {
        'HELLO': ['HI', 'HELLO', 'HEY'],
        'WORLD': ['EARTH', 'WORLD', 'GLOBE'],
        'GOOD': ['WELL', 'FINE', 'GOOD']
      };
    });
    test('should return synonyms if they exist', () => {
      expect(searcher.getAllSynonymVariants('hello')).toEqual(['HI', 'HELLO', 'HEY']);
    });
    test('should return normalized word if no synonyms exist', () => {
      expect(searcher.getAllSynonymVariants('nonexistent')).toEqual(['NONEXISTENT']);
    });
    test('should handle case-insensitive synonym lookup', () => {
      expect(searcher.getAllSynonymVariants('Hello')).toEqual(['HI', 'HELLO', 'HEY']);
      expect(searcher.getAllSynonymVariants('hElLo')).toEqual(['HI', 'HELLO', 'HEY']);
    });
  });

  describe('getPossibleGlossKeys', () => {
    test('should return array of possible keys', () => {
      const keys = searcher.getPossibleGlossKeys('New York');
      expect(keys).toEqual([
        'NEW YORK',
        'ns-NEW YORK',
        'ns-#NEW YORK'
      ]);
    });
    test('should handle single words', () => {
      const keys = searcher.getPossibleGlossKeys('Hello');
      expect(keys).toEqual([
        'HELLO',
        'ns-HELLO',
        'ns-#HELLO'
      ]);
    });
    test('should handle words with special characters', () => {
      const keys = searcher.getPossibleGlossKeys('New-York');
      expect(keys).toEqual([
        'NEW-YORK',
        'ns-NEW-YORK',
        'ns-#NEW-YORK'
      ]);
    });
  });

  describe('binarySearch', () => {
    test('should find exact match', () => {
      const obj = {
        'APPLE': ['video1.mp4'],
        'BANANA': ['video2.mp4'],
        'CHERRY': ['video3.mp4']
      };
      expect(searcher.binarySearch('banana', obj)).toBe('BANANA');
    });
    test('should return null for no match', () => {
      const obj = {
        'APPLE': ['video1.mp4'],
        'BANANA': ['video2.mp4']
      };
      expect(searcher.binarySearch('orange', obj)).toBeNull();
    });
    test('should handle case-insensitive search', () => {
      const obj = {
        'APPLE': ['video1.mp4'],
        'BANANA': ['video2.mp4']
      };
      expect(searcher.binarySearch('BANANA', obj)).toBe('BANANA');
      expect(searcher.binarySearch('banana', obj)).toBe('BANANA');
    });
    test('should handle empty object', () => {
      expect(searcher.binarySearch('apple', {})).toBeNull();
    });
  });

  describe('findVideos', () => {
    beforeEach(() => {
      searcher.glossaryCache = {
        'H': {
          'HELLO': ['video1.mp4', 'video2.mp4'],
          'HI': ['video3.mp4']
        },
        'W': {
          'WORLD': ['video4.mp4']
        }
      };
      searcher.synonymMap = {
        'HELLO': ['HI', 'HELLO']
      };
    });
    test('should find videos for exact match', async () => {
      const videos = await searcher.findVideos('hello');
      expect(videos).toContain('asl_videos/H/HELLO/video1.mp4');
      expect(videos).toContain('asl_videos/H/HELLO/video2.mp4');
    });
    test('should find videos for synonyms', async () => {
      const videos = await searcher.findVideos('hi');
      expect(videos).toContain('asl_videos/H/HI/video3.mp4');
    });
    test('should return empty array for no matches', async () => {
      const videos = await searcher.findVideos('nonexistent');
      expect(videos).toEqual([]);
    });
  });

  describe('findPartialMatches', () => {
    beforeEach(async () => {
      const mockGlossary = {
        'H': {
          'HELLO': ['video1.mp4'],
          'HELLO WORLD': ['video2.mp4']
        },
        'W': {
          'WORLD': ['video3.mp4']
        }
      };
      const mockSynonyms = {};
      fetch
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve(mockGlossary)
        }))
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve(mockSynonyms)
        }));
      await searcher.initialize();
    });
    test('should find partial matches', async () => {
      const matches = await searcher.findPartialMatches('hello');
      expect(matches).toHaveLength(2);
      expect(matches[0].word).toBe('HELLO');
      expect(matches[1].word).toBe('HELLO WORLD');
    });
    test('should handle multi-word searches', async () => {
      const matches = await searcher.findPartialMatches('hello world');
      expect(matches).toHaveLength(3);
      expect(matches.some(m => m.word === 'HELLO')).toBe(true);
      expect(matches.some(m => m.word === 'HELLO WORLD')).toBe(true);
      expect(matches.some(m => m.word === 'WORLD')).toBe(true);
    });
    test('should return empty array for no matches', async () => {
      const matches = await searcher.findPartialMatches('nonexistent');
      expect(matches).toEqual([]);
    });
  });

  describe('security and code/injection input', () => {
    beforeEach(() => {
      searcher.glossaryCache = {
        'A': { 'APPLE': ['video1.mp4'] },
        'H': { 'HELLO': ['video2.mp4'] }
      };
      searcher.synonymMap = {
        'HELLO': ['HI', 'HELLO']
      };
    });
    test('should not return results for JavaScript code input', async () => {
      const codeInputs = [
        'function() {}',
        '<script>alert(1)</script>',
        'console.log("test")',
        'var x = 1;',
        '() => {}'
      ];
      for (const input of codeInputs) {
        const videos = await searcher.findVideos(input);
        expect(videos).toEqual([]);
        const matches = await searcher.findPartialMatches(input);
        expect(matches).toEqual([]);
      }
    });
    test('should not return results for injection-like input', async () => {
      const injectionInputs = [
        '"; DROP TABLE glossary; --',
        '1; rm -rf /',
        'SELECT * FROM users',
        'alert("hacked")',
        '<img src=x onerror=alert(1)>',
        '|| true'
      ];
      for (const input of injectionInputs) {
        const videos = await searcher.findVideos(input);
        expect(videos).toEqual([]);
        const matches = await searcher.findPartialMatches(input);
        expect(matches).toEqual([]);
      }
    });
    test('should not modify glossary or videos for code/injection input', async () => {
      const originalGlossary = JSON.stringify(searcher.glossaryCache);
      const originalSynonyms = JSON.stringify(searcher.synonymMap);
      await searcher.findVideos('<script>alert(1)</script>');
      await searcher.findPartialMatches('"; DROP TABLE glossary; --');
      expect(JSON.stringify(searcher.glossaryCache)).toBe(originalGlossary);
      expect(JSON.stringify(searcher.synonymMap)).toBe(originalSynonyms);
    });
  });
}); 