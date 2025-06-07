import { GlossarySearcher } from '../extension/search.js';

global.chrome = {
  runtime: {
    getURL: (path) => path
  }
};
global.fetch = jest.fn();

describe('GlossarySearcher Initialize', () => {
  let searcher;
  beforeEach(() => {
    searcher = new GlossarySearcher();
    searcher.glossaryCache = null;
    searcher.synonymMap = null;
    if (fetch.mockClear) fetch.mockClear();
    jest.clearAllMocks();
  });

  test('should load glossary and synonyms', async () => {
    const mockGlossary = { A: { 'APPLE': ['video1.mp4'] } };
    const mockSynonyms = { 'APPLE': ['FRUIT'] };
    fetch
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockGlossary)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockSynonyms)
      }));
    await searcher.initialize();
    expect(searcher.glossaryCache).toEqual(mockGlossary);
    expect(searcher.synonymMap).toEqual(mockSynonyms);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('should handle fetch errors', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    await expect(searcher.initialize()).rejects.toThrow('Network error');
    expect(searcher.isLoading).toBe(false);
  });

  test('should not reload if already initialized', async () => {
    searcher.glossaryCache = { A: { 'APPLE': ['video1.mp4'] } };
    searcher.synonymMap = { 'APPLE': ['FRUIT'] };
    await searcher.initialize();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('should handle malformed glossary data', async () => {
    fetch
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(null)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({})
      }));
    await expect(searcher.initialize()).rejects.toThrow('Invalid glossary data format');
    expect(searcher.isLoading).toBe(false);
  });

  test('should handle real data structure', async () => {
    searcher.glossaryCache = null;
    searcher.synonymMap = null;
    const mockGlossary = {
      '#': {
        '#AC': ['3103.mp4', 'Brady_3103.mp4'],
        '#ALL': ['15007.mp4', '3930.mp4']
      },
      'A': {
        'APPLE': ['video1.mp4', 'video2.mp4']
      }
    };
    const mockSynonyms = {
      'POLICE': ['COP'],
      'COP': ['POLICE'],
      'FIRE': ['FIRE_BURN', 'FIRE_BURN+PLACE', 'FIREMAN']
    };
    fetch.mockReset();
    fetch
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockGlossary)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockSynonyms)
      }));
    await searcher.initialize();
    expect(searcher.glossaryCache).toEqual(mockGlossary);
    expect(searcher.synonymMap).toEqual(mockSynonyms);
    expect(searcher.glossaryCache['#']['#AC']).toBeDefined();
    expect(searcher.glossaryCache['A']['APPLE']).toBeDefined();
    expect(searcher.synonymMap['POLICE']).toContain('COP');
    expect(searcher.synonymMap['FIRE']).toContain('FIRE_BURN');
  });

  test('should handle concurrent initialization calls', async () => {
    const mockGlossary = { A: { 'APPLE': ['video1.mp4'] } };
    const mockSynonyms = { 'APPLE': ['FRUIT'] };
    fetch
      .mockImplementation(() => Promise.resolve({
        json: () => Promise.resolve(mockGlossary)
      }));
    fetch
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockGlossary)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockSynonyms)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockGlossary)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockSynonyms)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockGlossary)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(mockSynonyms)
      }));
    const promises = [
      searcher.initialize(),
      searcher.initialize(),
      searcher.initialize()
    ];
    await Promise.all(promises);
    expect(searcher.glossaryCache).toEqual(mockGlossary);
    expect(searcher.synonymMap).toEqual(mockSynonyms);
  });
}); 