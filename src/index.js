/* eslint-disable no-unused-vars */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { CHANNEL_SUBSCRIBE, CHANNEL_UNSUBSCRIBE } from './broker/message.js';
import { ExchangeManager } from './broker/exchange.js';

const app = express();
const port = 5000;
const server = createServer(app);
const wss = new WebSocketServer({ server });
const exchangeManager = new ExchangeManager();
const LOG_HEARTBEATS = process.env.LOG_HEARTBEATS === 'true';
const HEARTBEAT_TYPE = 'ping';

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/healthcheck', (req, res) => {
  res.sendStatus(200);
});

wss.on('connection', function (ws) {
  console.log(
    `Connection from ${ws._socket.remoteAddress}:` +
    `${ws._socket.remotePort} established.`,
  );

  ws.on('message', function (data) {
    // Special handling for heartbeat messages
    if (msg.type === HEARTBEAT_TYPE) {
      if (LOG_HEARTBEATS) {
        console.log(`Heartbeat received from ${ws._socket.remoteAddress}`);
      }
      return;
    }

    // Wrap everything in a try-catch to handle malformed messages
    try {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch (err) {
        console.error('Invalid JSON message received:', err);
        return;
      }

      // Validate required message properties
      if (!msg || typeof msg !== 'object') {
        console.error('Message must be a valid object');
        return;
      }

      const requiredFields = ['exchange', 'channel', 'type'];
      for (const field of requiredFields) {
        if (!(field in msg)) {
          console.error(`Missing required field: ${field}`);
          return;
        }
      }

      // Validate field types and lengths
      if (typeof msg.exchange !== 'string' || msg.exchange.length > 1000) {
        console.error('Invalid exchange identifier');
        return;
      }
      if (typeof msg.channel !== 'string' || msg.channel.length > 1000) {
        console.error('Invalid channel identifier');
        return;
      }
      if (typeof msg.type !== 'number') {
        console.error('Message type must be a number');
        return;
      }

      /* Get exchange */
      let exchange = exchangeManager.getExchange(msg['exchange']);
      if (!exchange) {
        exchange = exchangeManager.addExchange(msg['exchange']);
      }

      /* Get channel */
      let channel = exchange.getChannel(msg['channel']);
      if (!channel) {
        try {
          channel = exchange.addChannel(msg['channel']);
        } catch (err) {
          console.log(err);
          return;
        }
      }

      /* Process the message */
      const client = ws;

      // Validate message type range
      if (msg.type < 0 || msg.type > 10000) {
        console.error(`Message type out of valid range: ${msg.type}`);
        return;
      }

      if (msg.type === CHANNEL_SUBSCRIBE) {
        console.log(`Subscribe ${JSON.stringify(msg)}`); // Safer logging
        exchange.subscribeToChannel(msg.channel, client);
      }
      else if (msg.type === CHANNEL_UNSUBSCRIBE) {
        console.log(`Unsubscribe ${JSON.stringify(msg)}`); // Safer logging
        exchange.unsubscribeFromChannel(msg.channel, client);
      }
      else if (msg.type >= 1000) {
        // Rate limiting could be added here
        exchange.broadcastToChannel(msg.channel, msg);
      }
      else {
        console.error(`Unknown message type: ${msg.type}`);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', function () {
    // Each exchange has a channel manager, which has a list of clients.
    // When a client disconnects, we need to remove them from all channels.

    for (const [_, exch] of Object.entries(exchangeManager.exchanges)) {
      const channels = exch.channel_mgr.channels;
      for (const [__, channel] of Object.entries(channels)) {
        for (const [___, client] of Object.entries(channel.clients)) {
          if (client === ws) {
            console.log(
              `Removing client - ` +
              `Exchange: ${exch.uuid}, ` +
              `Channel: ${channel.uuid}, ` +
              `Client: ${client.uuid}`,
            );

            channel.removeClient(client);
          }
        }
      }
    }
  });
});

server.listen(port, function () {
  console.log(`AtomicTessellator - WebSocket Server v0.2.3`);
  console.log(`Listening on port:5000`);
  console.log('healthcheks are available at:');
  console.log(`http://0.0.0.0:${port}/`); 
  console.log(`http://0.0.0.0:${port}/health`); 
  console.log(`http://0.0.0.0:${port}/healthcheck`);
});
