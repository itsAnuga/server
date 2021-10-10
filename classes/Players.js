class Players {
  /**
   * @var {array} players Player list
   */
  players = [];

  /**
   * @var {array} observers Observer list
   */
  observers = [];

  /**
   * Class Constructor
   */
  constructor() {}

  /**
   * Get and return Player list
   *
   * @return {array} Player list
   */
  get list() {
    return this.players.filter((player) => player !== undefined);
  }

  /**
   * Add a player alias.
   * Create additional rules and run them here if needed.
   *
   * @param {string} UUID Players UUID
   *
   * @return {string}
   */
  add(uuid) {
    return this.CreatePlayer(uuid);
  }

  /**
   * Create a player, based on UUID.
   *
   * Return generated player name.
   *
   * @param uuid Players UUID.
   *
   * @return {string}
   */
  CreatePlayer(uuid) {
    for (let index = 0; index <= this.players.length; index++) {
      // Find a empty slot or create a new one.
      if (this.players[index] === undefined) {
        // Use first available slot.
        this.players[index] = {
          name: `Player ${index + 1}`,
          online: true,
          uuid: uuid,
        };

        // Return a generated player name.
        return `Player ${index + 1}`;
      }
    }
  }

  /**
   * Set players online/offline state.
   *
   * @param {string} uuid
   * @param {bool} state
   */
  online(uuid, state) {
    for (let index = 0; index <= this.players.length; index++) {
      if (
        this.players[index] !== undefined &&
        this.players[index].uuid === uuid
      ) {
        this.players[index].online = state;
      }
    }
  }

  /**
   * Remove a player alias.
   * Create additional rules and run them here if needed.
   *
   * @param {string} uuid Players UUID
   *
   * @return {bool}
   */
  remove(uuid) {
    this.RemovePlayer(uuid);

    return true;
  }

  /**
   * Replace generated players UUID with Cookie UUID.
   *
   * @param {string} current     UUID Generated on Connection
   * @param {string} replacement UUID from Cookie
   *
   * @return {bool}
   */
  replace(current, replacement) {
    for (let index = 0; index < this.players.length; index++) {
      if (
        this.players[index] !== undefined &&
        this.players[index].uuid === current
      ) {
        this.players[index].uuid = replacement;
      }
    }

    return true;
  }

  /**
   * Remove a player, based on UUID.
   *
   * @param {string} uuid Players UUID
   *
   * @return {bool}
   */
  RemovePlayer(uuid) {
    for (let index = 0; index <= this.players.length; index++) {
      if (
        this.players[index] !== undefined &&
        this.players[index].uuid === uuid
      ) {
        // To create a empty player slot
        this.players[index] = undefined;

        // To complete remove the slot
        // this.players.splice(index, 1);

        // break;
      }
    }

    // Empty the player list if all slots are undefined
    if (this.players.filter((player) => player !== undefined).length === 0) {
      this.players = [];
    }

    // Return true for good measure :)
    return true;
  }
}

export default Players;
