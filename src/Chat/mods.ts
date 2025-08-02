import type { JsonValue, SendSpecInfo } from './types.js';
import type { ChatEvent, Packet } from './events.js';
import type Chat from './index.js';

/**
 * Appends "request" method.
 * @example
 * class Example extends Chat {
 *   request = ChatRequest.request
 * };
 * const test = new Example();
 * 
 * // usage:
 * const response = await test.request(to, message, data);
 * // instead of:
 * const response = await new Promise(resolve => {
 *   let messageId = '';
 *   const handler = event => {
 *     if (event.data.messageId !== messageId) return;
 *     test.removeEventListener('response', handler);
 *     resolve(event.data.data);
 *   };
 *   test.addEventListener('response', handler);
 *   messageId = test.send(to, message, data);
 * });
 */
export namespace ChatRequest {
  /**
   * Sends message and awaits response.
   */
  export function request(this: Chat, to: string, message: string, data: JsonValue, specInfo: SendSpecInfo={}): Promise<JsonValue> {
    return new Promise(resolve => {
      let messageId = '';

      const handler = (event: ChatEvent.Response) => {
        if (event.data.toMessage !== messageId) return;

        this.removeEventListener('response', handler);
        resolve(event.data.data);
      };
      this.addEventListener('response', handler);
      
      messageId = this.send(to, message, data, specInfo);
    });
  };
};

/**
 * Sends confirm to messages.
 * @example
 * class Example extends Chat {
 *   sendTimeout = 500;
 *   init() {
 *     ChatConfirm.init.call(this);
 *     // your code
 *   };
 *   destroy() {
 *     // your code
 *     ChatConfirm.destroy.call(this);
 *     super.destroy();
 *   };
 *   protected sendConfirm = ChatConfirm.sendConfirm;
 * 
 *   protected _send(packet: Packet.Unknown) {
 *     // your send function
 *     const send: (packet: Packet.Unknown) => void;
 * 
 *     if (packet.type === 'message') ChatRequest.sendUntilConfirm.call(this, packet, send);
 *     else send(packet);
 *   };
 * };
 * 
 * // average usage
 */
export namespace ChatConfirm {
  type ThisChat = Chat & {
    sendTimeout: number,
    sendConfirm: typeof sendConfirm
  };

  /**
   * Adds message-listener for sending confirm.
   */
  export function init(this: Chat): void {
    const _this = this as ThisChat;

    _this.sendConfirm = _this.sendConfirm.bind(_this);
    _this.addEventListener('message', _this.sendConfirm);
  };
  /**
   * Removes message-listener for sending confirm.
   */
  export function destroy(this: Chat): void {
    const _this = this as ThisChat;

    _this.removeEventListener('message', _this.sendConfirm);
  };

  /**
   * Sends confirm to message.
   * @protected
   */
  export function sendConfirm(this: Chat, event: ChatEvent.Message): void {
    const packet: Packet.Confirm = {
      type: 'confirm',
      chatId: this.chatId,
      from: this.id,
      to: event.data.from,
      toMessage: event.data.id
    };
    this._send(packet, { portI: packet.portI });
  };

  export function sendUntilConfirm(this: Chat, packet: Packet.Message, _send: (packet: Packet.Message) => void): void {
    const _this = this as ThisChat;

    const clear = () => {
      clearTimeout(interval);
      this.removeEventListener('confirm', handler);
    };

    const handler = (event: ChatEvent.Confirm) => {
      if (event.data.toMessage !== packet.id) return;
      clear();
    };
    this.addEventListener('confirm', handler);

    const interval = setInterval(() => {
      if (this.destroyed) {
        clear();
        return;
      };
      _send(packet);
    }, _this.sendTimeout);
    _send(packet);
  };
};
