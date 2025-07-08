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
import data from '../data/l-acoustics-max-loads.json';

const amps = ["LA4", "LA4X", "LA8", "LA12X", "LA2Xi", "LA7"];
const allSeries = ["A", "X", "SUB", "K", "SY", "Legacy", "All"];

export default function LAcousticsTable() {
  const [filter, setFilter] = useState("All");
  const [selection, setSelection] = useState([]);

  const filteredData = Object.entries(data).filter(([_, value]) => {
    const seriesList = Array.isArray(value.series)
      ? value.series
      : value.serie
        ? [value.serie]
        : [];

    return filter === "All" || seriesList.includes(filter);
  });

  const handleAdd = (model) => {
    setSelection((prev) => {
      const existing = prev.find((item) => item.model === model);
      if (existing) {
        return prev.map((item) =>
          item.model === model ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { model, qty: 1 }];
    });
  };

  const handleQtyChange = (model, qty) => {
    setSelection((prev) =>
      prev.map((item) =>
        item.model === model ? { ...item, qty: parseInt(qty, 10) || 0 } : item
      )
    );
  };

  const handleRemove = (model) => {
    setSelection((prev) => prev.filter((item) => item.model !== model));
  };

  const handleReset = () => {
    setSelection([]);
  };

  const totalPerAmp = amps.reduce((acc, amp) => {
    acc[amp] = 0;
    selection.forEach(({ model, qty }) => {
      const maxPerAmp = data[model]?.[amp];
      if (maxPerAmp) {
        acc[amp] += Math.ceil(qty / maxPerAmp);
      }
    });
    return acc;
  }, {});

  return (
    <div className="content">
      <h1>🔌 Tableau charge L-Acoustics</h1>
      <p>Nombre d'enceintes par patte d'ampli et calcul du nombre d'amplis nécessaires.</p>

    <div style={{
      display: 'flex',
      gap: '6px',
      borderBottom: '2px solid #ccc',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    }}>
      {allSeries.map((serie) => (
        <button
          key={serie}
          onClick={() => setFilter(serie)}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderBottom: filter === serie ? '3px solid #facc15' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: filter === serie ? 'bold' : 'normal',
            color: filter === serie ? '#000' : '#666',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {serie}
        </button>
      ))}
    </div>

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table className="table" style={{ minWidth: '700px' }}>
          <thead>
            <tr>
              <th>Modèle</th>
              {amps.map((amp) => (
                <th key={amp}>{amp}</th>
              ))}
              <th>Ajouter</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(([speaker, ampData]) => (
              <tr key={speaker}>
                <td><strong>{speaker}</strong></td>
                {amps.map((amp) => (
                  <td key={amp} style={{ textAlign: 'center' }}>
                    {ampData[amp] !== undefined ? ampData[amp] : "--"}
                  </td>
                ))}
                <td style={{ textAlign: 'center' }}>
                  <button className="button" onClick={() => handleAdd(speaker)}>➕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selection.length > 0 && (
        <>
          <h2 style={{ marginTop: '2rem' }}>📦 Configuration sélectionnée</h2>

          <table className="table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Modèle</th>
                <th>Quantité</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selection.map(({ model, qty }) => (
                <tr key={model}>
                  <td><strong>{model}</strong></td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQtyChange(model, e.target.value)}
                      className="input"
                      style={{ width: '60px' }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="button" style={{ backgroundColor: '#f87171', color: 'white' }} onClick={() => handleRemove(model)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="button"
            onClick={handleReset}
            style={{ marginTop: '1rem', backgroundColor: '#eee' }}
          >
            🔄 Réinitialiser
          </button>
        </>
      )}

      {/* Ce bloc est toujours affiché */}
      <h3 style={{ marginTop: '2rem' }}>📈 Nombre d'amplis nécessaires</h3>
      <table className="table" style={{ marginTop: '0.5rem' }}>
        <thead>
          <tr>
            {amps.map((amp) => (
              <th key={amp}>{amp}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {amps.map((amp) => (
              <td key={amp} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                {totalPerAmp[amp]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
