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
      return;
    }

    if (msg['type'] == CHANNEL_UNSUBSCRIBE) {
      console.log(`Unsubscribe ${data}`);

      exchange.unsubscribeFromChannel(msg['channel'], client);
      return;
    }

    if (msg['type'] >= 1000) {
      console.log(`Broadcast`, JSON.stringify(msg));

      exchange.broadcastToChannel(msg['channel'], msg);
      return;
    }

    console.log(`Unknown message type: ${msg['type']}`);
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
  console.log(`Listening on port:${port}`);
});
