/*
 * Copyright (C) 2025 Thomas Gouazé
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect, useRef } from 'react';

export default function AudioVideoSyncTester() {
  const [intervalMs, setIntervalMs] = useState(2000);
  const [flash, setFlash] = useState(false);
  const [offsetMs, setOffsetMs] = useState(0);
  const offsetRef = useRef(0); // <-- Ref pour décalage audio
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);
  const [externalWindow, setExternalWindow] = useState(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  // Mettre à jour la ref si offsetMs change
  useEffect(() => {
    offsetRef.current = offsetMs;
  }, [offsetMs]);

  const playBeep = () => {
    const now = audioCtxRef.current.currentTime;
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    oscillator.frequency.value = 1000;
    gainNode.gain.setValueAtTime(1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  };

  const triggerSync = () => {
    const delay = offsetRef.current; // lire la ref, toujours à jour

    setFlash(true);
    if (externalWindow && !externalWindow.closed) {
      const el = externalWindow.document.getElementById('flashText');
      if (el) {
        el.style.backgroundColor = '#00ff00';
        el.innerText = 'BEEP';
        setTimeout(() => {
          el.style.backgroundColor = 'black';
          el.innerText = '●';
        }, 100);
      }
    }

    setTimeout(() => setFlash(false), 100);
    setTimeout(() => playBeep(), delay);
  };

  const startTest = () => {
    clearInterval(timerRef.current);
    triggerSync();
    timerRef.current = setInterval(triggerSync, intervalMs);
  };

  const stopTest = () => {
    clearInterval(timerRef.current);
  };

  const openExternalWindow = () => {
    const win = window.open('', '', 'width=800,height=600');
    if (win) {
      win.document.title = 'Test de synchro AV';
      win.document.body.style.margin = 0;
      win.document.body.style.backgroundColor = 'black';
      win.document.body.style.display = 'flex';
      win.document.body.style.alignItems = 'center';
      win.document.body.style.justifyContent = 'center';
      win.document.body.style.color = 'white';
      win.document.body.style.fontSize = '48px';
      win.document.body.innerHTML = '<div id="flashText" style="background:black; color:white">●</div>';
      setExternalWindow(win);
    }
  };

  return (
    <div>
      <h1>🧪 Audio / Vidéo sync</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          ⏱ Interval :
          <input
            type="number"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '80px' }}
          />
          ms
        </label>

        <label style={{ marginLeft: '1rem' }}>
          🎚 Audio offset :
          <input
            type="number"
            value={offsetMs}
            onChange={(e) => setOffsetMs(Number(e.target.value))}
            style={{ marginLeft: '0.5rem', width: '80px' }}
          />
          ms
        </label>

        <button onClick={startTest} style={{ marginLeft: '1rem' }}>▶️ Start</button>
        <button onClick={stopTest} style={{ marginLeft: '1rem' }}>⏹ Stop</button>
        <button onClick={openExternalWindow} style={{ marginLeft: '1rem' }}>🖥 Floating window</button>
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
        Use this test to identify a possible lag between audio and video.
        If the "beep" doesn't exactly coincide with the appearance of the green square or word,
        you probably have a hardware delay that needs to be corrected.
      </p>
    </div>
  );
}