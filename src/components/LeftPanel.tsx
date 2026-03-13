import React from 'react';
import type { ParsedManuscript } from '../lib/parser';

interface LeftPanelProps {
  parsedData: ParsedManuscript | null;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ parsedData }) => {
  return (
    <div className="left-panel">
      <div className="panel-header">
        <span>Manuscript Navigation</span>
      </div>
      <div className="panel-content">
        {!parsedData ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Upload a manuscript to begin.
          </p>
        ) : (
          <div>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Chapters</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {parsedData.chapters.map(ch => (
                <li key={ch.number} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'color 0.2sease' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{ch.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{ch.wordCount.toLocaleString()} words</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
