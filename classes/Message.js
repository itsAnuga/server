class Message {
  messages = [];

  constructor() {}

  get current() {
    return this.messages[this.messages.length() - 1];
  }

  message(message) {
    this.data = message.data;
    this.type = message.type;

    switch (this.type) {
      case `handshake`:
        // return { data: uuid() };
        break;
      case `uuid`:
        // console.info(`Message:`, message.data);
        break;
    }
  }
}

export default Message;
