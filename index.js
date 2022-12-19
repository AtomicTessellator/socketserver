const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');

const app = express();
const port = 5000;

const server = createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function(ws) {
  console.log("Connection from " + ws._socket.remoteAddress + ":" + ws._socket.remotePort + " established.");

  ws.on('message', function(data) {
    if (typeof(data) === "string") {
      // client sent a string
      console.log("string received from client -> '" + data + "'");

    } else {
      console.log("binary received from client -> " + Array.from(data).join(", ") + "");
    }
  });

  ws.on('close', function() {
    console.log("client left.");
  });
});

server.listen(port, function() {
  console.log(`Listening on port:${port}`);
});
