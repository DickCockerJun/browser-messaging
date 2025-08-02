import { WindowChat } from './';

const chat = new WindowChat('agent', 'test', window);
chat.init();
chat.addEventListener('message', event => {
  chat.response(event.data.id, event.data);
});
