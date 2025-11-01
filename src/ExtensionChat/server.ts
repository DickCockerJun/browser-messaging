import type { Runtime, Events } from 'webextension-polyfill';

import type { SendSpecInfo } from '../Chat/types.js';
import type { Packet } from '../Chat/events.js';
import Chat from '../Chat/index.js';
import { ChatRequest } from '../Chat/mods.js';
import { getBrowserApi, deleteFromArray } from './utils.js';

/**
 * to -> ports
 */
type PortMap = Map<string, Array<Runtime.Port>>;

/**
 * Appends "portI" field to all event.data. You can pass it to send, response.
 * Based on runtime.Port.
 * Call init after constructor.
 */
export default class ExtensionChatServer extends Chat {
  /**
   * to -> ports
   */
  protected ports: PortMap = new Map();
  protected onConnect: Events.Event<(port: Runtime.Port) => void>;

  /**
   * No need to specify to, because it's point-to-point.
   * Call init after.
   * @param chatId if in extendsions several independent chats
   */
  constructor(chatId: string='') {
    super('server', chatId);

    const browserApi = getBrowserApi();
    this.onConnect = browserApi.runtime.onConnect;
  };
  init(): void {
    this.handleConnect = this.handleConnect.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.onConnect.addListener(this.handleConnect);
  };
  destroy(): void {
    this.onConnect.removeListener(this.handleConnect);
    super.destroy();
    for (const [_, ports] of this.ports) {
      for (const port of ports) {
        port.disconnect();
      };
    };
  };

  request = ChatRequest.request.bind(this);

  protected _send(packet: Packet.Unknown, specInfo: SendSpecInfo={}): void {
    const ports = this.ports.get(packet.to);
    if (! ports) return;

    if (specInfo.portI !== undefined) {
      const port = ports.at(specInfo.portI);
      if (port === undefined) return;
      port.postMessage(packet);
    }
    else {
      for (const port of ports) {
        if (port === undefined) continue;
        port.postMessage(packet);
      };
    };
  };

  protected handleConnect(port: Runtime.Port): void {
    if (! port.name) return;

    const _chatIdLength = port.name.slice(0, port.name.indexOf(':'));
    const chatIdLength = parseInt(_chatIdLength);
    let pointer = _chatIdLength.length + 1;

    const chatId = port.name.slice(pointer, pointer+chatIdLength);
    if (chatId !== this.chatId) return;
    pointer += chatIdLength + 1;

    const id = port.name.slice(pointer);

    let ports = this.ports.get(id);
    if (ports === undefined) {
      ports = [];
      this.ports.set(id, ports);
    };
    const portI = ports.length;
    ports.push(port);

    port.onDisconnect.addListener(this.handleDisconnect);
    port.onMessage.addListener(message => this.handleMessage(message, portI));
  };

  protected handleDisconnect(port: Runtime.Port) {
    if (this.destroyed) return;

    const _chatIdLength = port.name.slice(0, port.name.indexOf(':'));
    const chatIdLength = parseInt(_chatIdLength);
    const pointer = _chatIdLength.length + chatIdLength + 2;
    const id = port.name.slice(pointer);

    const ports = this.ports.get(id);
    if (! ports) return;

    deleteFromArray(ports, port);
  };
  protected handleMessage(_data: unknown, portI: number) {
    const data = _data as Packet.Unknown;
    data.portI = portI;
    
    // no need to check:
    // - typeof (foreigns doesn't have access);
    // - chatId (was checked on connect);
    // - to     (it's point-to-point).

    this.handlePacket(data);
  };
};
