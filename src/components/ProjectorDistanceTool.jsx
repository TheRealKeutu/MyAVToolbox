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

export default function ProjectorDistanceTool() {
  const [inverseMode, setInverseMode] = useState(false);

  const [width, setWidth] = useState(3);
  const [ratio, setRatio] = useState('16:9');
  const [distance, setDistance] = useState(5);
  const [lux, setLux] = useState(500);
  const [gain, setGain] = useState(1);
  const [throwMin, setThrowMin] = useState(1.4);
  const [throwMax, setThrowMax] = useState(2.0);

  const [w, h] = ratio.split(':').map(Number);
  const imageHeight = width * h / w;
  const surface = width * imageHeight;
  const throwRatio = distance / width;
  const lumensRequired = Math.round(surface * lux / gain);
  const minDistance = (throwMin * width).toFixed(2);
  const maxDistance = (throwMax * width).toFixed(2);

  return (
    <div>
      <h2>🎥 Projector & Distance Tool</h2>

      <button
        className={`button ${inverseMode ? 'active' : ''}`}
        onClick={() => setInverseMode(!inverseMode)}
      >
        {inverseMode ? '🔁 Inverse mode enabled' : '🔁 Enable inverse mode'}
      </button>

      <br /><br />

      <label>Image width (m):
        <input type="number" value={width} onChange={e => setWidth(+e.target.value)} />
      </label><br />

      <label>Aspect ratio:
        <select value={ratio} onChange={e => setRatio(e.target.value)}>
          <option>16:9</option>
          <option>4:3</option>
          <option>1.85:1</option>
          <option>2.35:1</option>
        </select>
      </label><br />

      {!inverseMode ? (
        <>
          <label>Projection distance (m):
            <input type="number" value={distance} onChange={e => setDistance(+e.target.value)} />
          </label><br />

          <label>Ambient brightness (lux):
            <input type="number" value={lux} onChange={e => setLux(+e.target.value)} />
          </label><br />

          <label>Screen gain:
            <input type="number" step="0.1" value={gain} onChange={e => setGain(+e.target.value)} />
          </label><br />

          <hr />
          <p><strong>Image height:</strong> {imageHeight.toFixed(2)} m</p>
          <p><strong>Throw ratio:</strong> {throwRatio.toFixed(2)}</p>
          <p><strong>Required lumens:</strong> {lumensRequired} lm</p>
        </>
      ) : (
        <>
          <label>Minimum throw ratio:
            <input type="number" step="0.01" value={throwMin} onChange={e => setThrowMin(+e.target.value)} />
          </label><br />
          <label>Maximum throw ratio:
            <input type="number" step="0.01" value={throwMax} onChange={e => setThrowMax(+e.target.value)} />
          </label><br />

          <hr />
          <p><strong>Image height:</strong> {imageHeight.toFixed(2)} m</p>
          <p><strong>Recommended throw distance:</strong> between {minDistance} m and {maxDistance} m</p>
        </>
      )}
    </div>
  );
}
