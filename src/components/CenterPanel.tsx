import React from 'react';
import ManuscriptInput from './ManuscriptInput';
import type { ParsedManuscript } from '../lib/parser';
import type { CoreAnalysisReport } from '../lib/analysis';

interface CenterPanelProps {
  manuscriptText: string;
  parsedData: ParsedManuscript | null;
  analysisReport: CoreAnalysisReport | null;
  onLoadManuscript: (text: string) => void;
}

const CenterPanel: React.FC<CenterPanelProps> = ({ manuscriptText, parsedData, analysisReport, onLoadManuscript }) => {
  return (
    <div className="center-panel">
      <div className="panel-header" style={{ justifyContent: 'center' }}>
        <span>Obsidian Dev Editor <span style={{color: 'var(--color-text-muted)', fontWeight: 400}}>|</span> Dark Romance Engine</span>
      </div>
      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {!manuscriptText ? (
           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <ManuscriptInput onLoad={onLoadManuscript} />
           </div>
        ) : (
          <div style={{
             fontFamily: 'var(--font-manuscript)',
             padding: '2rem',
             maxWidth: '800px',
             margin: '0 auto',
             color: 'var(--color-text-main)',
          }}>
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1rem' }}>
                 <button onClick={() => onLoadManuscript('')} style={{ background: 'transparent', border: '1px solid var(--color-border)', fontSize: '0.8rem', padding: '4px 8px' }}>Clear Manuscript</button>
              </div>

              {!parsedData ? (
                <div style={{ color: 'var(--color-text-muted)' }}>Parsing...</div>
              ) : (
                <div>
                   {parsedData.chapters.map(ch => {
                     const chFlags = analysisReport?.chapterDiagnostics.find(cd => cd.chapterNumber === ch.number)?.flags || [];
                     
                     return (
                     <div key={ch.number} style={{ marginBottom: '3rem' }}>
                        {ch.title && <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 600 }}>{ch.title}</h2>}
                        {ch.blocks.filter(b => b.type !== 'chapter_heading').map((b, i) => {
                          const blockFlags = chFlags.filter(f => f.blockStartIndex === b.startIndex);
                          
                          return (
                          <div key={i} style={{ marginBottom: b.type === 'scene_break' ? '2rem' : '1rem' }}>
                              <div style={{
                                  marginTop: b.type === 'scene_break' ? '2rem' : '0',
                                  textAlign: b.type === 'scene_break' ? 'center' : 'left',
                                  fontSize: '1.2rem',
                                  lineHeight: 1.8,
                                  color: b.type === 'scene_break' ? 'var(--color-crimson-main)' : 'var(--color-text-main)',
                                  fontWeight: b.type === 'scene_break' ? 700 : 400,
                                  borderLeft: blockFlags.length > 0 ? '2px solid var(--color-flag-warning)' : 'none',
                                  paddingLeft: blockFlags.length > 0 ? '1rem' : '0'
                              }}>
                                  {b.content}
                              </div>
                              
                              {blockFlags.length > 0 && (
                                <div style={{ 
                                  marginTop: '8px', 
                                  marginLeft: '1rem', 
                                  padding: '8px', 
                                  backgroundColor: 'var(--color-bg-elevated)', 
                                  borderLeft: '2px solid var(--color-flag-error)',
                                  fontSize: '0.85rem',
                                  fontFamily: 'var(--font-ui)',
                                  color: 'var(--color-text-muted)'
                                }}>
                                  {blockFlags.map(f => (
                                    <div key={f.id} style={{ marginBottom: '4px' }}>
                                      <strong style={{ color: f.severity === 'error' ? 'var(--color-flag-error)' : 'var(--color-flag-warning)' }}>{f.message}</strong>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        )})}
                     </div>
                   )})}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterPanel;
