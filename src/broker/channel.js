import {OPEN} from 'ws';

/**
 * @class Channel
 * @classdesc A channel is a unqiue GameObject e.g. a Hologrid or an AIPod
 * @param {string} uuid The UUID of the channel.
 * @property {string} uuid The UUID of the channel.
 * @property {WebSocket[]} clients The clients subscribed to the channel.
 */
class Channel {
  /**
   *
   * @param {string} uuid
   */
  constructor(uuid) {
    this.uuid = uuid;
    this.clients = [];
  }

  /**
   *
   * @param {WSClient} client
   */
  addClient(client) {
    this.clients.push(client);
  }

  /**
   *
   * @param {WSClient} client
   */
  removeClient(client) {
    this.clients = this.clients.filter((c) => c !== client);
  }

  /**
   * @param {object} message
   */
  broadcast(message) {
    this.clients.forEach((client) => {
      if (client.readyState === OPEN) {
        const json = JSON.stringify(message);
        console.log(`Broadcasting ${json}`);
        client.send(json);
      }
    });
  }
}

/**
 * @class Manager
 * @classdesc A manager for channels.
 * @property {object} channels The channels.
 */
class Manager {
  /**
   * @constructor
   */
  constructor() {
    this.channels = {};
  }

  /**
   * @param {string} uuid
   * @return {Channel}
   * @throws {Error}
   */
  addChannel(uuid) {
    if (uuid == null) {
      throw new Error('Channel UUID cannot be null or undefined');
    }

    const channel = new Channel(uuid);
    this.channels[uuid] = channel;
    return channel;
  }

  /**
   * @param {string} uuid
   * @throws {Error}
   */
  removeChannel(uuid) {
    delete this.channels[uuid];
  }

  /**
   * @param {string} uuid
   * @return {Channel}
   */
  getChannel(uuid) {
    return this.channels[uuid];
  }

  /**
   * @param {string} uuid
   * @param {WSClient} client
   * @throws {Error}
   */
  subscribe(uuid, client) {
    const channel = this.getChannel(uuid);
    if (!channel) {
      this.addChannel(uuid);
    }

    this.channels[uuid].addClient(client);
  }

  /**
   * @param {string} uuid
   * @param {WSClient} client
   */
  unsubscribe(uuid, client) {
    const channel = this.getChannel(uuid);
    if (!channel) {
      return;
    }

    this.channels[uuid].removeClient(client);
  }

  /**
   * @param {WSClient} client
   * @throws {Error}
   */
  unsubscribeAll(client) {
    Object.keys(this.channels).forEach((uuid) => {
      this.channels[uuid].removeClient(client);
    });
  }

  /**
   * @param {object} message
   * @throws {Error}
   */
  broadcast(message) {
    Object.keys(this.channels).forEach((uuid) => {
      this.channels[uuid].broadcast(message);
    });
  }

  /**
   * @param {string} uuid
   * @param {object} message
   * @throws {Error}
   */
  broadcastToChannel(uuid, message) {
    const channel = this.getChannel(uuid);
    if (!channel) {
      this.addChannel(uuid);
    }

    this.channels[uuid].broadcast(message);
  }
}

export default {
  Channel,
  Manager,
};
