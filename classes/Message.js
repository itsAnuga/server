class Message {
  /**
   * @var {string} data Message data
   */
  data = [];

  /**
   * @var {string} messages Messages/Words
   */
  messages = [];

  /**
   * @var {string} type Message type
   */
  type = null;

  /**
   * Class Constructor
   */
  constructor() {}

  /**
   * Get all messages.
   *
   * @return {array}
   */
  get all() {
    return this.messages;
  }

  /**
   * Get the latest message.
   *
   * @return {string}
   */
  get current() {
    if (this.messages.length > 0) {
      return this.messages[this.messages.length - 1].message;
    }

    return ``;
  }

  /**
   * Check incoming message.
   * (Not used at the moment, but might come in handy)
   *
   * @param {object} message
   *
   */
  message(message) {
    this.data = message.data;
    this.type = message.type;

    // switch (this.type) {
    //   case `handshake`:
    //     break;
    //   case `uuid`:
    //     break;
    //   case `word`:
    //     break;
    // }
  }
}

export default Message;
