/* eslint-disable no-unused-vars */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { CHANNEL_SUBSCRIBE, CHANNEL_UNSUBSCRIBE } from './broker/message.js';
import { ExchangeManager } from './broker/exchange.js';
import logger from './utils/logger.js';

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
  logger.info('Connection established', {
    remoteAddress: ws._socket.remoteAddress,
    remotePort: ws._socket.remotePort
  });

  ws.on('message', function (data) {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      logger.error('Invalid JSON message received', { error: err.message });
      return;
    }

    if (msg.type === HEARTBEAT_TYPE) {
      if (LOG_HEARTBEATS) {
        logger.debug('Heartbeat received', {
          remoteAddress: ws._socket.remoteAddress
        });
      }
      return;
    }

    if (!msg || typeof msg !== 'object') {
      logger.error('Message must be a valid object');
      return;
    }

    const requiredFields = ['exchange', 'channel', 'type'];
    for (const field of requiredFields) {
      if (!(field in msg)) {
        logger.error(`Missing required field: ${field}`);
        return;
      }
    }

    if (typeof msg.exchange !== 'string' || msg.exchange.length > 1000) {
      logger.error('Invalid exchange identifier');
      return;
    }
    if (typeof msg.channel !== 'string' || msg.channel.length > 1000) {
      logger.error('Invalid channel identifier');
      return;
    }
    if (typeof msg.type !== 'number') {
      logger.error('Message type must be a number');
      return;
    }

    let exchange = exchangeManager.getExchange(msg['exchange']);
    if (!exchange) {
      exchange = exchangeManager.addExchange(msg['exchange']);
    }

    let channel = exchange.getChannel(msg['channel']);
    if (!channel) {
      try {
        channel = exchange.addChannel(msg['channel']);
      } catch (err) {
        logger.error('Error adding channel', { error: err.message });
        return;
      }
    }

    const client = ws;

    if (msg.type < 0 || msg.type > 10000) {
      logger.error(`Message type out of valid range: ${msg.type}`);
      return;
    }

    if (msg.type === CHANNEL_SUBSCRIBE) {
      logger.info('Subscribe request received', { 
        message: msg,
        remoteAddress: ws._socket.remoteAddress 
      });
      exchange.subscribeToChannel(msg.channel, client);
    }
    else if (msg.type === CHANNEL_UNSUBSCRIBE) {
      logger.info('Unsubscribe request received', { 
        message: msg,
        remoteAddress: ws._socket.remoteAddress 
      });
      exchange.unsubscribeFromChannel(msg.channel, client);
    }
    else if (msg.type >= 1000) {
      exchange.broadcastToChannel(msg.channel, msg);
    }
    else {
      logger.error(`Unknown message type: ${msg.type}`);
    }
  });

  ws.on('close', function () {
    for (const [_, exch] of Object.entries(exchangeManager.exchanges)) {
      const channels = exch.channel_mgr.channels;
      for (const [__, channel] of Object.entries(channels)) {
        for (const [___, client] of Object.entries(channel.clients)) {
          if (client === ws) {
            logger.info('Client removed', {
              exchange: exch.uuid,
              channel: channel.uuid,
              client: client.uuid
            });

            channel.removeClient(client);
          }
        }
      }
    }
  });
});

server.listen(port, function () {
  logger.info('AtomicTessellator - WebSocket Server started', {
    version: '0.2.3',
    port: port
  });
  
  logger.info('Health check endpoints available', {
    endpoints: [
      `http://0.0.0.0:${port}/`,
      `http://0.0.0.0:${port}/health`,
      `http://0.0.0.0:${port}/healthcheck`
    ]
  });
});
