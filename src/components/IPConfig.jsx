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

import React, { useEffect, useState } from 'react';

export default function IPConfig() {
  const [interfaces, setInterfaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('dhcp');
  const [ipConfig, setIpConfig] = useState({ address: '', netmask: '', gateway: '' });
  const [resultMsg, setResultMsg] = useState('');
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const fetchInterfaces = () => {
    window.electronAPI.invoke('get-network-interfaces')
      .then((data) => {
        setInterfaces(data);
      })
      .catch(err => {
        console.error('Error during interface fetching:', err);
      });
  };

  useEffect(() => {
    fetchInterfaces();
  }, []);

  const handleAdapterChange = (e) => {
    const adapter = interfaces.find(i => i.name === e.target.value);
    setSelected(adapter);
    setIpConfig({
      address: adapter?.address || '',
      netmask: adapter?.netmask || '',
      gateway: '192.168.1.1'
    });
    setScanResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIpConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!selected) return;

    const payload = {
      name: selected.name,
      ...ipConfig,
    };

    const invokeMethod = mode === 'static' ? 'set-static-ip' : 'set-dhcp';
    const invokeData = mode === 'static' ? payload : { name: selected.name };

    window.electronAPI.invoke(invokeMethod, invokeData)
      .then(() => {
        setResultMsg(mode === 'static' ? 'Configuration successfully applied.' : 'DHCP command sent.');
      })
      .catch(err => {
        setResultMsg('Error: ' + err.message);
      });
  };

  const handleScan = () => {
    if (!selected?.address) return;
    const subnet = selected.address.split('.').slice(0, 3).join('.') + '.0';
    setIsScanning(true);
    window.electronAPI.invoke('scan-subnet', { subnet })
      .then(results => {
        setScanResults(results);
        setIsScanning(false);
      })
      .catch(err => {
        setResultMsg('Scan error: ' + err.message);
        setIsScanning(false);
      });
  };

  return (
    <div className="content">
      <h1>Network Configuration 🛜</h1>

      <div className="buttonGroup" style={{ marginBottom: '1rem' }}>
        <button className="button" onClick={fetchInterfaces}>🔄 Refresh interfaces</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Network Adapter:</strong></label><br />
        <select value={selected?.name || ''} onChange={handleAdapterChange} style={{ width: '100%', padding: '0.5rem' }}>
          <option value="">-- Select --</option>
          {interfaces.map(iface => (
            <option key={iface.name} value={iface.name}>
              {iface.name} ({iface.address})
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>IPV4 Mode:</strong></label><br />
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="dhcp">DHCP</option>
              <option value="static">Fixed IP</option>
            </select>
          </div>

          {mode === 'static' && (
            <div className="buttonGroup" style={{ marginBottom: '1rem' }}>
              <label>IP Address:</label>
              <input
                className="input"
                name="address"
                value={ipConfig.address}
                onChange={handleInputChange}
              />

              <label>Subnet Mask:</label>
              <input
                className="input"
                name="netmask"
                value={ipConfig.netmask}
                onChange={handleInputChange}
              />

              <label>Gateway:</label>
              <input
                className="input"
                name="gateway"
                value={ipConfig.gateway}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="buttonGroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '1rem' }}>
            <button className="button" onClick={handleSubmit}>💾 Apply</button>
            <button className="button" onClick={handleScan}>🔍 Subnet scan</button>
          </div>

          {isScanning && <p style={{ marginTop: '1rem' }}>⏳ Scanning...</p>}

          {scanResults.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Active devices detected:</h3>
              <ul>
                {scanResults.filter(entry => entry.active).map((entry, idx) => (
                  <li key={idx}>
                    <strong>{entry.ip}</strong>{entry.hostname && <> — {entry.hostname}</>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultMsg && (
            <div style={{ marginTop: '1rem', color: 'green' }}>
              {resultMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
}

