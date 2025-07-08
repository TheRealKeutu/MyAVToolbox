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

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { ipcMain } = require('electron');

let port;
let parser;

ipcMain.on('dmx-start', (event, portPath) => {
  port = new SerialPort({ path: portPath, baudRate: 250000 }); // vitesse standard DMX
  parser = port.pipe(new ReadlineParser());

  parser.on('data', (line) => {
    // line = buffer DMX (ex. trame de 512 valeurs)
    const dmxData = line.split(',').map(Number); // Adapte au format réel du device
    event.sender.send('dmx-data', dmxData);
  });

  port.on('error', (err) => {
    console.error('Erreur port série:', err);
  });
});
