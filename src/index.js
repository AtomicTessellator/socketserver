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

wss.on('connection', function (ws) {
  console.log(
    `Connection from ${ws._socket.remoteAddress}:` +
    `${ws._socket.remotePort} established.`,
  );

  ws.on('message', function (data) {
    const msg = JSON.parse(data);

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

    if (msg['type'] == CHANNEL_SUBSCRIBE) {
      console.log(`Subscribe ${data}`);
      exchange.subscribeToChannel(msg['channel'], client);
    }
    else if (msg['type'] == CHANNEL_UNSUBSCRIBE) {
      console.log(`Unsubscribe ${data}`);
      exchange.unsubscribeFromChannel(msg['channel'], client);
    }
    else if (msg['type'] >= 1000) {
      exchange.broadcastToChannel(msg['channel'], msg);
      // We also broadcast to the channel with the same UUID as the exchange
      // itself.
      // In the AtomicT backend and frontend an Exchange is a "Project"
      // and a channel is an individual object. If a user wants to subscribe
      // to changes to an indivdual object, they subscribe to the object's
      // channel. If they want to subscribe to changes to the entire project,
      // they subscribe to the project's channel on the project's exchange.
      // data is broadcasted twice because clients are subscribing with exchange=[project_id], channel=[project_id]
      // exchange.broadcastToChannel(msg['exchange'], msg);
    }
    else {
      console.log(`Unknown message type: ${msg['type']}`);
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
  console.log(`AtomicTessellator - WebSocket Server v0.2.2`);
  console.log(`Listening on port:${port}`);
});

// Second app server to respond to health checks
let app2 = express();

// Add health check endpoints
app2.get('/', (req, res) => {
  res.sendStatus(200);
});

app2.get('/health', (req, res) => {
  res.sendStatus(200);
});

app2.get('/healthcheck', (req, res) => {
  res.sendStatus(200);
});

app2.listen(80, () => {
  console.log(`Health check server listening on port:80`);
});
