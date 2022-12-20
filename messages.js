const { Data } = require('dataclass');
const strutils = require('./string.js');


MESSAGE_TYPE_SUBSCRIBE = 0;
MESSAGE_TYPE_UNSUBSCRIBE = 1;
MESSAGE_TYPE_HOLOGRID_COMMUNICATION = 2;

class Message extends Data {
    type = 0
    payload = null

    static toJSON() {
        return JSON.stringify(this);
    }

    static from(data) {
        return Message.create({ 'type': data.type, 'payload': data.payload });
    }
}

class Channel extends Data {
    name = ""
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
    MESSAGE_TYPE_SUBSCRIBE: MESSAGE_TYPE_SUBSCRIBE,
    MESSAGE_TYPE_UNSUBSCRIBE: MESSAGE_TYPE_UNSUBSCRIBE,
    MESSAGE_TYPE_HOLOGRID_COMMUNICATION: MESSAGE_TYPE_HOLOGRID_COMMUNICATION,
    Message: Message,
    Channel: Channel,
    decode: decode
}
