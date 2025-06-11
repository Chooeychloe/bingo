import React, { useState, useEffect } from "react";
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

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        // Default to English voice if available
        const englishVoice =
          availableVoices.find((voice) => voice.lang.includes("en")) ||
          availableVoices[0];
        setSelectedVoice(englishVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  const generateBingoNumber = () => {
    const availableNumbers = [];

    for (let i = 1; i <= 75; i++) {
      if (!calledNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      alert("All numbers have been called!");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  };

  const callNumber = () => {
    const newNumber = generateBingoNumber();
    if (newNumber) {
      setCurrentNumber(newNumber);
      setCalledNumbers([...calledNumbers, newNumber]);

      if (audioEnabled && selectedVoice) {
        speakNumber(newNumber);
      }
    }
  };

  const speakNumber = (number) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance();
    speech.text = getNumberPhrase(number);
    speech.rate = 0.9;
    speech.voice = selectedVoice;
    window.speechSynthesis.speak(speech);
  };

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

  const toggleAutoCall = () => {
    setIsAutoCalling(!isAutoCalling);
  };

  const resetGame = () => {
    setCalledNumbers([]);
    setCurrentNumber(null);
    setIsAutoCalling(false);
    window.speechSynthesis.cancel();
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  useEffect(() => {
    let interval;
    if (isAutoCalling) {
      interval = setInterval(() => {
        callNumber();
      }, callSpeed);
    }
    return () => clearInterval(interval);
  }, [isAutoCalling, calledNumbers, callSpeed, audioEnabled, selectedVoice]);

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
        <header>
          <h1>Bingo Caller</h1>
          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>

        <div className="current-number-container">
          {currentNumber ? (
            <>
              <div className="current-letter">{getLetter(currentNumber)}</div>
              <div className="current-number">{currentNumber}</div>
            </>
          ) : (
            <div className="no-number">Click "Call Number" to start</div>
          )}
        </div>

        <div className="controls">
          <button onClick={callNumber} disabled={isAutoCalling}>
            Call Number
          </button>

          <button onClick={toggleAutoCall}>
            {isAutoCalling ? "Stop Auto Call" : "Start Auto Call"}
          </button>

          <button onClick={resetGame}>Reset Game</button>

          <div className="toggle-group">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={() => setAudioEnabled(!audioEnabled)}
              />
              <span className="slider"></span>
              <span className="toggle-label">Audio</span>
            </label>

            {voices.length > 0 && (
              <select
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
            )}
          </div>
        </div>

        <div className="speed-control">
          <label>Call Speed:</label>
          <input
            type="range"
            min="3000"
            max="5000"
            step="500"
            value={callSpeed}
            onChange={(e) => setCallSpeed(Number(e.target.value))}
          />
          <span>{callSpeed / 1000}s</span>
        </div>

        <div className="called-numbers">
          <h2>Called Numbers</h2>
          <div className="called-numbers-grid">
            {calledNumbers.map((num, index) => (
              <div key={index} className="called-number">
                <span>
                  {getLetter(num)}-{num}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
