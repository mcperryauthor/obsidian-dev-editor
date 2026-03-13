import React from 'react';
import type { ParsedManuscript } from '../lib/parser';
import type { StyleBaselineProfile } from '../lib/calibration';
import type { CoreAnalysisReport } from '../lib/analysis';
import CalibrationModule from './CalibrationModule';

interface RightPanelProps {
  parsedData: ParsedManuscript | null;
  activeProfile: StyleBaselineProfile | null;
  analysisReport: CoreAnalysisReport | null;
  onProfileGenerated: (profile: StyleBaselineProfile) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ parsedData, activeProfile, analysisReport, onProfileGenerated }) => {
  return (
    <div className="right-panel">
      <div className="panel-header">
        <span>Diagnostics Dashboard</span>
      </div>
      <div className="panel-content">
        {!parsedData ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No diagnostics available.
          </p>
        ) : (
          <div style={{ marginTop: 'var(--spacing-sm)'}}>
              <CalibrationModule 
                  parsedData={parsedData} 
                  activeProfile={activeProfile} 
                  onProfileGenerated={onProfileGenerated} 
              />
              
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)'}}>Manuscript Overview</h3>
              <div style={{ background: 'var(--color-bg-base)', padding: 'var(--spacing-md)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', marginBottom: 'var(--spacing-md)'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                      <span>Total Words</span>
                      <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{parsedData.totalWordCount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Total Chapters</span>
                      <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{parsedData.chapters.length}</span>
                  </div>
              </div>

              {analysisReport && (
                <>
                  <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)'}}>Core Engine</h3>
                   <div style={{ background: 'var(--color-bg-base)', padding: 'var(--spacing-md)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', marginBottom: 'var(--spacing-md)'}}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                           <span>Pacing Score</span>
                           <span style={{ color: analysisReport.overallPacing < 70 ? 'var(--color-flag-warning)' : 'var(--color-text-main)' }}>{analysisReport.overallPacing}/100</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                           <span>Prose Discipline</span>
                           <span style={{ color: analysisReport.overallProseDiscipline < 70 ? 'var(--color-flag-warning)' : 'var(--color-text-main)' }}>{analysisReport.overallProseDiscipline}/100</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                           <span>AI Patterns Detected</span>
                           <span style={{ color: analysisReport.aiPatternDetections > 0 ? 'var(--color-flag-error)' : 'var(--color-text-muted)' }}>{analysisReport.aiPatternDetections}</span>
                       </div>
                   </div>

                   <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)'}}>Dark Romance Specialty</h3>
                   <div style={{ background: 'var(--color-bg-base)', padding: 'var(--spacing-md)', borderRadius: '4px', border: '1px solid var(--color-crimson-dark)', marginBottom: 'var(--spacing-md)'}}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                           <span>Claustrophobia Index</span>
                           <span style={{ color: analysisReport.overallClaustrophobia < 30 ? 'var(--color-flag-warning)' : 'var(--color-text-main)' }}>{analysisReport.overallClaustrophobia}/100</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                           <span>Predator Presence</span>
                           <span style={{ color: analysisReport.overallPredatorPresence < 30 ? 'var(--color-flag-warning)' : 'var(--color-text-main)' }}>{analysisReport.overallPredatorPresence}/100</span>
                       </div>
                   </div>

                   <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)'}}>Chapter Breakdown</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
                      {analysisReport.chapterDiagnostics.map(cd => (
                         <div key={cd.chapterNumber} style={{ background: 'var(--color-bg-base)', padding: 'var(--spacing-sm)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--color-crimson-main)' }}>
                                <strong>Ch {cd.chapterNumber}</strong>
                                <span>{cd.romanceArcPosition}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                                <span>Pacing: {cd.pacingScore}</span>
                                <span>Flags: {cd.flags.length}</span>
                            </div>
                         </div>
                      ))}
                   </div>

                   <button 
                     onClick={() => {
                        const exportData = {
                          metrics: {
                             totalWords: parsedData.totalWordCount,
                             totalChapters: parsedData.chapters.length,
                          },
                          calibrationProfile: activeProfile,
                          analysisReport: analysisReport
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'obsidian_dev_editor_report.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                     }}
                     style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                   >
                     Export Full Report (JSON)
                   </button>
                </>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
