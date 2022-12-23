const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');

const message = require('./messages.js');
const channel = require('./channel.js');

const app = express();
const port = 5000;

const server = createServer(app);
const wss = new WebSocket.Server({ server });

const channelManager = new channel.ChannelManager();


wss.on('connection', function(ws) {
  console.log("Connection from " + ws._socket.remoteAddress + ":" + ws._socket.remotePort + " established.");

  function getClient() {
    // This is a weird way to get the client object,
    // but it works.
    var client = null;
    wss.clients.forEach(function each(c) {
      if (c === ws) {
        client = c;
      }
    });
    return client;
  }

  ws.on('message', function(data) {

    var client = getClient();

    var msg = message.decode(data);

    if(msg.type == message.MESSAGE_TYPE_SUBSCRIBE) {
      console.log('subscribe', msg);
      channelManager.subscribe(msg.destination, client);
    }
    else if(msg.type == message.MESSAGE_TYPE_UNSUBSCRIBE) {
      console.log('unsubscribe', msg);
      channelManager.unsubscribe(msg.destination, client);
    }
    else if(msg.type == message.MESSAGE_PUBLISH) {
      console.log('broadcast', msg.destination, msg.payload);
      channelManager.broadcastToChannel(msg.destination, msg.payload);
    }
    else {
      console.log("Unknown message type: " + msg.type);
    }
  });

  ws.on('close', function() {
    var client = getClient();
    channelManager.unsubscribeAll(client);
  });
});

server.listen(port, function() {
  console.log(`Listening on port:${port}`);
});
