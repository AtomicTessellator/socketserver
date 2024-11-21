import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
import { ExchangeManager } from '../src/broker/exchange.js';
import { CHANNEL_SUBSCRIBE, CHANNEL_PUBLISH } from '../src/broker/message.js';
import { jest } from '@jest/globals';

// Add constants at the top with other constants
const HEARTBEAT_TYPE = 'ping';

describe('WebSocket Messaging Tests', () => {
    let wss;
    let server;
    let exchangeManager;
    const PORT = 8080;
    const WS_URL = `ws://localhost:${PORT}`;

    beforeEach((done) => {
        server = createServer();
        wss = new WebSocketServer({ server });
        exchangeManager = new ExchangeManager();

        wss.on('error', (error) => {
            console.error('WebSocket Server Error:', error);
        });

        // Setup WebSocket server handlers
        wss.on('connection', (ws) => {
            ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data);
                    
                    if (msg.type === HEARTBEAT_TYPE) {
                        return;
                    }

                    if (!msg || typeof msg !== 'object') {
                        ws.send(JSON.stringify({ 
                            type: 'error', 
                            message: 'Message must be a valid object' 
                        }));
                        return;
                    }

                    const requiredFields = ['exchange', 'channel', 'type'];
                    for (const field of requiredFields) {
                        if (!(field in msg)) {
                            ws.send(JSON.stringify({ 
                                type: 'error', 
                                message: `Missing required field: ${field}` 
                            }));
                            return;
                        }
                    }

                    if (typeof msg.exchange !== 'string' || msg.exchange.length > 1000) {
                        ws.send(JSON.stringify({ 
                            type: 'error', 
                            message: 'Invalid exchange identifier' 
                        }));
                        return;
                    }

                    if (typeof msg.channel !== 'string' || msg.channel.length > 1000) {
                        ws.send(JSON.stringify({ 
                            type: 'error', 
                            message: 'Invalid channel identifier' 
                        }));
                        return;
                    }

                    if (typeof msg.type !== 'number') {
                        ws.send(JSON.stringify({ 
                            type: 'error', 
                            message: 'Message type must be a number' 
                        }));
                        return;
                    }

                    let exchange = exchangeManager.getExchange(msg.exchange);
                    if (!exchange) {
                        exchange = exchangeManager.addExchange(msg.exchange);
                    }

                    if (msg.type === CHANNEL_SUBSCRIBE) {
                        exchange.subscribeToChannel(msg.channel, ws);
                    } else if (msg.type >= 1000) {
                        exchange.broadcastToChannel(msg.channel, msg);
                    }
                } catch (err) {
                    ws.send(JSON.stringify({ 
                        type: 'error', 
                        message: 'Invalid message format' 
                    }));
                }
            });
        });

        server.listen(PORT, done);
    });

    afterEach((done) => {
        // Close all WebSocket connections
        wss.clients.forEach((client) => {
            client.close();
        });

        // Add a small delay before closing server
        setTimeout(() => {
            wss.close(() => {
                server.close(done);
            });
        }, 100);
    });

    test('Client can subscribe to channel and receive messages', (done) => {
        const client1 = new WebSocket(WS_URL);
        const client2 = new WebSocket(WS_URL);
        let client1Connected = false;
        let client2Connected = false;
        
        const testExchange = 'test-exchange';
        const testChannel = 'test-channel';
        const testMessage = { 
            type: 1000, 
            exchange: testExchange,
            channel: testChannel,
            data: 'Hello World' 
        };

        // Add error handlers
        client1.on('error', console.error);
        client2.on('error', console.error);

        client1.on('open', () => {
            client1Connected = true;
            client1.send(JSON.stringify({
                type: CHANNEL_SUBSCRIBE,
                exchange: testExchange,
                channel: testChannel
            }));

            // Only send message when both clients are ready
            if (client1Connected && client2Connected) {
                setTimeout(() => {
                    client2.send(JSON.stringify(testMessage));
                }, 500); // Increased delay
            }
        });

        client2.on('open', () => {
            client2Connected = true;
            if (client1Connected && client2Connected) {
                setTimeout(() => {
                    client2.send(JSON.stringify(testMessage));
                }, 500); // Increased delay
            }
        });

        client1.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 1000) {  // Only check broadcast messages
                    expect(msg).toEqual(testMessage);
                    client1.close();
                    client2.close();
                    done();
                }
            } catch (err) {
                done(err);
            }
        });
    }, 20000);  // Increased timeout

    test('Multiple clients receive broadcast messages', (done) => {
        const client1 = new WebSocket(WS_URL);
        const client2 = new WebSocket(WS_URL);
        const client3 = new WebSocket(WS_URL);
        let connectedClients = 0;
        
        const testExchange = 'test-exchange';
        const testChannel = 'test-channel';
        const testMessage = { 
            type: 1000, 
            exchange: testExchange,
            channel: testChannel,
            data: 'Broadcast Test' 
        };

        // Add error handlers
        client1.on('error', console.error);
        client2.on('error', console.error);
        client3.on('error', console.error);

        let receivedCount = 0;
        const expectedReceivers = 2;

        function messageHandler(data) {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 1000) {
                    expect(msg).toEqual(testMessage);
                    receivedCount++;

                    if (receivedCount === expectedReceivers) {
                        client1.close();
                        client2.close();
                        client3.close();
                        done();
                    }
                }
            } catch (err) {
                done(err);
            }
        }

        function onOpen() {
            connectedClients++;
            if (connectedClients === 3) {
                // All clients connected, send subscriptions
                client1.send(JSON.stringify({
                    type: CHANNEL_SUBSCRIBE,
                    exchange: testExchange,
                    channel: testChannel
                }));
                client2.send(JSON.stringify({
                    type: CHANNEL_SUBSCRIBE,
                    exchange: testExchange,
                    channel: testChannel
                }));

                // Wait for subscriptions to process then send test message
                setTimeout(() => {
                    client3.send(JSON.stringify(testMessage));
                }, 500); // Increased delay
            }
        }

        client1.on('open', onOpen);
        client2.on('open', onOpen);
        client3.on('open', onOpen);

        client1.on('message', messageHandler);
        client2.on('message', messageHandler);
        client3.on('message', messageHandler);
    }, 20000);  // Increased timeout

    test('Messages are properly formatted', (done) => {
        let errorCount = 0;
        const expectedErrors = 5;
        const client = new WebSocket(WS_URL);
        let timeoutId;  // Store timeout reference
        
        client.on('message', (data) => {
            const response = JSON.parse(data.toString());
            if (response.type === 'error') {
                errorCount++;
                if (errorCount === expectedErrors) {
                    clearTimeout(timeoutId);  // Clear the timeout
                    client.close();
                    done();
                }
            }
        });

        client.on('open', () => {
            // Send test messages with delays to prevent race conditions
            setTimeout(() => {
                client.send('invalid json');
            }, 100);

            setTimeout(() => {
                client.send(JSON.stringify({ type: CHANNEL_SUBSCRIBE }));
            }, 200);

            setTimeout(() => {
                client.send(JSON.stringify({
                    type: CHANNEL_SUBSCRIBE,
                    exchange: 123,
                    channel: 'test'
                }));
            }, 300);

            setTimeout(() => {
                client.send(JSON.stringify({
                    type: CHANNEL_SUBSCRIBE,
                    exchange: 'test',
                    channel: 123
                }));
            }, 400);

            setTimeout(() => {
                client.send(JSON.stringify({
                    type: 'invalid',
                    exchange: 'test',
                    channel: 'test'
                }));
            }, 500);
        });

        // Add timeout safety with stored reference
        timeoutId = setTimeout(() => {
            client.close();
            done(new Error(`Only received ${errorCount} of ${expectedErrors} expected errors`));
        }, 5000);

        // Clean up on test completion
        client.on('close', () => {
            clearTimeout(timeoutId);
        });
    }, 15000);
}); 