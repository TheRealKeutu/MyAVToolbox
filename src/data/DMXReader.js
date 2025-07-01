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
