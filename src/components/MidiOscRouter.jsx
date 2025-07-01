import React, { useEffect, useState } from 'react';
import * as midi from 'midi';
import { OSC } from 'osc';

export default function MidiOscRouter() {
  const [midiInput, setMidiInput] = useState(null);
  const [midiOutput, setMidiOutput] = useState(null);
  const [log, setLog] = useState([]);
  const [oscPort, setOscPort] = useState(null);

  // MIDI setup
  useEffect(() => {
    const input = new midi.Input();
    const output = new midi.Output();

    input.getPortCount() && input.openPort(0);
    output.getPortCount() && output.openPort(0);

    input.on('message', (deltaTime, message) => {
      addLog(`MIDI IN: ${message.join(', ')}`);
    });

    setMidiInput(input);
    setMidiOutput(output);

    return () => {
      input.closePort();
      output.closePort();
    };
  }, []);

  // OSC setup
  useEffect(() => {
    const osc = new OSC.UDPPort({
      localAddress: '0.0.0.0',
      localPort: 57121,
      metadata: true
    });

    osc.open();

    osc.on('message', (oscMsg) => {
      addLog(`OSC IN: ${JSON.stringify(oscMsg)}`);
    });

    setOscPort(osc);

    return () => {
      osc.close();
    };
  }, []);

  const addLog = (msg) => {
    setLog((prev) => [msg, ...prev.slice(0, 50)]);
  };

  const sendTestMidi = () => {
    if (midiOutput) {
      midiOutput.sendMessage([144, 60, 100]); // Note on, C4
      addLog('Sent MIDI: [144, 60, 100]');
    }
  };

  const sendTestOsc = () => {
    if (oscPort) {
      oscPort.send(
        {
          address: '/test',
          args: [{ type: 'i', value: 1 }]
        },
        '127.0.0.1',
        53000
      );
      addLog('Sent OSC: /test 1');
    }
  };

  return (
    <div>
      <h1>🎛 Console MIDI / OSC Router</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={sendTestMidi}>🔈 Envoyer Note MIDI</button>
        <button onClick={sendTestOsc} style={{ marginLeft: '1rem' }}>
          🛰 Envoyer OSC
        </button>
      </div>

      <div
        style={{
          background: '#111',
          color: '#0f0',
          padding: '1rem',
          height: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '13px',
          borderRadius: '6px'
        }}
      >
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  );
}
