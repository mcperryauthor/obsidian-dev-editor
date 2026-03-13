export interface ParsedBlock {
  type: 'chapter_heading' | 'scene_break' | 'dialogue' | 'narrative';
  content: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  chapterNumber?: number;
}

export interface ParsedChapter {
  number: number;
  title: string;
  blocks: ParsedBlock[];
  wordCount: number;
}

export interface ParsedManuscript {
  chapters: ParsedChapter[];
  totalWordCount: number;
}

/**
 * Parses raw manuscript text into structured chapters and blocks.
 */
export const parseManuscript = (rawText: string): ParsedManuscript => {
  const chapters: ParsedChapter[] = [];
  const lines = rawText.split(/\r?\n/);
  
  let currentChapter: ParsedChapter | null = null;
  let currentChapterNumber = 0;
  
  let currentStartIndex = 0;
  
  const finishChapter = () => {
    if (currentChapter) {
        currentChapter.wordCount = currentChapter.blocks.reduce((sum, b) => sum + b.wordCount, 0);
        chapters.push(currentChapter);
    }
  };

  const createNewChapter = (title: string) => {
    finishChapter();
    currentChapterNumber++;
    currentChapter = {
      number: currentChapterNumber,
      title: title.trim(),
      blocks: [],
      wordCount: 0
    };
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const lineStartIndex = currentStartIndex;
    currentStartIndex += line.length + 1; // +1 for the newline

    if (!trimmedLine) continue; // Skip empty lines entirely for the structural blocks

    // 1. Detect Chapter Headings
    // Matches "Chapter 1", "CHAPTER ONE", "# Chapter 12", etc.
    const chapterRegex = /^(?:#+\s*)?chapter\s+(?:\d+|[a-z]+)/i;
    if (chapterRegex.test(trimmedLine) || (i === 0 && !currentChapter)) { 
        // Force the first line to be a chapter if we don't have one, just to catch pre-chapter-1 text
        // Or if it matches our regex
        const title = chapterRegex.test(trimmedLine) ? trimmedLine : (i === 0 ? "Prologue / Intro" : trimmedLine);
        createNewChapter(title);
        
        currentChapter!.blocks.push({
            type: 'chapter_heading',
            content: trimmedLine,
            startIndex: lineStartIndex,
            endIndex: lineStartIndex + line.length,
            wordCount: trimmedLine.split(/\s+/).length,
            chapterNumber: currentChapterNumber
        });
        continue;
    }

    // Ensure we have a chapter to put things into
    if (!currentChapter) {
        createNewChapter('Start');
    }

    // 2. Detect Scene Breaks
    // Matches "***", "---", "* * *", etc.
    const sceneBreakRegex = /^[\*\-\~]{3,}\s*$|^(\*\s*){3,}$/;
    if (sceneBreakRegex.test(trimmedLine)) {
        currentChapter!.blocks.push({
            type: 'scene_break',
            content: trimmedLine,
            startIndex: lineStartIndex,
            endIndex: lineStartIndex + line.length,
            wordCount: 0,
            chapterNumber: currentChapterNumber
        });
        continue;
    }

    // 3. Detect Dialogue vs Narrative
    // Dialogue typically starts with double or single quotes
    const isDialogue = /^["“']/.test(trimmedLine);
    
    currentChapter!.blocks.push({
        type: isDialogue ? 'dialogue' : 'narrative',
        content: trimmedLine,
        startIndex: lineStartIndex,
        endIndex: lineStartIndex + line.length,
        wordCount: trimmedLine.split(/\s+/).length,
        chapterNumber: currentChapterNumber
    });
  }
  
  finishChapter(); // Flush the last chapter

  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return {
    chapters,
    totalWordCount
  };
};
