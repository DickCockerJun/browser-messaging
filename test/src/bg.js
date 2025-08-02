import { ExtensionChatServer, handleMessages } from './';

const chat = new ExtensionChatServer();
chat.init();

handleMessages(chat, {
  hi: (_, payload) => `hi from ${chat.id} to ${payload.from}!`,
  async: () => new Promise(resolve => setTimeout(() => resolve('async'), 2000))
}, (_, payload) => payload);
