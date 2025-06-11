import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isAutoCalling, setIsAutoCalling] = useState(false);
  const [callSpeed, setCallSpeed] = useState(3000);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
 const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Load available voices - memoized to prevent unnecessary re-renders
  const loadVoices = useCallback(() => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    if (availableVoices.length > 0 && !selectedVoice) {
      const englishVoice =
        availableVoices.find((voice) => voice.lang.includes("en")) ||
        availableVoices[0];
      setSelectedVoice(englishVoice);
    }
  }, [selectedVoice]);

  useEffect(() => {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

   const showGameOverPopup = useCallback(() => {
      setPopupMessage("All numbers have been called!");
      setShowPopup(true);
      setIsAutoCalling(false);
    }, []);

  // Memoized number generation
  const generateBingoNumber = useCallback(() => {
    const availableNumbers = [];
    for (let i = 1; i <= 75; i++) {
      if (!calledNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }
    if (availableNumbers.length === 0) {
      showGameOverPopup();
      return null;
    }
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  }, [calledNumbers, showGameOverPopup]);

  // Memoized number calling
  const callNumber = useCallback(() => {
    const newNumber = generateBingoNumber();
    if (newNumber) {
      setCurrentNumber(newNumber);
      setCalledNumbers((prev) => [...prev, newNumber]);

      if (audioEnabled && selectedVoice) {
        speakNumber(newNumber);
      }
    }
  }, [generateBingoNumber, audioEnabled, selectedVoice]);

  const speakNumber = useCallback(
    (number) => {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance();
      speech.text = getNumberPhrase(number);
      speech.rate = 0.9;
      speech.voice = selectedVoice;
      window.speechSynthesis.speak(speech);
    },
    [selectedVoice]
  );

  const getNumberPhrase = (number) => {
    const letter =
      number <= 15
        ? "B"
        : number <= 30
        ? "I"
        : number <= 45
        ? "N"
        : number <= 60
        ? "G"
        : "O";
    return `${letter} ${number}`;
  };
 const closePopup = () => {
    setShowPopup(false);
  };
  const toggleAutoCall = useCallback(() => {
    setIsAutoCalling((prev) => !prev);
  }, []);

  const resetGame = useCallback(() => {
    setCalledNumbers([]);
    setCurrentNumber(null);
    setIsAutoCalling(false);
    window.speechSynthesis.cancel();
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  useEffect(() => {
    let interval;
    if (isAutoCalling) {
      interval = setInterval(callNumber, callSpeed);
    }
    return () => clearInterval(interval);
  }, [isAutoCalling, callNumber, callSpeed]);

  const getLetter = (number) => {
    if (!number) return "";
    return number <= 15
      ? "B"
      : number <= 30
      ? "I"
      : number <= 45
      ? "N"
      : number <= 60
      ? "G"
      : "O";
  };

  return (
    <div className="app-container">
      <div className={`bingo-caller ${darkMode ? "dark" : "light"}`}>
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">Dhan's</h1>
            <img height="100px" width="100px" src="/vite.svg"></img>
            <h1 className="app-title">Caller</h1>

            
          </div>
          <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
        </header>

        <main className="main-content">
          <div className="current-number-container">
            {currentNumber ? (
              <>
                <div className="current-letter">{getLetter(currentNumber)}</div>
                <div className="current-number">{currentNumber}</div>
              </>
            ) : (
              <div className="no-number">Tap "Call Number" to start</div>
            )}
          </div>

          <div className="controls">
            <div className="button-group">
              <button
                onClick={callNumber}
                disabled={isAutoCalling}
                className="control-button"
              >
                Call Number
              </button>
              <button
                onClick={toggleAutoCall}
                className={`control-button ${isAutoCalling ? "active" : ""}`}
              >
                {isAutoCalling ? "Stop Auto" : "Start Auto"}
              </button>
              <button onClick={resetGame} className="control-button">
                Reset
              </button>
            </div>

            <div className="settings-group">
              <label className="toggle-container">
                <span className="toggle-label">Audio</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={audioEnabled}
                    onChange={() => setAudioEnabled(!audioEnabled)}
                    id="audio-toggle"
                  />
                  <span className="slider"></span>
                </div>
              </label>

              {voices.length > 0 && (
                <div className="voice-select-container">
                  <label htmlFor="voice-select" className="sr-only">
                    Select Voice
                  </label>
                  <select
                    id="voice-select"
                    value={selectedVoice ? selectedVoice.voiceURI : ""}
                    onChange={(e) => {
                      const voice = voices.find(
                        (v) => v.voiceURI === e.target.value
                      );
                      setSelectedVoice(voice);
                    }}
                    className="voice-select"
                    disabled={!audioEnabled}
                  >
                    {voices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="speed-control">
              <label htmlFor="speed-slider">Speed: {callSpeed / 1000}s</label>
              <input
                id="speed-slider"
                type="range"
                min="1000"
                max="5000"
                step="500"
                value={callSpeed}
                onChange={(e) => setCallSpeed(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="called-numbers">
            <h2 className="called-numbers-title">
              Called Numbers ({calledNumbers.length})
            </h2>
            <div className="called-numbers-grid">
              {calledNumbers.map((num, index) => (
                <div key={index} className="called-number">
                  <span className="called-number-text">
                    {getLetter(num)}-{num}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
         {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3 className="popup-title">Game Over</h3>
              <p className="popup-message">{popupMessage}</p>
              <button 
                onClick={closePopup}
                className="popup-button"
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
