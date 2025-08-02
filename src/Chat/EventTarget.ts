import type { EventType, ChatEvent, ChatEventListener } from './events.js';

type EventByType<T extends EventType> = Extract<ChatEvent.Unknown, { type: T }>;

type ListenerMap = Map<EventType, Set<ChatEventListener>>;

/**
 * Typifies events.
 * Is needed, because:
 * - content/background-script in firefox (manifest v2) can't get normal EventTarget.
 */
export default class ChatEventTarget {
  protected listeners = new Map() as ListenerMap;

  addEventListener<T extends EventType>(type: T, callback: ChatEventListener<EventByType<T>>): void {
    let listeners = this.listeners.get(type);
    if (listeners === undefined) {
      listeners = new Set();
      this.listeners.set(type, listeners);
    };

    listeners.add(callback as ChatEventListener);
  };

  removeEventListener<T extends EventType>(type: T, callback: ChatEventListener<EventByType<T>>): void {
    const listeners = this.listeners.get(type);
    if (listeners === undefined) return;

    listeners.delete(callback as ChatEventListener);
  };

  dispatchEvent(event: ChatEvent.Unknown): void {
    const listeners = this.listeners.get(event.type);
    if (listeners === undefined) return;
    
    for (const listener of listeners) {
      listener(event);
    };
  };
};
