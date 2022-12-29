const { Data } = require('dataclass');
const strutils = require('../utils/string.js');


// 0 - 1000 - reserved for WSServer
CHANNEL_SUBSCRIBE = 0       // SocketServer subscribes to a channel
CHANNEL_UNSUBSCRIBE = 1     // SocketServer unsubscribes from a channel
CHANNEL_PUBLISH = 2         // Publish a message to a channel

// 1001 - 2000 - reserved for Hologrid
HOLOGRID_RESET = 1001
HOLOGRID_CREATE_SPHERE = 1002

module.exports = {
    CHANNEL_SUBSCRIBE,
    CHANNEL_UNSUBSCRIBE,
    CHANNEL_PUBLISH,
    HOLOGRID_RESET,
    HOLOGRID_CREATE_SPHERE
}
