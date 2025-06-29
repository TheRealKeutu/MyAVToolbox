import React from 'react';

export default function LightingToolbox({ onSelect }) {
  return (
    <div className="buttonGroup">
      <button className="button" onClick={() => onSelect('DmxDipswitch')}>🎚️ DMX dipswitches</button>
    </div>
  );
}