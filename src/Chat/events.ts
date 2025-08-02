import type { JsonValue } from './types.js';

export namespace Payload {
  interface Base {
    from: string,
    /** Only for ExtensionChatServer */
    portI?: number
  };

  export interface Message  extends Base {
    id: string,
    message: string,
    data: JsonValue
  };
  export interface Confirm  extends Base {
    toMessage: string
  };
  export interface Response extends Base {
    toMessage: string,
    data: JsonValue
  };

  export type Unknown = Message | Confirm | Response;
};

export namespace Packet {
  interface Meta {
    type: EventType,
    chatId: string | null,
    to: string
  };

  export type Message  = Meta & Payload.Message;
  export type Confirm  = Meta & Payload.Confirm;
  export type Response = Meta & Payload.Response;
  
  export type Unknown = Message | Confirm | Response;
};

export type EventType = 'message' | 'confirm' | 'response';
export namespace ChatEvent {
  export interface Message  { type: 'message',   data: Payload.Message  };
  export interface Confirm  { type: 'confirm',   data: Payload.Confirm  };
  export interface Response { type: 'response',  data: Payload.Response };

  export type Unknown = Message | Confirm | Response;
};

export type ChatEventListener<T = ChatEvent.Unknown> = (event: T) => void;
