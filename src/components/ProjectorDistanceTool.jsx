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
  const [modeInverse, setModeInverse] = useState(false);

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
      <h2>🎥 Projecteur & Distance Tool</h2>

      <button
        className={`button ${modeInverse ? 'active' : ''}`}
        onClick={() => setModeInverse(!modeInverse)}
      >
        {modeInverse ? '🔁 Mode inversé activé' : '🔁 Activer mode inversé'}
      </button>

      <br /><br />

      <label>Largeur de l’image (m) :
        <input type="number" value={width} onChange={e => setWidth(+e.target.value)} />
      </label><br />

      <label>Ratio d’image :
        <select value={ratio} onChange={e => setRatio(e.target.value)}>
          <option>16:9</option>
          <option>4:3</option>
          <option>1.85:1</option>
          <option>2.35:1</option>
        </select>
      </label><br />

      {!modeInverse ? (
        <>
          <label>Distance de projection (m) :
            <input type="number" value={distance} onChange={e => setDistance(+e.target.value)} />
          </label><br />

          <label>Luminosité ambiante (lux) :
            <input type="number" value={lux} onChange={e => setLux(+e.target.value)} />
          </label><br />

          <label>Gain de l’écran :
            <input type="number" step="0.1" value={gain} onChange={e => setGain(+e.target.value)} />
          </label><br />

          <hr />
          <p><strong>Hauteur de l’image :</strong> {imageHeight.toFixed(2)} m</p>
          <p><strong>Throw Ratio :</strong> {throwRatio.toFixed(2)}</p>
          <p><strong>Lumens nécessaires :</strong> {lumensRequired} lm</p>
        </>
      ) : (
        <>
          <label>Focale min (throw ratio) :
            <input type="number" step="0.01" value={throwMin} onChange={e => setThrowMin(+e.target.value)} />
          </label><br />
          <label>Focale max (throw ratio) :
            <input type="number" step="0.01" value={throwMax} onChange={e => setThrowMax(+e.target.value)} />
          </label><br />

          <hr />
          <p><strong>Hauteur de l’image :</strong> {imageHeight.toFixed(2)} m</p>
          <p><strong>Distance de placement :</strong> entre {minDistance} m et {maxDistance} m</p>
        </>
      )}
    </div>
  );
}

