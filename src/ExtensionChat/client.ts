import type { Runtime } from 'webextension-polyfill';

import type { JsonObject } from '../Chat/types.js';
import type { Packet } from '../Chat/events.js';
import Chat from '../Chat/index.js';
import { ChatRequest } from '../Chat/mods.js';
import { getBrowserApi } from './utils.js';

/**
 * Based on runtime.Port.
 * Call init after constructor.
 */
export default class ExtensionChatClient extends Chat {
  protected port?: Runtime.Port;
  protected _connect: () => Runtime.Port;
  protected _keepAlive = false;

  get keepAlive() {
    return this._keepAlive;
  };
  set keepAlive(value) {
    if (value && this.port === undefined) this.connect();
    this._keepAlive = value;
  };

  /**
   * Call init after.
   * @param id this module
   * @param chatId if in extendsions several independent chats
   * @param extensionId The ID of the extension or app to connect to. If omitted, a connection will be attempted with your own extension. Required if sending messages from a web page for $(topic:manifest/externally_connectable)[web messaging].
   */
  constructor(id: string, chatId: string='', extensionId?: string) {
    super(id, chatId);

    const browserApi = getBrowserApi();
    if (chatId === null) chatId = '';
    const name = `${chatId.length}:${chatId}:${id}`;
    this._connect = () => browserApi.runtime.connect(extensionId, { name });
  };
  init(): void {
    this.handleMessage = this.handleMessage.bind(this);
  };
  destroy(): void {
    this._keepAlive = false;
    if (this.port !== undefined) this.port.disconnect();
    super.destroy();
  };

  request = ChatRequest.request;

  protected connect(): void {
    if (this.port !== undefined) return;

    this.port = this._connect();
    this.port.onDisconnect.addListener(() => {
      this.port = undefined;
      if (this.keepAlive) this.connect();
    });
    this.port.onMessage.addListener(this.handleMessage);
  };

  protected handleMessage(_data: unknown) {
    if (typeof _data !== 'object' || _data === null) return;

    const data = _data as JsonObject;
    if (data.chatId !== this.chatId) return;
    if (data.to !== this.id) return;

    this.handlePacket(data as unknown as Packet.Unknown);
  };

  /**
   * @throws {Error} port is disconnected
   */
  protected _send(packet: Packet.Unknown): void {
    this.connect();
    if (this.port === undefined) throw new Error('port is disconnected');

    this.port.postMessage(packet);
  };
};
