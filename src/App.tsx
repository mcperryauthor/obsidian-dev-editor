import { useState, useEffect } from 'react';
import './App.css';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import type { ParsedManuscript } from './lib/parser';
import { parseManuscript } from './lib/parser';
import type { StyleBaselineProfile } from './lib/calibration';
import type { CoreAnalysisReport } from './lib/analysis';
import { runCoreAnalysis } from './lib/analysis';

function App() {
  const [manuscriptText, setManuscriptText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedManuscript | null>(null);
  const [activeProfile, setActiveProfile] = useState<StyleBaselineProfile | null>(null);
  const [analysisReport, setAnalysisReport] = useState<CoreAnalysisReport | null>(null);

  useEffect(() => {
    if (manuscriptText) {
      const parsed = parseManuscript(manuscriptText);
      setParsedData(parsed);
      setAnalysisReport(runCoreAnalysis(parsed, activeProfile));
    } else {
      setParsedData(null);
      setActiveProfile(null);
      setAnalysisReport(null);
    }
  }, [manuscriptText, activeProfile]);

  return (
    <div className="app-container">
      <LeftPanel parsedData={parsedData} />
      <CenterPanel 
        manuscriptText={manuscriptText} 
        parsedData={parsedData} 
        analysisReport={analysisReport}
        onLoadManuscript={setManuscriptText} 
      />
      <RightPanel 
        parsedData={parsedData} 
        activeProfile={activeProfile} 
        analysisReport={analysisReport}
        onProfileGenerated={setActiveProfile} 
      />
    </div>
  );
}

export default App;
