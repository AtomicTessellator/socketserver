const { Data } = require('dataclass');
const strutils = require('../utils/string.js');


CHANNEL_SUBSCRIBE = 0       // SocketServer subscribes to a channel
CHANNEL_UNSUBSCRIBE = 1     // SocketServer unsubscribes from a channel
CHANNEL_PUBLISH = 2         // Publish a message to a channel

module.exports = {
    CHANNEL_SUBSCRIBE,
    CHANNEL_UNSUBSCRIBE,
    CHANNEL_PUBLISH
}
