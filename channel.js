const WebSocket = require('ws');


class Channel {
  constructor(uuid) {
    this.uuid = uuid;
    this.clients = [];
  }

  addClient(client) {
    this.clients.push(client);
  }

  removeClient(client) {
    this.clients = this.clients.filter(c => c !== client);
  }

  broadcast(message) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        var json = JSON.stringify(message);
        console.log('Broadcasting', json);
        client.send(json);
      }
    });
  }
}
  

class ChannelManager {
  constructor() {
    this.channels = {};
  }

  addChannel(uuid) {
    this.channels[uuid] = new Channel(uuid);
  }

  removeChannel(uuid) {
    delete this.channels[uuid];
  }

  getChannel(uuid) {
    return this.channels[uuid];
  }

  subscribe(uuid, client) {
    var channel = this.getChannel(uuid);
    if (!channel) {
      this.addChannel(uuid);
    }

    this.channels[uuid].addClient(client);
  }

  unsubscribe(uuid, client) {
    var channel = this.getChannel(uuid);
    if (!channel) {
      return;
    }

    this.channels[uuid].removeClient(client);
  }

  unsubscribeAll(client) {
    Object.keys(this.channels).forEach(uuid => {
      this.channels[uuid].removeClient(client);
    });
  }

  broadcast(message) {
    Object.keys(this.channels).forEach(uuid => {
      this.channels[uuid].broadcast(message);
    });
  }

  broadcastToChannel(uuid, message) {
    var channel = this.getChannel(uuid);
    if (!channel) {
      this.addChannel(uuid);
    }

    this.channels[uuid].broadcast(message);
  }
}

module.exports = {
  Channel,
  ChannelManager
};