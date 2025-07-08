// save as addGPLHeader.js
const fs = require('fs');
const path = require('path');

const header = `/*
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
`;

function addHeaderToFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('GNU General Public License')) {
    console.log(`Header already present: ${filePath}`);
    return;
  }
  const newContent = header + '\n' + content;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Added header to: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      addHeaderToFile(fullPath);
    }
    if (stat.isDirectory()) {
      // Ignore node_modules
      if (file === 'node_modules') continue;
      walkDir(fullPath);
    }
  }
}


// Remplace '.' par le chemin de ton dossier source si besoin
walkDir('.');
