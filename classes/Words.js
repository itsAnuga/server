class Words {
  /**
   * @var {string} incoming string to compare with
   */
  incoming = null;

  /**
   * @var {string} previous string to compare against
   */
  previous = null;

  /**
   * Class Constructor
   *
   * @param {string} incoming
   * @param {string} previous
   */
  constructor(incoming, previous) {
    this.incoming = incoming.toLowerCase();
    this.previous = previous.toLowerCase();
  }

  /**
   * Check if the words are valid.
   * Check if the words start and ending match.
   *
   * @return {bool}
   */
  get valid() {
    // Simulate API Request to Cambridge Word API.
    setTimeout(() => {}, 3333);

    return this.previous.endsWith(this.incoming.charAt(0));
  }
}

export default Words;
