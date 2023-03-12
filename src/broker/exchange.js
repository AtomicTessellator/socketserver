// eslint-disable-next-line no-unused-vars
import Channel from './channel.js';

/**
 * @class Exchange
 * @classdesc An exchange is a collection of channels.
 * @property {string} uuid The exchange UUID.
 * @property {Manager} channel_mgr The channel manager.
 */
export class Exchange {
  /**
   * @constructor
   * @param {string} uuid
   */
  constructor(uuid) {
    this.uuid = uuid;
    this.channel_mgr = new channel.Manager();
  }

  /**
   * @param {string} channelUuid
   */
  addChannel(channelUuid) {
    this.channel_mgr.addChannel(channelUuid);
  }

  /**
   * @param {string} channelUuid
   */
  removeChannel(channelUuid) {
    this.channel_mgr.removeChannel(channelUuid);
  }

  /**
   * @param {string} channelUuid
   * @return {Channel}
   */
  getChannel(channelUuid) {
    return this.channel_mgr.getChannel(channelUuid);
  }

  /**
   * @param {string} channelUuid
   * @param {WSClient} client
   */
  subscribeToChannel(channelUuid, client) {
    this.channel_mgr.subscribe(channelUuid, client);
  }

  /**
   * @param {string} channelUuid
   * @param {WSClient} client
   */
  unsubscribeFromChannel(channelUuid, client) {
    this.channel_mgr.unsubscribe(channelUuid, client);
  }

  /**
   *
   * @param {string} channelUuid
   * @param {WSClient} message
   */
  broadcastToChannel(channelUuid, message) {
    this.channel_mgr.broadcastToChannel(channelUuid, message);
  }
}

/**
 * @class ExchangeManager
 * @classdesc A manager for exchanges.
 * @property {object} exchanges The exchanges.
 */
export class ExchangeManager {
  /**
   * @constructor
   */
  constructor() {
    this.exchanges = {};
  }

  /**
   * @param {string} uuid
   * @return {Exchange}
   */
  addExchange(uuid) {
    const exchange = new Exchange(uuid);
    this.exchanges[uuid] = exchange;
    return exchange;
  }

  /**
   * @param {string} uuid
   * @throws {Error}
   */
  removeExchange(uuid) {
    delete this.exchanges[uuid];
  }

  /**
   * @param {string} uuid
   * @return {Exchange}
   */
  getExchange(uuid) {
    return this.exchanges[uuid];
  }
}
