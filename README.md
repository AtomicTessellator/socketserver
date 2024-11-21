# WebSocket Channel Server

A WebSocket server that implements a pub/sub pattern with exchanges and channels. This server allows clients to subscribe to channels within exchanges and broadcast messages to all subscribers.

## Architecture

The server is built on a three-tier hierarchy:
- **Exchange**: Top-level container that can hold multiple channels
- **Channel**: A unique communication pathway within an exchange
- **Client**: WebSocket connections subscribed to channels

### Components

- `ExchangeManager`: Manages multiple exchanges
- `Exchange`: Contains channels and handles channel operations via ChannelManager
- `ChannelManager`: Manages subscriptions and message broadcasting
- `Channel`: Maintains list of subscribed clients and handles message distribution

## Message Types

```javascript
CHANNEL_SUBSCRIBE = 0     // Subscribe to a channel
CHANNEL_UNSUBSCRIBE = 1   // Unsubscribe from a channel
CHANNEL_PUBLISH = 2       // Publish a message to a channel
```

## Usage

### Starting the Server

```bash
npm start
```

The server runs on port 5000 by default and provides health check endpoints at:
- `http://0.0.0.0:5000/`
- `http://0.0.0.0:5000/health`
- `http://0.0.0.0:5000/healthcheck`

### Client Message Format

Messages must be valid JSON objects with the following required fields:

```javascript
{
    "exchange": "string",   // Exchange identifier (max length: 1000)
    "channel": "string",    // Channel identifier (max length: 1000)
    "type": number         // Message type (0-10000)
}
```

### Message Types
- Types 0-999: Reserved for system messages
- Types 1000+: Available for application messages

### Example Client Connection

```javascript
const ws = new WebSocket('ws://localhost:5000');

// Subscribe to a channel
ws.send(JSON.stringify({
    exchange: "my-exchange",
    channel: "my-channel",
    type: 0  // CHANNEL_SUBSCRIBE
}));

// Publish to a channel
ws.send(JSON.stringify({
    exchange: "my-exchange",
    channel: "my-channel",
    type: 1000,
    data: "Hello, World!"
}));
```

## Features

- Dynamic exchange and channel creation
- Automatic client cleanup on disconnect
- Message validation and error handling
- Heartbeat support (configure with LOG_HEARTBEATS environment variable)
- Structured logging via logger utility
- Input validation:
  - JSON message format
  - Required fields checking
  - Exchange/channel identifier length limits
  - Message type range validation (0-10000)

## Environment Variables

- `LOG_HEARTBEATS`: Set to 'true' to enable heartbeat logging
- `PORT`: Server port (default: 5000)

## Error Handling

The server validates all incoming messages and will return error responses for:
- Invalid JSON
- Missing required fields (`exchange`, `channel`, `type`)
- Invalid message types (must be 0-10000)
- Invalid exchange/channel identifiers (must be strings, max length 1000)

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
