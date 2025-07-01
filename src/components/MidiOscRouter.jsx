import React, { useEffect, useState, useRef } from 'react';

export default function MidiOscRouter() {
  const [log, setLog] = useState([]);
  const [ip, setIp] = useState('127.0.0.1');
  const [port, setPort] = useState(53000);
  const wsRef = useRef(null);
  const logEndRef = useRef(null);

  const addLog = (msg) => {
    setLog((prev) => [msg, ...prev.slice(0, 100)]);
  };

  // Scroll auto en bas à chaque ajout de log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = 0;
    }
  }, [log]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    ws.onopen = () => addLog('🟢 WebSocket connecté');
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        // Formatage lisible OSC : adresse + args
        const argsStr = (msg.args || [])
          .map((a) => `${a.type}:${a.value}`)
          .join(', ');
        addLog(`⬅️ OSC IN — ${msg.address} [${argsStr}]`);
      } catch {
        addLog(`⚠️ Reçu message non JSON: ${e.data}`);
      }
    };
    ws.onclose = () => addLog('🔴 WebSocket fermé');
    ws.onerror = (err) => addLog(`⚠️ WebSocket erreur: ${err.message}`);

    return () => ws.close();
  }, []);

  const sendOsc = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const oscMsg = {
        address: '/test',
        args: [{ type: 'i', value: 1 }],
        targetIp: ip,
        targetPort: Number(port),
      };
      wsRef.current.send(JSON.stringify(oscMsg));
      addLog(`➡️ OSC envoyé → ${ip}:${port} /test [i:1]`);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: 'auto' }}>
      <h1>🎚️ Console MIDI / OSC Router</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label>
          IP cible :
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            style={{ marginLeft: 8, width: 120 }}
          />
        </label>
        <label>
          Port :
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            style={{ marginLeft: 8, width: 80 }}
          />
        </label>
        <button onClick={sendOsc} style={{ padding: '0 1rem' }}>
          Envoyer OSC /test
        </button>
      </div>

      <hr />

      <h2>🧩 Mapping MIDI → OSC (à venir)</h2>
      <p>⚠️ Interface de mapping MIDI/OSC à ajouter ici.</p>

      <hr />

      <h2>📜 Journal</h2>
      <div
        ref={logEndRef}
        style={{
          background: '#111',
          color: '#0f0',
          padding: '1rem',
          height: 250,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: 13,
          borderRadius: 6,
          whiteSpace: 'pre-wrap',
        }}
      >
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  );
}
