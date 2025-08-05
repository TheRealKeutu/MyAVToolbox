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

import { useState, useEffect } from 'react';
import cableSpecs from '../data/cableSpecs.json';

export default function PowerCalculator() {
  const [voltage, setVoltage] = useState(230);
  const [current, setCurrent] = useState('');
  const [power, setPower] = useState('');
  const [isThreePhase, setIsThreePhase] = useState(false);
  const [equipment, setEquipment] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newName, setNewName] = useState('');
  const [newPower, setNewPower] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPower, setEditPower] = useState('');
  const [customEquipments, setCustomEquipments] = useState([
    { category: 'lumière', name: '', power: 0, quantity: 1 }
  ]);
  const [cableLength, setCableLength] = useState('');
  const [cableSection, setCableSection] = useState('');
  const [cableCurrent, setCableCurrent] = useState('');

  useEffect(() => {
    // Ne déclenche le recalcul que si aucun courant manuel n'a été saisi
    if (cableCurrent !== '') return;

    const currentVal = parseFloat(calculateTotalCurrent());
    if (isNaN(currentVal)) return;

    let suggested = '';
    if (currentVal <= 10) suggested = 1.5;
    else if (currentVal <= 16) suggested = 2.5;
    else if (currentVal <= 25) suggested = 4;
    else if (currentVal <= 32) suggested = 6;
    else if (currentVal <= 40) suggested = 10;
    else suggested = 16;

    setCableCurrent(currentVal.toFixed(2));
  }, [customEquipments, voltage]);

  useEffect(() => {
    const currentVal = parseFloat(cableCurrent);
    if (isNaN(currentVal)) return;

    const suggested = suggestCableSectionFromCurrent(currentVal);
    setCableSection(suggested.toString());
  }, [cableCurrent]);

  const parseNumber = (value) => parseFloat(value.replace(',', '.')) || 0;

  const suggestCableSectionFromCurrent = (current) => {
    if (current <= 10) return 1.5;
    if (current <= 16) return 2.5;
    if (current <= 25) return 4;
    if (current <= 32) return 6;
    if (current <= 40) return 10;
    if (current <= 63) return 16;
    if (current <= 80) return 25;
    if (current <= 100) return 35;
    return 50; // au-delà, mise en garde à ajouter ?
  };

  const handleChange = (type, value) => {
    if (type === 'voltage') setVoltage(value);
    else if (type === 'current') setCurrent(value);

    const v = parseNumber(type === 'voltage' ? value : voltage);
    const i = parseNumber(type === 'current' ? value : current);

    if (v && i) {
      setPower((v * i).toFixed(2));
    }
  };

  const calculateTotalPower = () =>
    customEquipments.reduce((total, eq) => total + (eq.quantity * eq.power), 0);

  const calculateTotalCurrent = () => {
    const totalPower = calculateTotalPower();
    const divisor = isThreePhase ? (Math.sqrt(3) * voltage) : voltage;
    return (totalPower / divisor).toFixed(2);
  };

  const calculatePowerDrop = () => {
    const length = parseFloat(cableLength);
    const current = parseFloat(cableCurrent);
    const section = parseFloat(cableSection);
    const spec = cableSpecs.power;
    const resistivity = spec.defaultResistivity || 0.0178; // ohm·mm²/m
    const voltageValue = parseFloat(voltage);
    const maxDrop = voltageValue * (spec.defaultMaxDropPercent || 5) / 100;

    if (isNaN(length) || isNaN(current) || isNaN(section) || section <= 0) return null;

    const drop = isThreePhase
      ? (Math.sqrt(3) * length * current * resistivity) / section
      : (2 * length * current * resistivity) / section;

    const percent = (drop / voltageValue) * 100;

    return {
      value: `${drop.toFixed(2)} V (${percent.toFixed(1)}%)`,
      warning: drop > maxDrop
        ? '⚠️ Excessive voltage drop, increase cable cross-section'
        : '✅ Acceptable tension loss'
    };
  };

  const loss = calculatePowerDrop();

  return (
    <div className="content">

      <h1>📏 Cable section estimator</h1>

      <button
        className="button"
        onClick={() => setIsThreePhase(!isThreePhase)}
        style={{
            marginBottom: '1rem',
            backgroundColor: isThreePhase ? '#0066cc' : '#ccc',
            color: isThreePhase ? 'white' : 'black',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
        }}
        >
        {isThreePhase ? 'Mode : Three-phase⚡️⚡️⚡️' : 'Mode : Single-phase ⚡️'}
      </button>

      <div className="buttonGroup">
        <label>Cable length (m) :</label>
        <input
          type="number"
          value={cableLength}
          onChange={(e) => setCableLength(e.target.value)}
        />

        <label>Intensity (A) :</label>
        <input
          type="number"
          value={cableCurrent}
          onChange={(e) => setCableCurrent(e.target.value)}
        />

        <label>Section (mm²) :</label>
        <input
          type="number"
          value={cableSection}
          onChange={(e) => setCableSection(e.target.value)}
        />

        {loss && (
          <div style={{ marginTop: '1rem' }}>
            <strong>estimated tension loss :</strong> {loss.value}<br />
            <span style={{ color: loss.warning.includes('⚠️') ? 'red' : 'green' }}>{loss.warning}</span>
          </div>
        )}
      </div>
    </div>
  );
}
