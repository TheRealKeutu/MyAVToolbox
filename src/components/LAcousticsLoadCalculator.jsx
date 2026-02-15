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

import React, { useState } from "react";
import data from "../data/l-acoustics-max-loads.json";
import ampSpecs from "../data/ampSpecs.json"; // puissance en A @230V

const amps = ["LA4", "LA4X", "LA8", "LA12X", "LA2Xi", "LA7"];
const allSeries = ["A", "X", "SUB", "K", "SY", "Legacy", "All"];

export default function LAcousticsTable() {
  const [filter, setFilter] = useState("All");
  const [selection, setSelection] = useState([]);
  const [ampConfig, setAmpConfig] = useState(
    amps.reduce((acc, amp) => ({ ...acc, [amp]: 0 }), {})
  );

  // --- Filtrage des enceintes ---
  const filteredData = Object.entries(data).filter(([_, value]) => {
    const seriesList = Array.isArray(value.series)
      ? value.series
      : value.serie
      ? [value.serie]
      : [];
    return filter === "All" || seriesList.includes(filter);
  });

  // --- Gestion des enceintes ---
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
  const handleQtyChange = (model, qty) =>
    setSelection((prev) =>
      prev.map((item) =>
        item.model === model ? { ...item, qty: parseInt(qty, 10) || 0 } : item
      )
    );
  const handleRemove = (model) =>
    setSelection((prev) => prev.filter((item) => item.model !== model));
  const handleReset = () => setSelection([]);

  // --- Calcul du nombre d’amplis nécessaires par type ---
  const totalPerAmp = amps.reduce((acc, amp) => {
    acc[amp] = 0;
    selection.forEach(({ model, qty }) => {
      const maxPerAmp = data[model]?.[amp];
      if (maxPerAmp) acc[amp] += Math.ceil(qty / maxPerAmp);
    });
    return acc;
  }, {});

  // --- Consommation électrique totale ---
  const totalConsumption = Object.entries(ampConfig).reduce(
    (sum, [amp, qty]) => sum + qty * (ampSpecs[amp]?.powerDraw || 0),
    0
  );

  // --- Allocation conservatrice et validation ---
  function allocateAmps({ selection, ampConfig, data, amps }) {
    const remainingAmps = Object.fromEntries(
      amps.map((a) => [a, ampConfig[a] || 0])
    );
    const allocation = {};
    const deficits = {};

    const orderedSelection = [...selection].sort((s1, s2) => {
      const opts1 = amps.filter((a) => data[s1.model]?.[a] > 0).length;
      const opts2 = amps.filter((a) => data[s2.model]?.[a] > 0).length;
      if (opts1 !== opts2) return opts1 - opts2;
      return s2.qty - s1.qty;
    });

    for (const { model, qty } of orderedSelection) {
      let remainingQty = qty;

      const options = amps
        .filter((amp) => data[model]?.[amp] > 0)
        .map((amp) => ({ amp, cap: data[model][amp] }))
        .sort((a, b) => b.cap - a.cap);

      for (const { amp, cap } of options) {
        const free = remainingAmps[amp] || 0;
        if (free <= 0 || remainingQty <= 0) continue;

        const ampsNeeded = Math.ceil(remainingQty / cap);
        const ampsToUse = Math.min(free, ampsNeeded);

        if (ampsToUse > 0) {
          remainingAmps[amp] -= ampsToUse;
          allocation[model] = allocation[model] || {};
          allocation[model][amp] = (allocation[model][amp] || 0) + ampsToUse;
          remainingQty = Math.max(0, remainingQty - ampsToUse * cap);
        }
      }

      if (remainingQty > 0) deficits[model] = remainingQty;
    }

    const feasible = Object.keys(deficits).length === 0;
    return { feasible, allocation, deficits, remainingAmps };
  }

  const { feasible, allocation, deficits, remainingAmps } = allocateAmps({
    selection,
    ampConfig,
    data,
    amps,
  });

  // --- Message global ---
  let globalMessage = "";
  let globalColor = "black";
  if (selection.length === 0) {
    globalMessage = "Addspeakers to start configuration check.";
  } else if (Object.keys(deficits).length > 0) {
    globalMessage = "❌ Insufficent : some speakers are not covered.";
    globalColor = "red";
  } else {
    const extra = amps
      .map((a) => ({ a, n: remainingAmps[a] || 0 }))
      .filter((x) => x.n > 0);
    if (extra.length > 0) {
      globalMessage =
        "⚠️ Ok :  valid configuration (Spare Amps not used).";
      globalColor = "orange";
    } else {
      globalMessage = "✅ Perfect : All needs covered.";
      globalColor = "green";
    }
  }

  // --- Auto-fill amplis manquants ---
  const handleAutoFillAmps = () => {
    const newConfig = { ...ampConfig };
    Object.entries(deficits).forEach(([model, missing]) => {
      let remaining = missing;
      const options = amps
        .filter((a) => data[model]?.[a] > 0)
        .map((a) => ({ amp: a, cap: data[model][a] }))
        .sort((a, b) => b.cap - a.cap);

      for (const { amp, cap } of options) {
        const needed = Math.ceil(remaining / cap);
        newConfig[amp] = (newConfig[amp] || 0) + needed;
        remaining -= needed * cap;
        if (remaining <= 0) break;
      }
    });
    setAmpConfig(newConfig);
  };

  return (
    <div className="content">
      <h1>🔌 L-Acoustics load table</h1>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          borderBottom: "2px solid #ccc",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {allSeries.map((serie) => (
          <button
            key={serie}
            onClick={() => setFilter(serie)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom:
                filter === serie ? "3px solid #facc15" : "3px solid transparent",
              backgroundColor: "transparent",
              fontWeight: filter === serie ? "bold" : "normal",
              color: filter === serie ? "#000" : "#666",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {serie}
          </button>
        ))}
      </div>

      {/* Table enceintes */}
      <div style={{ overflowX: "auto", marginTop: "1rem" }}>
        <table className="table" style={{ minWidth: "700px" }}>
          <thead>
            <tr>
              <th>Model</th>
              {amps.map((amp) => (
                <th key={amp}>{amp}</th>
              ))}
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(([speaker, ampData]) => (
              <tr key={speaker}>
                <td>
                  <strong>{speaker}</strong>
                </td>
                {amps.map((amp) => (
                  <td key={amp} style={{ textAlign: "center" }}>
                    {ampData[amp] !== undefined ? ampData[amp] : "--"}
                  </td>
                ))}
                <td style={{ textAlign: "center" }}>
                  <button className="button" onClick={() => handleAdd(speaker)}>
                    ➕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sélection enceintes */}
      {selection.length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem" }}>📦 Selected configuration </h2>
          <table className="table" style={{ marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>Model</th>
                <th>Quantity</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {selection.map(({ model, qty }) => (
                <tr key={model}>
                  <td>
                    <strong>{model}</strong>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQtyChange(model, e.target.value)}
                      style={{ width: "60px" }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="button"
                      style={{ backgroundColor: "#f87171", color: "white" }}
                      onClick={() => handleRemove(model)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="button"
            onClick={handleReset}
            style={{ marginTop: "1rem", backgroundColor: "#eee" }}
          >
            🔄 Reinitialise
          </button>

          {/* Auto-fill amplis */}
          {Object.keys(deficits).length > 0 && (
            <button
              className="button"
              onClick={handleAutoFillAmps}
              style={{
                marginTop: "1rem",
                marginLeft: "1rem",
                backgroundColor: "#34d399",
                color: "white",
              }}
            >
               Auto-fill missing amps
            </button>
          )}
        </>
      )}

      {/* Nombre d’amplis calculé */}
      <h3 style={{ marginTop: "2rem" }}>📈 Number of amps needed</h3>
      <table className="table" style={{ marginTop: "0.5rem" }}>
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
              <td
                key={amp}
                style={{ textAlign: "center", fontWeight: "bold" }}
              >
                {totalPerAmp[amp]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Configuration personnalisée */}
      <h3 style={{ marginTop: "2rem" }}>⚡ Custom amplifier configuration</h3>
      <table className="table" style={{ marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th>Amp</th>
            <th>Quantity</th>
            <th>Power Draw (A)</th>
          </tr>
        </thead>
        <tbody>
          {amps.map((amp) => (
            <tr key={amp}>
              <td>
                <strong>{amp}</strong>
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={ampConfig[amp]}
                  onChange={(e) =>
                    setAmpConfig({
                      ...ampConfig,
                      [amp]: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  style={{ width: "60px" }}
                />
              </td>
              <td>{ampSpecs[amp]?.powerDraw || "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Consommation et message global */}
      <h4 style={{ marginTop: "1rem" }}>
        🔋 Total consumption: <strong>{totalConsumption.toFixed(1)} A @230V</strong>
      </h4>
      <p
        style={{ marginTop: "0.5rem", fontWeight: "bold", color: globalColor }}
      >
        {globalMessage}
      </p>

      {/* Déficits détaillés */}
      {Object.keys(deficits).length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <strong>miss by type :</strong>
          <ul style={{ marginTop: 6 }}>
            {Object.entries(deficits).map(([model, missing]) => {
              const options = amps
                .filter((a) => data[model]?.[a] > 0)
                .map((a) => ({
                  amp: a,
                  cap: data[model][a],
                  need: Math.ceil(missing / data[model][a]),
                }))
                .sort((x, y) => x.need - y.need);
              const best = options[0];
              return (
                <li key={model}>
                  {model} : {missing} non covered.{" "}
                  {best ? (
                    <em>
                      Ex. Add {best.need} × {best.amp} (cap. {best.cap}/amp)
                    </em>
                  ) : (
                    <em>No amp type compatible in the table.</em>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Allocation détaillée si faisable */}
      {feasible && (
        <details style={{ marginTop: "0.5rem" }}>
          <summary>See proposed affectation</summary>
          <ul style={{ marginTop: 6 }}>
            {Object.entries(allocation).map(([model, perAmp]) => (
              <li key={model}>
                <strong>{model}</strong> →{" "}
                {Object.entries(perAmp)
                  .map(
                    ([amp, n]) =>
                      `${n} × ${amp} (${n * (data[model][amp] || 0)} max couverts)`
                  )
                  .join(", ")}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
