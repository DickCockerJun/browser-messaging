import type { JsonValue, SendSpecInfo } from './types.js';
import type { Packet, EventType, ChatEvent } from './events.js';
import ChatEventTarget from './EventTarget.js';

const knownPacketTypes: Set<EventType> = new Set(['message', 'confirm', 'response']);

/**
 * Pure chat
 */
export default abstract class Chat extends ChatEventTarget {
  /**
   * this module
   */
  protected readonly id: string;
  protected readonly chatId: string | null;
  protected destroyed = false;
  protected countMessagesTo = {} as Record<string, number>;

  /**
   * @param id this module
   */
  constructor(id: string, chatId: string|null=null) {
    super();
    this.id = id;
    this.chatId = chatId;
  };
  destroy(): void {
    this.destroyed = true;
  };

  /**
   * @returns message-id
   */
  send(to: string, message: string, data: JsonValue=null, specInfo: SendSpecInfo={}): string {
    if (this.countMessagesTo[to] === undefined) this.countMessagesTo[to] = 0;
    const id = `${this.id}:${to}:${this.countMessagesTo[to]}`;
    this.countMessagesTo[to]++;
    
    const packet: Packet.Message = {
      type: 'message',
      chatId: this.chatId,
      from: this.id,
      to,
      id,
      message,
      data
    };
    this._send(packet, specInfo);

    return id;
  };
  
  response(toMessage: string, data: JsonValue, specInfo: SendSpecInfo={}): void {
    const to = toMessage.slice(0, toMessage.indexOf(':'));

    const packet: Packet.Response = {
      type: 'response',
      chatId: this.chatId,
      from: this.id,
      to,
      toMessage,
      data
    };
    this._send(packet, specInfo);
  };

  protected abstract _send(packet: Packet.Unknown, specInfo: SendSpecInfo): void;

  /**
   * Dispatches event.
   * Doesn't check 'to', 'chatId' fields!
   * @throws {Error} unknown packet.type: "${packet.type}"
   */
  protected handlePacket(packet: Packet.Unknown): void {
    if (! knownPacketTypes.has(packet.type)) throw new Error(`unknown packet.type: "${packet.type}"`);
    
    const type = packet.type;
    delete (packet as Partial<Packet.Unknown>).type;
    delete (packet as Partial<Packet.Unknown>).to;
    delete (packet as Partial<Packet.Unknown>).chatId;

    const event = {
      type,
      data: packet
    } as ChatEvent.Unknown;
    this.dispatchEvent(event);
  };
};
