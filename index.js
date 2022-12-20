const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');

const message = require('./messages.js');

const app = express();
const port = 5000;

const server = createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {};

wss.on('connection', function(ws) {
  console.log("Connection from " + ws._socket.remoteAddress + ":" + ws._socket.remotePort + " established.");

  ws.on('message', function(data) {

    var incoming = message.decode(data);

    console.log("Received -> " + incoming.type, incoming.payload);

  });

  ws.on('close', function() {
    console.log("client left.");
  });
});

server.listen(port, function() {
  console.log(`Listening on port:${port}`);
});
