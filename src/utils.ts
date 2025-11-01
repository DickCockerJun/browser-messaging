import type { JsonValue, SendSpecInfo } from './Chat/types.js';
import type { Payload } from './Chat/events.js';
import type Chat from './Chat/index.js';

// biome-ignore lint/suspicious/noConfusingVoidType: defaultHandler can be void
type MessageHandler = (data: JsonValue, payload: Payload.Message) => unknown | Promise<unknown>;

/**
 * - adds message-listener;
 * - matches handler;
 * - awaits result;
 * - responses if result !== undefined.
 * @param handlers (Payload.Message) message -> handler
 */
export function handleMessages(chat: Chat, handlers: Record<string, MessageHandler>, defaultHandler: MessageHandler=()=>{}): void {
  chat.addEventListener('message', async event => {
    let handler = handlers[event.data.message];
    if (handler === undefined) handler = defaultHandler;

    const result = await handler(event.data.data, event.data);
    if (result === undefined) return;

    const specInfo: SendSpecInfo = {
      portI: event.data.portI
    };
    chat.response(event.data.id, result, specInfo);
  });
};
