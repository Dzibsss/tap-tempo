import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';

const MAX_TAP_SAMPLES = 12;

function App() {
  const [bpm, setBpm] = useState<number | null>(null);
  const [taps, setTaps] = useState<number[]>([]);
  const [isTapping, setIsTapping] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleTap = useCallback(() => {
    const now = performance.now();
    setIsTapping(true);
    
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsTapping(false), 100);

    setTaps((prevTaps) => {
      const newTaps = [...prevTaps, now].slice(-MAX_TAP_SAMPLES);
      
      if (newTaps.length > 1) {
        const intervals = [];
        for (let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        const calculatedBpm = 60000 / avgInterval;
        setBpm(Math.round(calculatedBpm));
      }
      
      return newTaps;
    });
  }, []);

  const reset = useCallback(() => {
    setTaps([]);
    setBpm(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      handleTap();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [handleTap]);

  return (
    <div className="app-container">
      <header className="app-header">
        TAP TEMPO APP
      </header>

      <div 
        className={`tap-zone ${isTapping ? 'active' : ''}`} 
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            handleTap();
          }
        }}
      >
        <div className="display-group">
          <h1 className="bpm-display">
            {bpm !== null ? bpm : '--'}
          </h1>
          <p className="bpm-label">BPM</p>
        </div>

        <div className="info-text">
          {taps.length === 0 
            ? "Tap any key or touch the screen to start" 
            : taps.length === 1 
              ? "Keep tapping..." 
              : `${taps.length} taps recorded`}
        </div>

        <button className="reset-button" onClick={(e) => {
          e.stopPropagation();
          reset();
        }}>
          RESET
        </button>
      </div>

      <footer className="app-footer">
        made by Dziadkoviec
      </footer>
    </div>
  );
}

export default App;
