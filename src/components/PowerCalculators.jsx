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
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import equipmentData from '../../assets/equipmentDB.json';
import cableSpecs from '../data/cableSpecs.json';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportToPDF = (customEquipments, isThreePhase) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Calculateur de puissance', 14, 20);

  const tableData = customEquipments.map(eq => [
    eq.category,
    eq.name,
    eq.power,
    eq.quantity,
    eq.power * eq.quantity
  ]);

  autoTable(doc, {
    head: [['Catégorie', 'Nom', 'Puissance (W)', 'Quantité', 'Total (W)']],
    body: tableData,
    startY: 30
  });

  // Calcul total
  const totalPower = customEquipments.reduce(
    (acc, eq) => acc + eq.power * eq.quantity,
    0
  );

  const amperage = isThreePhase
    ? totalPower / (230 * Math.sqrt(3))
    : totalPower / 230;

  doc.setFontSize(12);
  doc.text(
    `Consommation totale : ${totalPower.toFixed(0)} W`,
    14,
    doc.lastAutoTable.finalY + 10
  );
  doc.text(
    `Estimation intensité : ${amperage.toFixed(2)} A (${isThreePhase ? 'Triphasé' : 'Monophasé'})`,
    14,
    doc.lastAutoTable.finalY + 16
  );

  doc.save('puissance.pdf');
};

const getDivisor = (isThreePhase, voltage) =>
  isThreePhase ? Math.sqrt(3) * voltage : voltage;

const deepMergeEquipment = (base = {}, existing = {}) => {
  const result = { ...existing };
  for (const category of Object.keys(base)) {
    if (!result[category]) {
      result[category] = [...base[category]];
    } else {
      const existingNames = new Set(result[category].map((item) => item.name));
      const additions = base[category].filter((item) => !existingNames.has(item.name));
      result[category] = [...result[category], ...additions];
    }
  }
  return result;
};

const EquipmentRow = ({
  eq,
  index,
  equipment,
  isThreePhase,
  voltage,
  updateCustomEquipment,
  removeCustomEquipment
}) => {
  const totalPowerForLine = eq.power * eq.quantity;
  const divisor = getDivisor(isThreePhase, voltage);
  const currentForLine = divisor ? (totalPowerForLine / divisor).toFixed(2) : '0.00';

  return (
    <tr>
      <td>
        <select
          value={eq.category}
          onChange={(e) => updateCustomEquipment(index, 'category', e.target.value)}
        >
          {Object.keys(equipment).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          list={`names-${index}`}
          value={eq.name}
          onChange={(e) => updateCustomEquipment(index, 'name', e.target.value)}
          placeholder="Name"
        />
        <datalist id={`names-${index}`}>
          {equipment[eq.category]?.map((item, i) => (
            <option key={i} value={item.name} />
          ))}
        </datalist>
      </td>
      <td>
        <input
          className="small-input"
          type="number"
          placeholder="W"
          value={eq.power}
          onChange={(e) => updateCustomEquipment(index, 'power', e.target.value)}
        />
      </td>
      <td>
        <input
          className="small-input"
          type="number"
          placeholder="Qty"
          value={eq.quantity}
          onChange={(e) => updateCustomEquipment(index, 'quantity', e.target.value)}
        />
      </td>
      <td>{currentForLine}</td>
      <td>
        <button className="button" onClick={() => removeCustomEquipment(index)}>
          ❌
        </button>
      </td>
    </tr>
  );
};

const CategorySubtotal = ({ category, aggregate }) => (
  <tr className="subtotal">
    <td colSpan={2}>Subtotal for {category}</td>
    <td>{aggregate.power.toFixed(0)} W</td>
    <td></td>
    <td>{aggregate.current.toFixed(2)} A</td>
    <td></td>
  </tr>
);

export default function PowerCalculator() {
  const [voltage, setVoltage] = useState(230);
  const [isThreePhase, setIsThreePhase] = useState(false);
  const [equipment, setEquipment] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newName, setNewName] = useState('');
  const [newPower, setNewPower] = useState('');
  const [customEquipments, setCustomEquipments] = useState([]);
  const [cableLength, setCableLength] = useState('');
  const [cableSection, setCableSection] = useState('');
  const [cableCurrent, setCableCurrent] = useState('');
  const [newCustom, setNewCustom] = useState({
    category: 'lighting',
    name: '',
    power: 0,
    quantity: 1
  });

  const CURRENT_DB_VERSION = 'v1';

  const resetDatabaseToDefault = () => {
    setEquipment(equipmentData);
    localStorage.setItem('equipmentDB', JSON.stringify(equipmentData));
    localStorage.setItem('equipmentDB_version', CURRENT_DB_VERSION);
  };

  useEffect(() => {
    const localDataRaw = localStorage.getItem('equipmentDB');
    const storedVersion = localStorage.getItem('equipmentDB_version');

    if (localDataRaw) {
      let parsed = {};
      try {
        parsed = JSON.parse(localDataRaw);
      } catch {
        parsed = {};
      }

      if (storedVersion === CURRENT_DB_VERSION) {
        const merged = deepMergeEquipment(equipmentData, parsed);
        setEquipment(merged);
        localStorage.setItem('equipmentDB', JSON.stringify(merged));
      } else {
        const merged = deepMergeEquipment(equipmentData, parsed);
        setEquipment(merged);
        localStorage.setItem('equipmentDB', JSON.stringify(merged));
        localStorage.setItem('equipmentDB_version', CURRENT_DB_VERSION);
      }
    } else {
      setEquipment(equipmentData);
      localStorage.setItem('equipmentDB', JSON.stringify(equipmentData));
      localStorage.setItem('equipmentDB_version', CURRENT_DB_VERSION);
    }
  }, []);

  // recalcule câble courant si non forcé manuellement
  useEffect(() => {
    if (cableCurrent !== '') return;
    const currentVal = parseFloat(calculateTotalCurrent());
    if (!isNaN(currentVal)) {
      setCableCurrent(currentVal.toFixed(2));
    }
  }, [customEquipments, voltage, isThreePhase]);

  useEffect(() => {
    const currentVal = parseFloat(cableCurrent);
    if (isNaN(currentVal)) return;
    const suggested = suggestCableSectionFromCurrent(currentVal);
    setCableSection(suggested.toString());
  }, [cableCurrent]);

  // suggestion automatique de puissance pour la ligne d'ajout
  useEffect(() => {
    if (newCustom.category && newCustom.name) {
      const suggestion = equipment[newCustom.category]?.find(
        (eq) => eq.name === newCustom.name
      );
      if (suggestion) {
        setNewCustom((prev) => ({ ...prev, power: suggestion.power }));
      }
    }
  }, [newCustom.category, newCustom.name, equipment]);

  const saveToLocalStorage = (data) => {
    localStorage.setItem('equipmentDB', JSON.stringify(data));
  };

  const parseNumber = (value) => parseFloat(String(value).replace(',', '.')) || 0;

  const suggestCableSectionFromCurrent = (current) => {
    if (current <= 10) return 1.5;
    if (current <= 16) return 2.5;
    if (current <= 25) return 4;
    if (current <= 32) return 6;
    if (current <= 40) return 10;
    if (current <= 63) return 16;
    if (current <= 80) return 25;
    if (current <= 100) return 35;
    return 50;
  };

  const calculateTotalPower = () =>
    customEquipments.reduce((total, eq) => total + eq.quantity * eq.power, 0);

  const calculateTotalCurrent = () => {
    const totalPower = calculateTotalPower();
    const divisor = getDivisor(isThreePhase, voltage);
    return divisor ? (totalPower / divisor).toFixed(2) : '0.00';
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
      warning:
        drop > maxDrop
          ? '⚠️ Chute de tension excessive, augmenter la section'
          : '✅ Chute de tension acceptable'
    };
  };

  const updateCustomEquipment = (index, key, value) => {
    const newList = [...customEquipments];
    newList[index][key] = key === 'quantity' || key === 'power' ? parseNumber(value) : value;

    if ((key === 'name' || key === 'category') && newList[index].category && newList[index].name) {
      const suggestion = equipment[newList[index].category]?.find(
        (eq) => eq.name === newList[index].name
      );
      if (suggestion) {
        newList[index].power = suggestion.power;
      }
    }

    setCustomEquipments(newList);
  };

  const removeCustomEquipment = (index) => {
    const newList = [...customEquipments];
    newList.splice(index, 1);
    setCustomEquipments(newList);
  };

  const addToDatabase = () => {
    const updated = { ...equipment };
    const newEntry = { name: newName, power: parseNumber(newPower) };
    if (!updated[newCategory]) updated[newCategory] = [];
    updated[newCategory].push(newEntry);
    setEquipment(updated);
    saveToLocalStorage(updated);
    setNewCategory('');
    setNewName('');
    setNewPower('');
  };

  const updateNewCustom = (key, value) => {
    setNewCustom((prev) => ({
      ...prev,
      [key]: key === 'power' || key === 'quantity' ? parseNumber(value) : value
    }));
  };

  const categoryAggregates = useMemo(() => {
    const divisor = getDivisor(isThreePhase, voltage);
    const byCategory = {};
    customEquipments.forEach((eq) => {
      if (!byCategory[eq.category]) {
        byCategory[eq.category] = { power: 0, current: 0 };
      }
      const linePower = eq.power * eq.quantity;
      byCategory[eq.category].power += linePower;
      byCategory[eq.category].current += divisor ? linePower / divisor : 0;
    });
    return byCategory;
  }, [customEquipments, isThreePhase, voltage]);

  const loss = calculatePowerDrop();

  return (
    <div className="content">
      <h1>🧮 Equipment consumption</h1>
      <p>Calculate the total consumption of your setup</p>

      <div style={{ marginLeft: 'auto' }}>
          <button
            className={`button phase-toggle ${isThreePhase ? 'active' : ''}`}
            onClick={() => setIsThreePhase((prev) => !prev)}
            aria-label="Toggle single/three-phase"
          >
            {isThreePhase ? '⚡️⚡️⚡️ Three-phase' : '⚡️ Single-phase'}
          </button>
        </div>

      <table className="power-calculator-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Equipment name</th>
            <th>Power (W)</th>
            <th>Qty</th>
            <th>Computed current (A)</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(categoryAggregates).map(([category, agg]) => (
            <></> /* placeholder to ensure React.Fragment semantics below */
          ))}

          {Object.entries(categoryAggregates).map(([category, agg]) => (
            <React.Fragment key={category}>
              {customEquipments
                .map((eq, index) => ({ eq, index }))
                .filter(({ eq }) => eq.category === category)
                .map(({ eq, index }) => (
                  <EquipmentRow
                    key={index}
                    eq={eq}
                    index={index}
                    equipment={equipment}
                    isThreePhase={isThreePhase}
                    voltage={voltage}
                    updateCustomEquipment={updateCustomEquipment}
                    removeCustomEquipment={removeCustomEquipment}
                  />
                ))}
              <CategorySubtotal category={category} aggregate={agg} />
            </React.Fragment>
          ))}

          {/* add-new row */}
          <tr>
            <td>
              <select
                value={newCustom.category}
                onChange={(e) => updateNewCustom('category', e.target.value)}
              >
                {Object.keys(equipment).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                list="names-new"
                value={newCustom.name}
                onChange={(e) => updateNewCustom('name', e.target.value)}
                placeholder="Name"
              />
              <datalist id="names-new">
                {equipment[newCustom.category]?.map((item, i) => (
                  <option key={i} value={item.name} />
                ))}
              </datalist>
            </td>
            <td>
              <input
                className="small-input"
                type="number"
                placeholder="W"
                value={newCustom.power}
                onChange={(e) => updateNewCustom('power', e.target.value)}
              />
            </td>
            <td>
              <input
                className="small-input"
                type="number"
                placeholder="Qty"
                value={newCustom.quantity}
                onChange={(e) => updateNewCustom('quantity', e.target.value)}
              />
            </td>
            <td>
              {(() => {
                const linePower = newCustom.power * newCustom.quantity;
                const divisor = getDivisor(isThreePhase, voltage);
                return divisor ? (linePower / divisor).toFixed(2) : '0.00';
              })()}
            </td>
            <td>
              <button
                className="button"
                disabled={
                  !newCustom.category ||
                  !newCustom.name ||
                  !newCustom.power ||
                  newCustom.quantity <= 0
                }
                onClick={() => {
                  setCustomEquipments([...customEquipments, { ...newCustom }]);
                  setNewCustom({
                    category: 'lighting',
                    name: '',
                    power: 0,
                    quantity: 1
                  });
                }}
              >
                ➕
              </button>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th colSpan={2}>Totals</th>
            <th>{calculateTotalPower()} W</th>
            <th></th>
            <th>{calculateTotalCurrent()} A</th>
            <th></th>
          </tr>
        </tfoot>
      </table>

      <button onClick={() => exportToPDF(customEquipments, isThreePhase)}>
        Export PDF
      </button>

      <hr style={{ margin: '2rem 0' }} />

      <h2>📦 Add equipment to database</h2>
      <div className="buttonGroup">
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          <option value="">-- Family --</option>
          {Object.keys(equipment).map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />

        <input
          placeholder="Power (W)"
          type="number"
          value={newPower}
          onChange={(e) => setNewPower(e.target.value)}
        />

        <button
          className="button"
          onClick={() => {
            if (!newCategory || !newName || !newPower) {
              alert('Please fill in all fields.');
              return;
            }
            addToDatabase();
          }}
        >
          Add
        </button>
        <button onClick={resetDatabaseToDefault} style={{ marginLeft: '1rem' }}>
          🔄 Reset DB to default
        </button>
      </div>
    </div>
  );
}
