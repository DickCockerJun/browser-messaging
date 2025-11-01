import type { Packet } from '../Chat/events.js';
import Chat from '../Chat/index.js';
import { ChatRequest, ChatConfirm } from '../Chat/mods.js';

/**
 * Based on MessageEvent on window.
 * Call init after constructor.
 */
export default class WindowChat extends Chat {
  sendTimeout = 500;
  protected window: Window;

  /**
   * Call init after.
   * @param id this module
   */
  constructor(id: string, chatId: string, window: Window) {
    super(id, chatId);
    this.window = window;
  };
  init() {
    ChatConfirm.init.call(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.window.addEventListener('message', this.handleMessage);
  };
  destroy(): void {
    this.window.removeEventListener('message', this.handleMessage);
    ChatConfirm.destroy.call(this);
    super.destroy();
  };

  /**
   * Sends message and awaits response.
   */
  request = ChatRequest.request.bind(this);

  protected _send(packet: Packet.Unknown): void {
    if (packet.type === 'message') {
      ChatConfirm.sendUntilConfirm.call(
        this,
        packet as Packet.Message,
        this.window.postMessage.bind(this.window)
      );
      return;
    };
    this.window.postMessage(packet);
  };

  /**
   * Sends confirm to message.
   */
  protected sendConfirm = ChatConfirm.sendConfirm;
  
  protected handleMessage(event: MessageEvent) {
    const data = event.data;
    if (typeof data !== 'object' || data === null) return;

    if (data.chatId !== this.chatId) return;
    if (data.to !== this.id) return;

    this.handlePacket(data as Packet.Unknown);
  };
};
