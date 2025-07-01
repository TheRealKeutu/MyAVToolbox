import React, { useState, useEffect } from 'react';

// Exemple de trame simulée
const generateFakeDMXData = () => {
  return {
    universes: {
      0: new Array(512).fill(0).map(() => Math.floor(Math.random() * 256)),
      1: new Array(512).fill(0).map(() => Math.floor(Math.random() * 256)),
    }
  };
};

export default function DMXFrameViewer() {
  const [dmxData, setDmxData] = useState(generateFakeDMXData());
  const [selectedUniverse, setSelectedUniverse] = useState('0');
  const [startChannel, setStartChannel] = useState(1);
  const [endChannel, setEndChannel] = useState(16);

  useEffect(() => {
    const interval = setInterval(() => {
      setDmxData(generateFakeDMXData());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const channels = dmxData.universes[selectedUniverse]?.slice(startChannel - 1, endChannel) || [];

  return (
    <div>
      <h2>🎛 Visualiseur de trame DMX</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Univers :
          <select value={selectedUniverse} onChange={(e) => setSelectedUniverse(e.target.value)}>
            {Object.keys(dmxData.universes).map((univ) => (
              <option key={univ} value={univ}>
                {univ}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: '2rem' }}>
          De <input type="number" min="1" max="512" value={startChannel} onChange={(e) => setStartChannel(Number(e.target.value))} />
          à <input type="number" min="1" max="512" value={endChannel} onChange={(e) => setEndChannel(Number(e.target.value))} />
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxWidth: '100%' }}>
        {channels.map((val, idx) => (
          <div key={idx} style={{ width: '50px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ backgroundColor: '#eee', padding: '4px', borderRadius: '4px' }}>
              <strong>{startChannel + idx}</strong>
              <div style={{ backgroundColor: '#000', height: '10px', marginTop: '4px' }}>
                <div
                  style={{
                    width: `${(val / 255) * 100}%`,
                    height: '100%',
                    backgroundColor: '#00ff00',
                  }}
                ></div>
              </div>
              <span>{val}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
