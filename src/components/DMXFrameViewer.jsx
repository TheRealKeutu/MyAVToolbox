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

import React, { useState, useEffect } from 'react';

export default function DMXFrameViewer() {
  const [dmxData, setDmxData] = useState({});
  const [selectedProtocol, setSelectedProtocol] = useState('dmx-usb');
  const [selectedUniverse, setSelectedUniverse] = useState('0');
  const [startChannel, setStartChannel] = useState(1);
  const [endChannel, setEndChannel] = useState(16);

  // Réception des données DMX
  useEffect(() => {
    const handleDMX = (event, { protocol, universe, dmx }) => {
      if (protocol !== selectedProtocol) return;

      setDmxData(prev => ({
        ...prev,
        [universe]: dmx,
      }));
    };

    window.electronAPI?.onDMXData?.(handleDMX);
    return () => {
      window.electronAPI?.offDMXData?.(handleDMX);
    };
  }, [selectedProtocol]);

  const currentChannels = dmxData[selectedUniverse]?.slice(startChannel - 1, endChannel) || [];

  return (
    <div>
      <h2>🎛 DMX frame viewer</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Protocol :
          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="dmx-usb">DMX USB</option>
            <option value="artnet">Art-Net</option>
            <option value="sacn">sACN</option>
          </select>
        </label>

        <label style={{ marginLeft: '2rem' }}>
          Universe :
          <input
            type="number"
            value={selectedUniverse}
            onChange={(e) => setSelectedUniverse(e.target.value)}
            style={{ width: '60px', marginLeft: '0.5rem' }}
          />
        </label>

        <label style={{ marginLeft: '2rem' }}>
          From <input type="number" min="1" max="512" value={startChannel} onChange={(e) => setStartChannel(Number(e.target.value))} />
          To <input type="number" min="1" max="512" value={endChannel} onChange={(e) => setEndChannel(Number(e.target.value))} />
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxWidth: '100%' }}>
        {currentChannels.map((val, idx) => (
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
                />
              </div>
              <span>{val}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
