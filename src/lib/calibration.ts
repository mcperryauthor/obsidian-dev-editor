import type { ParsedChapter } from './parser';

export interface StyleBaselineProfile {
  averageSentenceLength: number;
  fragmentFrequency: 'Low' | 'Medium' | 'High';
  dialogueRatio: number; // 0 to 1
  reactionBeatDensity: 'Low' | 'Medium' | 'High';
  modifierAverage: number;
  confidenceScore: number;
  obsessionVocabularyBaseline: Record<string, number>;
}

export const REACTION_BEATS = [
  'pulse jumps', 'breath catches', 'stomach drops', 'hands tighten',
  'heart races', 'blood runs cold', 'shivers', 'mouth goes dry',
  'throat tightens', 'muscles tense', 'fingers curl'
];

export const OBSESSION_VOCAB = [
  'watching', 'waiting', 'possession', 'stillness', 'attention', 'control', 'hunger', 'obsessed', 'mine', 'always'
];

/**
 * Very basic pseudo-sentence splitter.
 */
function extractSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
}

/**
 * Calculates baseline metrics from selected calibration chapters.
 */
export const generateCalibrationProfile = (chapters: ParsedChapter[]): StyleBaselineProfile => {
  let totalSentences = 0;
  let totalWordsInSentences = 0;
  let fragmentCount = 0;
  
  let totalDialogueBlocks = 0;
  let totalNarrativeBlocks = 0;

  let reactionBeatHits = 0;
  let obsessionHits: Record<string, number> = {};

  OBSESSION_VOCAB.forEach(v => obsessionHits[v] = 0);

  chapters.forEach(chapter => {
    chapter.blocks.forEach(block => {
      if (block.type === 'dialogue') {
        totalDialogueBlocks++;
      } else if (block.type === 'narrative') {
        totalNarrativeBlocks++;
      }

      const textLower = block.content.toLowerCase();
      
      // Sentences & Fragments (simplified heuristics)
      const sentences = extractSentences(block.content);
      sentences.forEach(s => {
        const words = s.trim().split(/\s+/);
        totalSentences++;
        totalWordsInSentences += words.length;
        if (words.length <= 4) fragmentCount++; // treating <= 4 words as a fragment for dark romance tension
      });

      // Reaction Beats
      REACTION_BEATS.forEach(beat => {
        if (textLower.includes(beat)) reactionBeatHits++;
      });

      // Obsession Vocab
      OBSESSION_VOCAB.forEach(vocab => {
        // very rudimentary keyword count
        const regex = new RegExp(`\\b${vocab}\\b`, 'g');
        const matches = textLower.match(regex);
        if (matches) {
          obsessionHits[vocab] += matches.length;
        }
      });
    });
  });

  const averageSentenceLength = totalSentences > 0 ? totalWordsInSentences / totalSentences : 0;
  const fragRatio = totalSentences > 0 ? fragmentCount / totalSentences : 0;
  
  let fragmentFrequency: 'Low' | 'Medium' | 'High' = 'Low';
  if (fragRatio > 0.25) fragmentFrequency = 'High';
  else if (fragRatio > 0.1) fragmentFrequency = 'Medium';

  const totalBlocks = totalDialogueBlocks + totalNarrativeBlocks;
  const dialogueRatio = totalBlocks > 0 ? totalDialogueBlocks / totalBlocks : 0;

  // Simplistic reaction density based on total narrative words
  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const reactRatio = totalWords > 0 ? (reactionBeatHits / totalWords) * 1000 : 0; // hits per 1000 words
  let reactionBeatDensity: 'Low' | 'Medium' | 'High' = 'Low';
  if (reactRatio > 5) reactionBeatDensity = 'High';
  else if (reactRatio > 2) reactionBeatDensity = 'Medium';

  return {
    averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    fragmentFrequency,
    dialogueRatio: Math.round(dialogueRatio * 100) / 100,
    reactionBeatDensity,
    modifierAverage: 1.2, // mock for now, requires NLP POS tagging for real deal
    confidenceScore: chapters.length >= 2 ? 92 : 65,
    obsessionVocabularyBaseline: obsessionHits
  };
};
