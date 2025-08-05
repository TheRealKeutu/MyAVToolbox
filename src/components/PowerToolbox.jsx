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

export default function PowerToolbox({ onSelect }) {
  return (
    <div className="content">
      <h1>Power ToolBox</h1>

      <div className="buttonGroup">
          <button className="button" onClick={() => onSelect('power')}>⚡️ Equipment consumption</button>
          <button className="button" onClick={() => onSelect('CableSectionCalculator')}>⚡️ Cable section and power</button>
      </div>
    </div>  
  );
}
