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

const sampleRates = [44100, 48000, 96000, 192000, 384000];
const resolutions = [8, 16, 24, 32];

export default function AudioCalculator() {
  const [sampleRate, setSampleRate] = useState(48000);
  const [bitDepth, setBitDepth] = useState(24);
  const [channels, setChannels] = useState(2);
  const [bandwidth, setBandwidth] = useState(0);

  const [temperature, setTemperature] = useState(20); // °C
  const [time, setTime] = useState(0); // ms
  const [distance, setDistance] = useState(0); // m

  const [freq, setFreq] = useState(1000); // Hz
  const [speed, setSpeed] = useState(0);
  const [period, setPeriod] = useState(0); // s
  const [wavelength, setWavelength] = useState(0);

  const [bpm, setBpm] = useState(120);
  const [ms, setMs] = useState((60000 / 120).toFixed(2));
  const eighthNote = (ms / 2).toFixed(2);
  const dottedEighth = (ms * 2 / 3).toFixed(2);

  useEffect(() => {
    setMs((60000 / bpm).toFixed(2));
  }, [bpm]);

  const handleMsChange = (value) => {
    const msVal = parseFloat(value);
    setMs(msVal);
    if (msVal > 0) setBpm((60000 / msVal).toFixed(2));
  };

  useEffect(() => {
    const bw = (sampleRate * bitDepth * channels) / 1000000;
    setBandwidth(bw.toFixed(2));
  }, [sampleRate, bitDepth, channels]);

  useEffect(() => {
    const c = 331.4 + 0.6 * temperature;
    setSpeed(c);
    const dist = (c * (time / 1000)).toFixed(2);
    setDistance(dist);
  }, [time, temperature]);

  const handleDistanceChange = (e) => {
    const newDistance = parseFloat(e.target.value);
    setDistance(newDistance);
    const c = 331.4 + 0.6 * temperature;
    const newTime = ((newDistance / c) * 1000).toFixed(2);
    setTime(newTime);
  };

  useEffect(() => {
    const c = 331.4 + 0.6 * temperature;
    setSpeed(c);
    const T = 1 / freq;
    const λ = c / freq;
    setPeriod(T.toFixed(6));
    setWavelength(λ.toFixed(3));
  }, [freq, temperature]);

  return (
    <div className="content">
      <h1>Audio 🔈</h1>

      {/* Distance / Temps */}
      <section>
        <h2>Distance / Time Calculator</h2>
        <div className="buttonGroup">
          <label>
            Température (°C) :
            <input type="number" value={temperature} onChange={e => setTemperature(Number(e.target.value))} />
          </label>
          <label>
            Time (ms) :
            <input type="number" value={time} onChange={e => setTime(Number(e.target.value))} />
          </label>
          <label>
            Distance (m) :
            <input type="number" value={distance} onChange={handleDistanceChange} />
          </label>
        </div>
      </section>

      <hr />

      {/* Longueur d’onde */}
      <section>
        <h2>Wavelength calculator λ</h2>
        <div className="buttonGroup">
          <label>
            Frequency (Hz) :
            <input type="number" value={freq} onChange={e => setFreq(Number(e.target.value))} />
          </label>
          <div>
            <p>Speed of sound : {speed.toFixed(2)} m/s</p>
            <p>Period : {period} s</p>
            <p>Wavelength λ : {wavelength} m</p>
            <p>½ λ : {(wavelength / 2).toFixed(3)} m</p>
            <p>¼ λ : {(wavelength / 4).toFixed(3)} m</p>
          </div>
        </div>
      </section>

      <hr />

      {/* BPM ↔ Millisecondes */}
      <section>
        <h2>BPM / Milliseconds converter</h2>
        <div className="buttonGroup">
          <label>
            BPM :
            <input type="number" value={bpm} min={1} onChange={e => setBpm(Number(e.target.value))} />
          </label>
          <div>
            <p>♪ Quarter note (1/4) : {ms} ms</p>
            <p>♪ Eighth note (1/8) : {eighthNote} ms</p>
            <p>♪ Dotted eighth (1/8T) : {dottedEighth} ms</p>
          </div>
        </div>
      </section>

      {/* Bande passante — désactivée pour l’instant */}
      {/* <hr />
      <section>
        <h2>Bande passante audio</h2>
        <div className="buttonGroup">
          <label>
            Fréquence d’échantillonnage :
            <select value={sampleRate} onChange={e => setSampleRate(Number(e.target.value))}>
              {sampleRates.map(rate => (
                <option key={rate} value={rate}>{rate.toLocaleString()} Hz</option>
              ))}
            </select>
          </label>
          <label>
            Résolution (bit depth) :
            <select value={bitDepth} onChange={e => setBitDepth(Number(e.target.value))}>
              {resolutions.map(depth => (
                <option key={depth} value={depth}>{depth} bits</option>
              ))}
            </select>
          </label>
          <label>
            Nombre de canaux :
            <input type="number" value={channels} min={1} onChange={e => setChannels(Number(e.target.value))} />
          </label>
          <p>Bande passante : {bandwidth} Mbit/s</p>
        </div>
      </section> */}
    </div>
  );
}
