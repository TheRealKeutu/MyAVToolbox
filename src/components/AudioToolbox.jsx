import React from 'react';

export default function AudioToolbox({ onSelect }) {
  return (
    <div className="buttonGroup">
      <button className="button" onClick={() => onSelect('rose-noise')}>🎵 Générateur de signal</button>
      <button className="button" onClick={() => onSelect('bandwidth')}>🎛 Calculateur audio</button>
      <button className="button" onClick={() => onSelect('LAcousticsLoadCalc')}>📦 LAcoustics calculateur de charge </button>
      <button className="button" onClick={() => onSelect('PreAlignmentCalculator')}>📐 LAcoustics Pré-alignement</button>
      <button className="button" onClick={() => onSelect('RFLinkCalculator')}>📶 Bilan Liaisons RF</button>
    </div>
  );
}
