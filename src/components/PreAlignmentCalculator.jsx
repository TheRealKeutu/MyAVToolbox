import React, { useState } from 'react';
import lAcousticsData from '../data/lAcoustics_prealignment_presets.json';
import Logo from '/lacoustics-path-difference.png'

export default function PreAlignmentCalculator() {
  const families = lAcousticsData.families;
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedCombination, setSelectedCombination] = useState(null);
  const [distances, setDistances] = useState({});
  const [temperature, setTemperature] = useState(20);

  const getSoundSpeed = (t) => 331.4 + 0.6 * t;
  const getMsPerMeter = () => (1000 / getSoundSpeed(temperature)).toFixed(4);

  const handleFamilyClick = (family) => {
    setSelectedFamily(family);
    setSelectedCombination(null);
    setDistances({});
  };

  const handleCombinationClick = (combo) => {
    setSelectedCombination(combo);
    const newDistances = {};
    combo.config.forEach(el => {
      const baseName = el.split('_')[0];
      newDistances[baseName] = '';
    });
    setDistances(newDistances);
  };

  const handleDistanceChange = (elementName, value) => {
    setDistances(prev => ({
      ...prev,
      [elementName]: value,
    }));
  };

  return (
    <div className="content">
      <h1>Préalignement L-Acoustics</h1>

      {selectedCombination && (
        <section style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 auto' }}>
            <img
              src= {Logo}
              alt="Schéma L-Acoustics"
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h2>Délai à appliquer</h2>
            <div className="buttonGroup">
              {(() => {
                const msPerMeter = 1000 / getSoundSpeed(temperature);
                const allDistances = selectedCombination.config.map(el => {
                  const name = el.split('_')[0];
                  return parseFloat(distances[name]) || 0;
                });
                const maxDist = Math.max(...allDistances);

                return selectedCombination.config.map((el) => {
                  const baseName = el.split('_')[0];
                  const delay = selectedCombination.delays[baseName] ?? 0;
                  const dist = parseFloat(distances[baseName]) || 0;
                  const delta = (maxDist - dist) * msPerMeter;
                  const totalDelay = delay + delta;
                  const inverted = selectedCombination.invertPolarity?.includes(baseName);
                  const isReference = dist === maxDist;

                  return (
                    <div key={el} style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
                      <strong>{el}</strong> — 
                      {isReference && <span style={{ color: 'green', fontWeight: 'bold', marginLeft: '0.5rem' }}>🟢 Référence</span>}
                      <div>
                        Delay : <strong>{totalDelay.toFixed(2)} ms</strong>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#777' }}>
                          (préalignement: {delay} ms + distance: {delta.toFixed(2)} ms)
                        </span>
                        {inverted && (
                          <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '1rem' }}>
                            ⚠️ Polarité inversée
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </section>
      )}

      {selectedCombination && (
        <section style={{ marginTop: '2rem' }}>
          <div>
            <label><strong>Température ambiante (°C) :</strong></label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              style={{ marginLeft: '1rem', padding: '0.3rem', width: '80px' }}
            />
            <span style={{ marginLeft: '1rem', color: '#555' }}>→ {getMsPerMeter()} ms/m</span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h2>Distance jusqu’au point de mesure</h2>
            <div className="buttonGroup">
              {selectedCombination.config.map((el) => {
                const baseName = el.split('_')[0];
                return (
                  <label key={el}>
                    {el}
                    <input
                      type="number"
                      value={distances[baseName] || ''}
                      onChange={(e) => handleDistanceChange(baseName, e.target.value)}
                      placeholder="Distance en mètres"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h2>Famille</h2>
        <div className="buttonGroup">
          {Object.keys(families).map((fam) => (
            <button
              key={fam}
              onClick={() => handleFamilyClick(fam)}
              className="button"
              style={{
                backgroundColor: selectedFamily === fam ? '#6c63ff' : '#ddd',
                color: selectedFamily === fam ? '#fff' : '#000',
              }}
            >
              {fam}
            </button>
          ))}
        </div>
      </section>

      {selectedFamily && families[selectedFamily]?.combinations?.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Configurations disponibles</h2>
          <div className="buttonGroup">
            {families[selectedFamily].combinations.map((combo, idx) => (
              <button
                key={idx}
                onClick={() => handleCombinationClick(combo)}
                className="button"
                style={{
                  backgroundColor: selectedCombination === combo ? '#ffeb8a' : '#f5f5f5',
                  fontWeight: selectedCombination === combo ? 'bold' : 'normal',
                }}
              >
                {combo.config.join(' + ')}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
