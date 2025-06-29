import React, { useState, useEffect, useRef } from 'react';

export default function AudioVideoSyncTester() {
  const [intervalMs, setIntervalMs] = useState(1000);
  const [flash, setFlash] = useState(false);
  const [offsetMs, setOffsetMs] = useState(0);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const playBeep = () => {
    const now = audioCtxRef.current.currentTime;
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    oscillator.frequency.value = 1000;
    gainNode.gain.setValueAtTime(1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    oscillator.start(now + offsetMs / 1000);
    oscillator.stop(now + 0.1 + offsetMs / 1000);
  };

  const triggerSync = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
    playBeep();
  };

  const startTest = () => {
    clearInterval(timerRef.current);
    triggerSync();
    timerRef.current = setInterval(triggerSync, intervalMs);
  };

  const stopTest = () => {
    clearInterval(timerRef.current);
  };

  return (
    <div>
      <h1>🧪 Test de Synchronisation Audio / Vidéo</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          ⏱ Intervalle :
          <input
            type="number"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '80px' }}
          />
          ms
        </label>

        <label style={{ marginLeft: '1rem' }}>
          🎚 Décalage audio :
          <input
            type="number"
            value={offsetMs}
            onChange={(e) => setOffsetMs(Number(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '60px' }}
          />
          ms
        </label>

        <button onClick={startTest} style={{ marginLeft: '1rem' }}>▶️ Démarrer</button>
        <button onClick={stopTest} style={{ marginLeft: '1rem' }}>⏹ Stop</button>
      </div>

      <div
        style={{
          width: '100%',
          height: '400px',
          backgroundColor: flash ? '#00ff00' : '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: flash ? 'black' : '#666',
          fontSize: '3rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          transition: 'background-color 0.1s',
        }}
      >
        {flash ? 'BEEP' : '●'}
      </div>

      <p style={{ marginTop: '1rem', color: '#555', fontSize: '14px', maxWidth: '600px' }}>
        Utilisez ce test pour identifier un éventuel décalage entre l'audio et la vidéo.
        Si le "BEEP" ne coïncide pas exactement avec l’apparition du carré vert ou du mot, 
        vous avez probablement un retard à corriger sur votre matériel.
      </p>
    </div>
  );
}
