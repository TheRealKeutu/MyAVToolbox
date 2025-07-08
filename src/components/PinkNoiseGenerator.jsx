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

import React, { useRef, useState, useEffect } from 'react';

export default function PinkNoiseGenerator() {
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);
  const destinationRef = useRef(null);
  const audioElementRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [gainDb, setGainDb] = useState(-18);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [mode, setMode] = useState('pink'); // 'pink' ou 'sine'

  const dbToGain = (db) => Math.pow(10, db / 20);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        setDevices(audioOutputs);
        if (audioOutputs.length > 0) {
          setSelectedDevice(audioOutputs[0].deviceId);
        }
      });
  }, []);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = dbToGain(gainDb);
    }
  }, [gainDb]);

  const generatePinkNoiseBuffer = (audioCtx, duration = 2) => {
    const sampleRate = audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, duration * sampleRate, sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < output.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      b6 = white * 0.115926;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    }

    return buffer;
  };

  const start = async () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioCtx.createGain();
    const destination = audioCtx.createMediaStreamDestination();

    gainNode.gain.value = dbToGain(gainDb);

    let source;

    if (mode === 'pink') {
      const buffer = generatePinkNoiseBuffer(audioCtx);
      source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gainNode);
    } else if (mode === 'sine') {
      source = audioCtx.createOscillator();
      source.type = 'sine';
      source.frequency.setValueAtTime(1000, audioCtx.currentTime);
      source.connect(gainNode);
    }

    gainNode.connect(destination);
    source.start();

    audioElementRef.current.srcObject = destination.stream;
    try {
      await audioElementRef.current.setSinkId(selectedDevice);
    } catch (err) {
      console.error('setSinkId error:', err);
      alert('Impossible de changer la sortie audio (votre navigateur ne le permet peut-être pas)');
    }
    audioElementRef.current.play();

    audioCtxRef.current = audioCtx;
    sourceRef.current = source;
    gainRef.current = gainNode;
    destinationRef.current = destination;
    setPlaying(true);
  };

  const stop = () => {
    if (sourceRef.current) sourceRef.current.stop();
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (audioElementRef.current) audioElementRef.current.pause();

    sourceRef.current = null;
    audioCtxRef.current = null;
    setPlaying(false);
  };

  return (
    <div>
      <h1>🎛️ Générateur Audio</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          🔧 Type de signal :
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ marginLeft: '1rem' }}
          >
            <option value="pink">🔊 Bruit rose</option>
            <option value="sine">🎵 Sinusoïde 1 kHz</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          🎚️ Niveau de sortie ({gainDb} dBFS)
          <input
            type="range"
            min={-60}
            max={0}
            value={gainDb}
            step={1}
            onChange={(e) => setGainDb(parseInt(e.target.value))}
            style={{ marginLeft: '1rem', width: '200px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          🎧 Interface audio de sortie :
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            style={{ marginLeft: '1rem' }}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Sortie ${d.deviceId}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={playing ? stop : start}>
        {playing ? '⏹️ Stop' : mode === 'pink' ? '▶️ Lancer le bruit rose' : '▶️ Lancer le 1 kHz'}
      </button>

      <audio ref={audioElementRef} hidden />
    </div>
  );
}
