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

import React, { useState } from 'react';

const cableTypes = [
  { name: 'RG-58', lossPerMeter: 0.64 },
  { name: 'RG-213', lossPerMeter: 0.22 },
  { name: 'LMR-195', lossPerMeter: 0.45 },
  { name: 'LMR-400', lossPerMeter: 0.06 },
  { name: 'LMR-600', lossPerMeter: 0.03 },
  { name: 'Autre (manuel)', lossPerMeter: null },
];

export default function RFLinkCalculator() {
  const [cableLength, setCableLength] = useState(10); // en mètres
  const [selectedCable, setSelectedCable] = useState(cableTypes[0].name);
  const [customLoss, setCustomLoss] = useState(0.2); // utilisé si câble manuel
  const [connectorLoss, setConnectorLoss] = useState(0.5); // dB
  const [numConnectors, setNumConnectors] = useState(2);
  const [antennaGainTx, setAntennaGainTx] = useState(3); // dB
  const [antennaGainRx, setAntennaGainRx] = useState(3); // dB

  const selectedCableObj = cableTypes.find(c => c.name === selectedCable);
  const cableLossPerMeter = selectedCableObj.lossPerMeter ?? customLoss;

  const totalLoss = cableLength * cableLossPerMeter + numConnectors * connectorLoss;
  const gain = antennaGainRx + antennaGainTx;
  const totalGain = gain - totalLoss;

  return (
    <div>
      <h2>📡 Calculateur de pertes RF</h2>
      <div>
        <label>
          Type de câble :
          <select value={selectedCable} onChange={(e) => setSelectedCable(e.target.value)}>
            {cableTypes.map(cable => (
              <option key={cable.name} value={cable.name}>
                {cable.name} {cable.lossPerMeter ? `(${cable.lossPerMeter} dB/m)` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedCable === 'Autre (manuel)' && (
        <div>
          <label>
            Perte du câble personnalisée (dB/m) :
            <input
              type="number"
              step="0.01"
              value={customLoss}
              onChange={(e) => setCustomLoss(Number(e.target.value))}
            />
          </label>
        </div>
      )}

      <div>
        <label>
          Longueur du câble (m) :
          <input type="number" value={cableLength} onChange={(e) => setCableLength(Number(e.target.value))} />
        </label>
      </div>

      <div>
        <label>
          Nombre de connecteurs :
          <input type="number" value={numConnectors} onChange={(e) => setNumConnectors(Number(e.target.value))} />
        </label>
      </div>

      <div>
        <label>
          Perte par connecteur (dB) :
          <input type="number" step="0.1" value={connectorLoss} onChange={(e) => setConnectorLoss(Number(e.target.value))} />
        </label>
      </div>

      <div>
        <label>
          Gain antenne émission (dB) :
          <input type="number" value={antennaGainTx} onChange={(e) => setAntennaGainTx(Number(e.target.value))} />
        </label>
      </div>

      <div>
        <label>
          Gain antenne réception (dB) :
          <input type="number" value={antennaGainRx} onChange={(e) => setAntennaGainRx(Number(e.target.value))} />
        </label>
      </div>

      <hr />

      <p><strong>🔻 Perte totale câblage + connecteurs :</strong> {totalLoss.toFixed(2)} dB</p>
      <p><strong>🔺 Gain des antennes + transmetteurs :</strong> {gain.toFixed(2)} dB</p>
      <p><strong>📶 Bilan total du lien RF :</strong> {totalGain.toFixed(2)} dB</p>

            <div style={{ marginTop: '1rem' }}>
        <div style={{
          width: '100%',
          height: '20px',
          borderRadius: '5px',
          background: '#ddd',
          overflow: 'hidden',
          marginTop: '5px'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(Math.max((totalGain + 20) * 2.5, 0), 100)}%`,
            background: totalGain >= 0 ? '#4caf50' : (totalGain > -6 ? '#ffc107' : '#f44336'),
            transition: 'width 0.3s'
          }}></div>
        </div>
        <p style={{ fontSize: '0.9em' }}>
          {totalGain >= 0
            ? '✅ Bon niveau de signal'
            : totalGain > -6
              ? '⚠️ Signal dégradé mais acceptable'
              : '❌ Trop de pertes'}
        </p>
      </div>
    </div>
  );
}
