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
import cableSpecs from '../data/cableSpecs.json';

export default function CableRunEstimator() {
  const [selectedType, setSelectedType] = useState('xlr');
  const [length, setLength] = useState('');
  const [current, setCurrent] = useState('');
  const [section, setSection] = useState('');

  const spec = cableSpecs[selectedType];
  const lengthValue = parseFloat(length);
  const currentValue = parseFloat(current);

  // Suggest section based on current (only for power cables)
  useEffect(() => {
    if (selectedType !== 'power' || isNaN(currentValue)) return;

    let suggested = '';
    if (currentValue <= 10) suggested = 1.5;
    else if (currentValue <= 16) suggested = 2.5;
    else if (currentValue <= 25) suggested = 4;
    else if (currentValue <= 32) suggested = 6;
    else if (currentValue <= 40) suggested = 10;
    else suggested = 16;

    setSection(suggested.toString());
  }, [currentValue, selectedType]);

  const calculateLoss = (type, length) => {
    const spec = cableSpecs[type];
    if (!spec) return null;

    if (spec.lossPerMeterDb) {
      const totalLoss = length * spec.lossPerMeterDb;
      const isTooMuch = totalLoss > spec.maxAcceptableLossDb;
      return {
        value: totalLoss.toFixed(2) + ' dB',
        warning: isTooMuch
          ? '⚠️ Too much loss, you may use fider or amplification'
          : '✅ Acceptable loss'
      };
    }

    return { value: 'N/A', warning: 'No furmula available' };
  };

  const calculatePowerDrop = (length, current, section, spec) => {
    const L = parseFloat(length);
    const I = parseFloat(current);
    const S = parseFloat(section);

    if (isNaN(L) || isNaN(I) || isNaN(S) || S <= 0) return null;

    const resistivity = spec.defaultResistivity || 0.0178;
    const voltage = spec.defaultVoltage || 230;
    const maxDrop = voltage * (spec.defaultMaxDropPercent || 5) / 100;

    const drop = (2 * L * I * resistivity) / S;
    const percent = (drop / voltage) * 100;

    return {
      value: `${drop.toFixed(2)} V (${percent.toFixed(1)}%)`,
      warning:
        drop > maxDrop
          ? '⚠️ Too much tension loss, use larger section'
          : '✅ Tension loss acceptable'
    };
  };

  const loss = (() => {
    if (selectedType === 'power') {
      return calculatePowerDrop(length, current, section, spec);
    }
    if (!isNaN(lengthValue) && lengthValue > 0) {
      return calculateLoss(selectedType, lengthValue);
    }
    return null;
  })();

  const feedbackColor = isNaN(lengthValue)
    ? 'gray'
    : lengthValue <= spec.maxLength
    ? 'green'
    : 'red';

  const isValid = !isNaN(lengthValue) && lengthValue <= spec.maxLength;

  return (
    <div style={{ padding: '1rem', maxWidth: 600 }}>
      <h2>🔌 Cable run estimator</h2>

      <label>
        Cable/protocole type :
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          {Object.entries(cableSpecs).map(([key, spec]) => (
            <option key={key} value={key}>{spec.label}</option>
          ))}
        </select>
      </label>

      <br /><br />

      <label>
        Estimated length (meters) :
        <input
          type="number"
          value={length}
          onChange={e => setLength(e.target.value)}
          style={{ marginLeft: 10, width: 100 }}
        />
      </label>

      {selectedType === 'power' && (
        <>
          <br /><br />
          <label>
            Intensity (A) :
            <input
              type="number"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              style={{ marginLeft: 10, width: 80 }}
            />
          </label>

          <br /><br />
          <label>
            Cable section (mm²) :
            <input
              type="number"
              value={section}
              onChange={e => setSection(e.target.value)}
              style={{ marginLeft: 10, width: 80 }}
            />
            <span style={{ marginLeft: 10, color: 'gray' }}>
              (auto : based on intensity)
            </span>
          </label>
        </>
      )}

      <br /><br />

      {loss && (
        <div>
          <strong>Estimated loss :</strong> {loss.value}<br />
          <span style={{ color: loss.warning.includes('⚠️') ? 'red' : 'green' }}>
            {loss.warning}
          </span>
        </div>
      )}

      {length && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: `2px solid ${feedbackColor}`,
            background:
              feedbackColor === 'green'
                ? '#e0ffe0'
                : feedbackColor === 'red'
                ? '#ffe0e0'
                : '#f0f0f0'
          }}
        >
          <strong>
            {isValid ? '✅ Acceptable length' : '⚠️ Excessive length'}
          </strong>
          <p><em>Recommended Max : {spec.maxLength} m</em></p>
          <p>{spec.note}</p>
        </div>
      )}
    </div>
  );
}
