const { Data } = require('dataclass');
const strutils = require('../utils/string.js');


CHANNEL_SUBSCRIBE = 0;
CHANNEL_UNSUBSCRIBE = 1;
CHANNEL_PUBLISH = 2;


class WSSMessage extends Data {

    type = 0

    exchange = null

    sender = null
    channel = null

    message = null

    static toJSON() {
        return JSON.stringify(this);
    }

    static from(data) {
        return Message.create(
            {
                'type': data.type,
                'sender': data.sender,
                'destination': data.destination,
                'payload': data.payload
            }
        );
    }
}


function decode(data) {
 
    /* Type Checking */
    var message = '';

    if (typeof(data) === "string") {
      message = data;
    } else {
      // Raw binary data
      message = strutils.atos(data);
    }

    var decoded = JSON.parse(message);

    return WSSMessage.from(decoded);
}

module.exports = {
    CHANNEL_SUBSCRIBE,
    CHANNEL_UNSUBSCRIBE,
    CHANNEL_PUBLISH,
    WSSMessage,
    decode
}
