import React, { useState } from 'react';

export default function DMXDipswitch() {
  const [address, setAddress] = useState(1);
  const [inverse, setInverse] = useState(false);

  const getBitsFromAddress = (addr) =>
    Array.from({ length: 9 }, (_, i) => (addr >> i) & 1).reverse();

  const getAddressFromBits = (bits) =>
    bits.reduce((acc, bit, idx) => acc + (bit << (8 - idx)), 0);

  const handleToggle = (index) => {
    const originalBits = getBitsFromAddress(address);
    const toggled = [...originalBits];
    toggled[index] = inverse ? 1 - toggled[index] : 1 - toggled[index];
    const newAddress = getAddressFromBits(toggled);
    setAddress(newAddress || 1);
  };

  const dipswitches = getBitsFromAddress(address);
  const displayedSwitches = inverse
    ? dipswitches.map((bit) => (bit ? 0 : 1))
    : dipswitches;

  return (
    <div className="content">
      <h1>Adresses DMX – Dipswitches</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <strong>Adresse DMX (1–512):</strong>{' '}
          <input
            type="number"
            min={1}
            max={512}
            value={address}
            onChange={(e) =>
              setAddress(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))
            }
            style={{ padding: '0.3rem', marginLeft: '0.5rem', width: '60px' }}
          />
        </label>

        <label style={{ marginLeft: '2rem' }}>
          <input
            type="checkbox"
            checked={inverse}
            onChange={(e) => setInverse(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Mode inverse
        </label>
      </div>

      {/* Dipswitch */}
      <div
        style={{
          backgroundColor: '#000',
          padding: '1rem',
          borderRadius: '8px',
          display: 'inline-block',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {displayedSwitches.map((_, i, arr) => {
            const idx = arr.length - 1 - i;
            const bit = arr[idx];
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#fff',
                }}
              >
                <div
                  onClick={() => handleToggle(idx)}
                  style={{
                    width: '24px',
                    height: '40px',
                    backgroundColor: '#fff',
                    border: '2px solid #fff',
                    borderRadius: '2px 2px 0 0',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '50%',
                      backgroundColor: bit ? 'red' : 'transparent',
                      transition: 'background 0.3s',
                      borderRadius: '2px 2px 0 0',
                    }}
                  ></div>
                </div>
                <span style={{ marginTop: '4px', fontSize: '10px' }}>#{arr.length - idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          background: '#f0f0f0',
          padding: '1rem',
          borderRadius: '6px',
          width: 'fit-content',
          fontSize: '14px',
        }}
      >
        <p><strong>Binaire :</strong> {dipswitches.join('')}</p>
        <p>
          <strong>Hexadécimal :</strong>{' '}
          {address.toString(16).toUpperCase().padStart(3, '0')}
        </p>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '13px', color: '#555', maxWidth: '600px' }}>
        Les dipswitches sont affichés de gauche (#1) à droite (#9). Cliquez pour les activer/désactiver. Le mode inverse simule les boîtiers où "ON" est en bas.
      </p>
    </div>
  );
}
