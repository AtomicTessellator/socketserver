const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const app = express();
const port = 5000;
const server = createServer(app);
const wss = new WebSocket.Server({ server });

/*
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│                    ┌────────────────────────────────────────────────┐  │
│  Exchange          │  A collection of channels, each Insilico Lab   │  │
│                    │  is an exchange.                               │  │
│                    └────────────────────────────────────────────────┘  │
│                                                                        │
│                    ┌───────────────────────┐  ┌─────────────────────┐  │
│  Channel           │                       │  │                     │  │
│  A channel is a    │                       │  │                     │  │
│  unqiue GameObject │                       │  │                     │  │
│                    │ e.g. a Hologrid       │  │ or an AIPod         │  │
│                    └───────────────────────┘  └─────────────────────┘  │
│                                                                        │
│                   ┌────────────────────────────────────┐               │
│  Messages         | Indivial messages sent to channels |               │
│                   └────────────────────────────────────┘               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
*/

const exchange = require('./broker/exchange.js');
const message = require('./broker/message.js');
const exchangeManager = new exchange.ExchangeManager();


wss.on('connection', function(ws) {
  console.log(
    `Connection from ${ws._socket.remoteAddress}:` + 
    `${ws._socket.remotePort} established.`);

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

    var msg = message.decode(data);

    /* Get exchange */
    var exchange = exchangeManager.getExchange(msg.exchange);
    if(!exchange) {
      exchange = exchangeManager.addExchange(msg.exchange);
    }

    /* Get channel */
    var channel = exchange.getChannel(msg.channel);
    if(!channel) {
      try {
        channel = exchange.addChannel(msg.channel);
      }
      catch(err) {
        console.log(err);
      }
    }

    /* Process the message */
    var client = getClient();

    if(msg.type == message.CHANNEL_SUBSCRIBE) {
      console.log('Subscribe', msg);
      exchange.subscribeToChannel(msg.channel, client);
      return;
    }
    
    if(msg.type == message.MESSAGE_TYPE_UNSUBSCRIBE) {
      console.log('Unsubscribe', msg);
      exchange.unsubscribeFromChannel(msg.channel, client);
      return;
    }

    if(msg.type == message.CHANNEL_PUBLISH) {
      console.log('Broadcast -', 'Channel:', msg.channel, msg.message);
      exchange.broadcastToChannel(msg.channel, msg.payload);
      return;
    }

    console.log("Unknown message type: " + msg.type);
  });

  ws.on('close', function() {
    // Each exchange has a channel manager, which has a list of clients.
    // When a client disconnects, we need to remove them from all channels.

    for (const [exchange_uuid, exchange] of Object.entries(exchangeManager.exchanges)) {
      //console.log('close', exchange);

      for(const [channel_uuid, channel] of Object.entries(exchange.channel_mgr.channels)) {
        console.log('channel', channel);

        for (const [client_uuid, client] of Object.entries(channel.clients)) {
          console.log('client', client);

          if(client === ws) {
            console.log('Removing client', client_uuid);
            channel.removeClient(client_uuid);
          }
        }
      }
    }
  });
});

server.listen(port, function() {
  console.log(`Listening on port:${port}`);
});
