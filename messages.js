const { Data } = require('dataclass');
const strutils = require('./string.js');


MESSAGE_TYPE_SUBSCRIBE = 0;
MESSAGE_TYPE_UNSUBSCRIBE = 1;
MESSAGE_PUBLISH = 2;


class Message extends Data {
    type = 0
    sender = null
    destination = null
    payload = null

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

    return Message.from(decoded);
}

module.exports = {
    MESSAGE_TYPE_SUBSCRIBE,
    MESSAGE_TYPE_UNSUBSCRIBE,
    MESSAGE_PUBLISH,
    Message,
    decode
}
