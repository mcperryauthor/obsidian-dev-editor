import type { ParsedManuscript } from './parser';
import type { StyleBaselineProfile } from './calibration';

export interface SceneFlag {
  id: string;
  type: 'pacing' | 'prose' | 'ai_pattern' | 'scene_purpose' | 'claustrophobia' | 'predator' | 'obsession' | 'surveillance' | 'silence';
  severity: 'warning' | 'info' | 'error';
  message: string;
  blockStartIndex: number;
}

export interface ChapterDiagnostics {
  chapterNumber: number;
  pacingScore: number; // 0-100
  romanceArcPosition: string; // Fear, Curiosity, Resistance, Fascination, Obsession, Dependency
  proseDisciplineScore: number;
  claustrophobiaScore: number; // 0-100
  predatorScore: number; // 0-100
  flags: SceneFlag[];
}

export interface CoreAnalysisReport {
  overallPacing: number;
  overallProseDiscipline: number;
  aiPatternDetections: number;
  overallClaustrophobia: number;
  overallPredatorPresence: number;
  chapterDiagnostics: ChapterDiagnostics[];
}

// Very basic NLP simulation for prose analysis
const PASSIVE_VOICE_REGEX = /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/ig;
const OVERWRITTEN_REGEX = /\b\w+ly\s+\w+ly\b|\b(\w+\s+){3,5}(suddenly|somehow)\b/ig;
const AI_SYMMETRICAL_REGEX = /Not only.*but also|On one hand.*on the other hand/ig;

// Dark Romance Specialty RegEx
const CLAUSTROPHOBIA_REGEX = /\b(door|doors|lock|locks|window|windows|room|rooms|wall|walls|corner|cage|trap|trapped|close|breath|against me)\b/ig;
const PREDATOR_REGEX = /\b(watching|waiting|stillness|control|quiet|authority|stare|stared|shadow|loomed|predator|prey|hunt)\b/ig;
const SURVEILLANCE_REGEX = /\b(camera|cameras|lens|watching|being seen|monitoring|screen|footage|record|recorded)\b/ig;
const OBSESSION_VOCAB = ['watching', 'waiting', 'possession', 'stillness', 'attention', 'control', 'hunger'];

const generateId = () => Math.random().toString(36).substring(2, 9);

export const runCoreAnalysis = (
  manuscript: ParsedManuscript, 
  profile: StyleBaselineProfile | null
): CoreAnalysisReport => {
  let globalPacingScore = 0;
  let globalProseDiscipline = 0;
  let globalAiPatterns = 0;
  let globalClaustrophobia = 0;
  let globalPredator = 0;

  const chapterDiagnostics: ChapterDiagnostics[] = manuscript.chapters.map(chapter => {
    let pacingFlags = 0;
    let proseFlags = 0;
    let aiFlags = 0;
    
    let claustrophobiaHits = 0;
    let predatorHits = 0;
    let surveillanceHits = 0;
    let obsessionHits = 0;

    let dialogueBlocks = 0;
    let narrativeBlocks = 0;

    const flags: SceneFlag[] = [];

    // Simulate Romance Arc progression based on chapter number
    const arcStages = ['Fear', 'Curiosity', 'Resistance', 'Fascination', 'Obsession', 'Dependency'];
    const arcProgressionIndex = Math.min(Math.floor((chapter.number / manuscript.chapters.length) * arcStages.length), arcStages.length - 1);
    const romanceArcPosition = arcStages[arcProgressionIndex];

    chapter.blocks.forEach(block => {
      if (block.type === 'dialogue') dialogueBlocks++;
      if (block.type === 'narrative') narrativeBlocks++;

      // 1. Pacing Analysis
      const baselineDiag = profile ? profile.dialogueRatio : 0.4;
      const narrativeThreshold = baselineDiag < 0.2 ? 400 : 300; // Allow longer paragraphs if author writes dense narrative
      if (block.type === 'narrative' && block.wordCount > narrativeThreshold) {
          pacingFlags++;
          flags.push({
             id: generateId(),
             type: 'pacing',
             severity: 'warning',
             message: '⚠ Dragging Scene: Long unbroken narrative block without tension shifts.',
             blockStartIndex: block.startIndex
          });
      }

      // 2. Prose Discipline
      const passiveMatches = block.content.match(PASSIVE_VOICE_REGEX);
      const overwrittenMatches = block.content.match(OVERWRITTEN_REGEX);
      
      if (passiveMatches) {
          proseFlags += passiveMatches.length;
          flags.push({
             id: generateId(),
             type: 'prose',
             severity: 'warning',
             message: '⚠ Passive Construction Detected.',
             blockStartIndex: block.startIndex
          });
      }
      
      if (overwrittenMatches) {
        proseFlags += overwrittenMatches.length;
        flags.push({
           id: generateId(),
           type: 'prose',
           severity: 'warning',
           message: '⚠ Overwritten Sentence / Modifier Overload.',
           blockStartIndex: block.startIndex
        });
      }

      // 3. AI Writing Patterns
      const aiMatches = block.content.match(AI_SYMMETRICAL_REGEX);
      if (aiMatches) {
          aiFlags += aiMatches.length;
          globalAiPatterns += aiMatches.length;
          flags.push({
             id: generateId(),
             type: 'ai_pattern',
             severity: 'error',
             message: '⚠ AI Pattern Detected: Mechanical/Symmetrical Sentence Structure.',
             blockStartIndex: block.startIndex
          });
      }

      // 4. Claustrophobia Engine
      const claustroMatches = block.content.match(CLAUSTROPHOBIA_REGEX);
      if (claustroMatches) {
          claustrophobiaHits += claustroMatches.length;
      }

      // 5. Predator Presence
      const predatorMatches = block.content.match(PREDATOR_REGEX);
      if (predatorMatches) {
          predatorHits += predatorMatches.length;
      }

      // 6. Surveillance & Obsession
      const surviellanceMatches = block.content.match(SURVEILLANCE_REGEX);
      if (surviellanceMatches) surveillanceHits += surviellanceMatches.length;

      const textLower = block.content.toLowerCase();
      OBSESSION_VOCAB.forEach(v => {
          if (textLower.includes(v)) obsessionHits++;
      });
    });

    // Score calculations
    const chPacingScore = Math.max(0, 100 - (pacingFlags * 10));
    const chProseScore = Math.max(0, 100 - (proseFlags * 5));
    
    // Normalize specialty scores based on hits per 1000 words
    const chapterKWords = Math.max(0.1, chapter.wordCount / 1000);
    const claustroDensity = claustrophobiaHits / chapterKWords;
    const predatorDensity = predatorHits / chapterKWords;

    const chClaustroScore = Math.min(100, Math.round(claustroDensity * 10)); // e.g., 10 hits/kword = 100
    const chPredatorScore = Math.min(100, Math.round(predatorDensity * 10));

    // Flags for missing specialty elements
    const blockStart = chapter.blocks[0] ? chapter.blocks[0].startIndex : 0;
    
    if (chapter.wordCount > 500 && chClaustroScore < 20) {
        flags.push({ id: generateId(), type: 'claustrophobia', severity: 'info', message: '⚠ Scene Feels Spatially Empty: Missing physical boundaries or environmental tension.', blockStartIndex: blockStart });
    }

    if (chapter.wordCount > 500 && chPredatorScore < 15) {
        flags.push({ id: generateId(), type: 'predator', severity: 'info', message: '⚠ Predator Presence Weak: Lack of control, observation, or quiet authority cues.', blockStartIndex: blockStart });
    }

    if (chapter.wordCount > 500 && surveillanceHits === 0) {
        flags.push({ id: generateId(), type: 'surveillance', severity: 'info', message: '⚠ Surveillance Motif Missing: No references to being watched or monitored.', blockStartIndex: blockStart });
    }

    if (chapter.wordCount > 500 && obsessionHits < 3) {
        flags.push({ id: generateId(), type: 'obsession', severity: 'warning', message: '⚠ Obsession Language Missing: Possible tone drift toward generic romance.', blockStartIndex: blockStart });
    }

    const totalBlocks = dialogueBlocks + narrativeBlocks;
    const chapterDialogueRatio = totalBlocks > 0 ? dialogueBlocks / totalBlocks : 0;
    const baselineDiag = profile ? profile.dialogueRatio : 0.4;
    
    if (chapterDialogueRatio > baselineDiag + 0.3) {
        flags.push({ id: generateId(), type: 'silence', severity: 'warning', message: '⚠ Dialogue Overload: Missing silent tension beats compared to your baseline.', blockStartIndex: blockStart });
    }

    globalPacingScore += chPacingScore;
    globalProseDiscipline += chProseScore;
    globalClaustrophobia += chClaustroScore;
    globalPredator += chPredatorScore;

    return {
      chapterNumber: chapter.number,
      pacingScore: chPacingScore,
      romanceArcPosition,
      proseDisciplineScore: chProseScore,
      claustrophobiaScore: chClaustroScore,
      predatorScore: chPredatorScore,
      flags
    };
  });

  const numChapters = chapterDiagnostics.length || 1;

  return {
    overallPacing: Math.round(globalPacingScore / numChapters),
    overallProseDiscipline: Math.round(globalProseDiscipline / numChapters),
    aiPatternDetections: globalAiPatterns,
    overallClaustrophobia: Math.round(globalClaustrophobia / numChapters),
    overallPredatorPresence: Math.round(globalPredator / numChapters),
    chapterDiagnostics
  };
};
