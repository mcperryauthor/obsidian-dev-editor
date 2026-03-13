import React, { useCallback, useState } from 'react';
import * as mammoth from 'mammoth';

interface ManuscriptInputProps {
  onLoad: (text: string) => void;
}

const ManuscriptInput: React.FC<ManuscriptInputProps> = ({ onLoad }) => {
  const [pasteText, setPasteText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    processFile(file);
  }, [onLoad]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        onLoad(text);
      } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onLoad(result.value);
      } else {
        setError('Unsupported file type. Please upload a .txt or .docx file.');
      }
    } catch (err: any) {
      setError(`Failed to read file: ${err.message}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-manuscript)' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text-main)', fontWeight: 400, fontStyle: 'italic' }}>Load Manuscript</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        Upload your `.txt` or `.docx` file, or paste your text directly to begin the diagnostic analysis.
      </p>

      {error && <div style={{ color: 'var(--color-crimson-bright)', marginBottom: '1rem' }}>{error}</div>}

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleFileDrop}
        style={{
          border: `2px dashed ${isHovering ? 'var(--color-crimson-bright)' : 'var(--color-border-subtle)'}`,
          backgroundColor: isHovering ? 'var(--color-bg-base)' : 'var(--color-bg-elevated)',
          padding: '3rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
      }}>
        <input 
          type="file" 
          accept=".txt,.docx" 
          onChange={handleFileInput} 
          style={{ display: 'none' }} 
          id="file-upload" 
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{ fontSize: '1.2rem', color: isHovering ? 'var(--color-crimson-main)' : 'var(--color-text-muted)' }}>
            Drag & Drop your file here <br/> <br/> or click to browse
          </div>
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          placeholder="Or paste manuscript text here..."
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          style={{
            width: '100%',
            height: '250px',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)',
            padding: '1rem',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.9rem',
            resize: 'vertical',
            borderRadius: '4px'
          }}
        />
        <button 
          onClick={() => {
            if (pasteText.trim()) onLoad(pasteText);
          }}
          disabled={!pasteText.trim()}
          style={{ opacity: pasteText.trim() ? 1 : 0.5, alignSelf: 'center', padding: '12px 32px' }}
        >
          Analyze Pasted Text
        </button>
      </div>
    </div>
  );
};

export default ManuscriptInput;
