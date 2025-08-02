import { WindowChat, ExtensionChatClient } from './';

const windowChat = new WindowChat('content', 'test', window);
windowChat.init();
windowChat.addEventListener('message', event => {
  windowChat.response(event.data.id, event.data);
});

windowChat.request('agent', 'hi').then(console.log);


const extensionChat = new ExtensionChatClient('content');
extensionChat.init();
extensionChat.addEventListener('message', event => {
  extensionChat.response(event.data.id, event.data);
});

extensionChat.request('server', 'hi').then(console.log);
extensionChat.request('server', 'async').then(console.log);
extensionChat.request('server', 'weird').then(console.log);
