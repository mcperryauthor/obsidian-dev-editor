import React, { useState } from 'react';
import type { ParsedManuscript } from '../lib/parser';
import type { StyleBaselineProfile } from '../lib/calibration';
import { generateCalibrationProfile } from '../lib/calibration';

interface CalibrationModuleProps {
  parsedData: ParsedManuscript;
  onProfileGenerated: (profile: StyleBaselineProfile) => void;
  activeProfile: StyleBaselineProfile | null;
}

const CalibrationModule: React.FC<CalibrationModuleProps> = ({ parsedData, onProfileGenerated, activeProfile }) => {
  const [selectedChapterNumbers, setSelectedChapterNumbers] = useState<number[]>([]);
  
  const toggleChapter = (num: number) => {
    if (selectedChapterNumbers.includes(num)) {
      setSelectedChapterNumbers(selectedChapterNumbers.filter(n => n !== num));
    } else {
      setSelectedChapterNumbers([...selectedChapterNumbers, num]);
    }
  };

  const handleCalibrate = () => {
    const chaptersToProfile = parsedData.chapters.filter(c => selectedChapterNumbers.includes(c.number));
    if (chaptersToProfile.length === 0) return;

    const profile = generateCalibrationProfile(chaptersToProfile);
    onProfileGenerated(profile);
  };

  if (activeProfile) {
    return (
      <div style={{ background: 'var(--color-bg-base)', padding: 'var(--spacing-md)', borderRadius: '4px', border: '1px solid var(--color-crimson-dark)', marginBottom: 'var(--spacing-md)'}}>
         <h3 style={{ fontSize: '0.9rem', color: 'var(--color-crimson-main)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
             Style Baseline Profile
             <span style={{ color: 'var(--color-flag-warning)' }}>{activeProfile.confidenceScore}% Acc</span>
         </h3>
         <div style={{ fontSize: '0.85rem' }}>
             <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span>Sentence Avg:</span>
                 <span style={{ color: 'var(--color-text-main)' }}>{activeProfile.averageSentenceLength} words</span>
             </p>
             <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span>Fragment Freq:</span>
                 <span style={{ color: 'var(--color-text-main)' }}>{activeProfile.fragmentFrequency}</span>
             </p>
             <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span>Dialogue Ratio:</span>
                 <span style={{ color: 'var(--color-text-main)' }}>{(activeProfile.dialogueRatio * 100).toFixed(0)}%</span>
             </p>
             <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span>Reaction Beats:</span>
                 <span style={{ color: 'var(--color-text-main)' }}>{activeProfile.reactionBeatDensity}</span>
             </p>
         </div>
         <button onClick={() => onProfileGenerated(null as any)} style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem', padding: '6px', backgroundColor: 'transparent', border: '1px solid var(--color-border)' }}>Recalibrate</button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg-base)', padding: 'var(--spacing-md)', borderRadius: '4px', border: '1px solid var(--color-flag-warning)', marginBottom: 'var(--spacing-md)'}}>
      <h3 style={{ fontSize: '0.8rem', color: 'var(--color-flag-warning)', textTransform: 'uppercase', marginBottom: '12px' }}>Requires Calibration</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
        Select 2-3 chapters that best reflect your intended Dark Romance prose style to generate a baseline.
      </p>

      <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', padding: '4px' }}>
         {parsedData.chapters.map(ch => (
           <label key={ch.number} style={{ display: 'flex', alignItems: 'center', padding: '6px', fontSize: '0.8rem', cursor: 'pointer', borderBottom: '1px solid var(--color-border-subtle)' }}>
               <input 
                 type="checkbox" 
                 style={{ marginRight: '8px' }}
                 checked={selectedChapterNumbers.includes(ch.number)}
                 onChange={() => toggleChapter(ch.number)}
               />
               <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.title}</span>
               <span style={{ color: 'var(--color-text-muted)' }}>{ch.wordCount}w</span>
           </label>
         ))}
      </div>

      <button 
        onClick={handleCalibrate} 
        disabled={selectedChapterNumbers.length === 0}
        style={{ width: '100%', opacity: selectedChapterNumbers.length === 0 ? 0.5 : 1 }}
      >
        Run Calibration Engine
      </button>
    </div>
  );
};

export default CalibrationModule;
