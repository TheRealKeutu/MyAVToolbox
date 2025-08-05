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

const resolutions = {
  '720p': 5,
  '1080p': 8,
  '4K': 20
};

const framerates = [24, 25, 30, 50, 60];

const codecs = {
  'H.264': 1,
  'ProRes': 5,
  'DNxHD': 4
};

export default function VideoCalculator() {
  const [resolution, setResolution] = useState('1080p');
  const [framerate, setFramerate] = useState(25);
  const [codec, setCodec] = useState('H.264');
  const [duration, setDuration] = useState(10); // en minutes

  const [bitrate, setBitrate] = useState(0);
  const [filesize, setFilesize] = useState(0);

  useEffect(() => {
    const baseRate = resolutions[resolution]; // Mbit/s de base
    const codecFactor = codecs[codec]; // multiplicateur selon codec
    const bitrateCalc = baseRate * (framerate / 25) * codecFactor;
    setBitrate(bitrateCalc.toFixed(1));

    const sizeInGB = (bitrateCalc * 60 * duration) / 8 / 1000;
    setFilesize(sizeInGB.toFixed(2));
  }, [resolution, framerate, codec, duration]);

  return (
    <div style={{ padding: '2rem' }}>
        <h1>Vidéo 🎬</h1>
      <h2>Video Bitrate Calculator</h2>
        <p>A tool to :</p>
        <p>Calculate approximate bitrate based on codec, resolution, and frame rate
           Provide guideline values</p>
      

      <div>
        <label>Resolution : </label>
        <select value={resolution} onChange={e => setResolution(e.target.value)}>
          {Object.keys(resolutions).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Framerate : </label>
        <select value={framerate} onChange={e => setFramerate(Number(e.target.value))}>
          {framerates.map(f => (
            <option key={f} value={f}>{f} fps</option>
          ))}
        </select>
      </div>

      <div>
        <label>Codec : </label>
        <select value={codec} onChange={e => setCodec(e.target.value)}>
          {Object.keys(codecs).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Duration (minutes) : </label>
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
        />
      </div>

      <h3>Estimated bitrate : {bitrate} Mbit/s</h3>
      <h3>Approximate file size : {filesize} Go</h3>
    </div>
  );
}
