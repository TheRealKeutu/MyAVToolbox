// osc-server.js
import express from 'express';
import { WebSocketServer } from 'ws';
import osc from 'osc'; // ✅ Import compatible avec CommonJS

const { UDPPort } = osc;

const app = express();
const HTTP_PORT = 3001;         // Port HTTP pour WebSocket
const OSC_LISTEN_PORT = 57121;  // Port UDP entrant OSC

// WebSocket server (sans HTTP intégré)
const wss = new WebSocketServer({ noServer: true });

// OSC UDP listener
const oscUDP = new UDPPort({
  localAddress: '0.0.0.0',
  localPort: OSC_LISTEN_PORT,
  metadata: true,
});

oscUDP.on('ready', () => {
  console.log(`✅ OSC listening on udp://${oscUDP.options.localAddress}:${oscUDP.options.localPort}`);
});

oscUDP.on('message', (oscMsg) => {
  console.log('🔁 OSC IN:', oscMsg);
  const msg = JSON.stringify(oscMsg);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
});

oscUDP.open();

// Lancer serveur HTTP pour upgrader en WebSocket
const server = app.listen(HTTP_PORT, () => {
  console.log(`🌐 WebSocket server on ws://localhost:${HTTP_PORT}`);
});

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);

    ws.on('message', (data) => {
      try {
        const { address, args, targetIp = '127.0.0.1', targetPort = 53000 } = JSON.parse(data);
        console.log('📤 Sending OSC to', targetIp, targetPort, '→', address);
        oscUDP.send({ address, args }, targetIp, targetPort);
      } catch (e) {
        console.error('❌ Invalid OSC message:', data);
      }
    });
  });
});
