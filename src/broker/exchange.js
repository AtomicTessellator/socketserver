const channel = require('./channel.js');


class Exchange {
    constructor(uuid) {
      this.uuid = uuid;
      this.channel_mgr = new channel.Manager();
    }
  
    addChannel(channel_uuid) {
      this.channel_mgr.addChannel(channel_uuid);
    }
  
    removeChannel(channel_uuid) {
      this.channel_mgr.removeChannel(channel_uuid);
    }

    getChannel(channel_uuid) {
      return this.channel_mgr.getChannel(channel_uuid);
    }

    subscribeToChannel(channel_uuid, client) {
      this.channel_mgr.subscribe(channel_uuid, client);
    }

    unsubscribeFromChannel(channel_uuid, client) {
      this.channel_mgr.unsubscribe(channel_uuid, client);
    }

    broadcastToChannel(channel_uuid, message) {
      this.channel_mgr.broadcastToChannel(channel_uuid, message);
    }
}


class ExchangeManager {

    constructor() {
        this.exchanges = {};
    }

    addExchange(uuid) {
        var exchange = new Exchange(uuid)
        this.exchanges[uuid] = exchange;
        return exchange;
    }

    removeExchange(uuid) {
        delete this.exchanges[uuid];
    }

    getExchange(uuid) {
        return this.exchanges[uuid];
    }
}

module.exports = {
    Exchange,
    ExchangeManager
};
