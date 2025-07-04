import React, { useEffect, useState, useRef } from 'react';

export default function MidiOscRouter() {
  const [log, setLog] = useState([]);
  const [ip, setIp] = useState('127.0.0.1');
  const [port, setPort] = useState(53000);

  const [oscListenIp, setOscListenIp] = useState('0.0.0.0');
  const [oscListenPort, setOscListenPort] = useState(57121);

  const logEndRef = useRef(null);

  const addLog = (msg) => {
    setLog((prev) => [msg, ...prev.slice(0, 100)]);
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = 0;
    }
  }, [log]);

  // Écoute des messages OSC entrants envoyés par le main process
  useEffect(() => {
    if (!window.electronAPI || !window.electronAPI.onOscIncoming) return;

    const handler = (msg) => {
      try {
        const argsStr = (msg.args || [])
          .map((a) => `${a.type}:${a.value}`)
          .join(', ');
        addLog(`⬅️ OSC IN — ${msg.address} [${argsStr}]`);
      } catch {
        addLog(`⚠️ Reçu message OSC non parsé`);
      }
    };

    window.electronAPI.onOscIncoming(handler);

    return () => {
      // Nettoyage : désabonnement si possible (à adapter si tu exposes un off)
      // Ici pas de méthode off dans preload, donc pas de nettoyage précis
    };
  }, []);

  // Envoi d'un message OSC via IPC main
  const sendOsc = async () => {
    if (!window.electronAPI || !window.electronAPI.oscSend) {
      addLog('⚠️ API OSC non disponible');
      return;
    }

    const oscMsg = {
      address: '/test',
      args: [{ type: 'i', value: 1 }],
      targetIp: ip,
      targetPort: Number(port),
    };

    const result = await window.electronAPI.oscSend(oscMsg);
    if (result.success) {
      addLog(`➡️ OSC envoyé → ${ip}:${port} /test [i:1]`);
    } else {
      addLog(`❌ Échec envoi OSC : ${result.error}`);
    }
  };

  // Changer la config écoute OSC (IP + port)
  const changeListenConfig = async () => {
    if (!window.electronAPI || !window.electronAPI.oscSetListenConfig) {
      addLog('⚠️ API OSC non disponible');
      return;
    }

    const result = await window.electronAPI.oscSetListenConfig({
      ip: oscListenIp,
      port: Number(oscListenPort),
    });

    if (result.success) {
      addLog(`🔁 Configuration OSC : écoute sur ${oscListenIp}:${oscListenPort}`);
    } else {
      addLog(`❌ Échec config écoute OSC : ${result.error}`);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: 'auto' }}>
      <h1>🎚️ Monitoring OSC</h1>

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <label>
          🛜 IP d’écoute OSC :
          <input
            value={oscListenIp}
            onChange={(e) => setOscListenIp(e.target.value)}
            style={{ marginLeft: 8, width: 120 }}
          />
        </label>
        <label>
          Port d’écoute :
          <input
            type="number"
            value={oscListenPort}
            onChange={(e) => setOscListenPort(e.target.value)}
            style={{ marginLeft: 8, width: 80 }}
          />
        </label>
        <button onClick={changeListenConfig}>🔁 Appliquer écoute OSC</button>
      </div>

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
