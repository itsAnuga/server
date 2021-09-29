class Words {
  constructor(incoming, previous) {
    this.incoming = incoming.toLowerCase();
    this.previous = previous.toLowerCase();
  }

  get valid() {
    return this.previous.endsWith(this.incoming.charAt(0));
  }
}

export default Words;
