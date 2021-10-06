class Players {
  /**
   * @var players Player list
   */
  players = [];

  /**
   * Class Constructor
   */
  constructor() {}

  /**
   * Get and return Player list
   *
   * @return array Player list
   */
  get list() {
    return this.players.filter((player) => player !== undefined);
  }

  /**
   * Add a player alias.
   * Create additional rules and run them here if needed.
   *
   * @param UUID Players UUID
   *
   * @return var Player name
   */
  add(uuid) {
    return this.CreatePlayer(uuid);
  }

  /**
   * Create a player, based on UUID.
   *
   * @param uuid Players UUID.
   *
   * @return var Player name
   */
  CreatePlayer(uuid) {
    for (let index = 0; index <= this.players.length; index++) {
      // Find a empty slot or create a new one.
      if (this.players[index] === undefined) {
        // Use first available slot.
        this.players[index] = {
          name: `Player ${index + 1}`,
          uuid: uuid,
        };

        // Return a generated player name.
        return `Player ${index + 1}`;
      }
    }
  }

  /**
   * Remove a player alias.
   * Create additional rules and run them here if needed.
   *
   * @param uuid Players UUID
   *
   * @return bool
   */
  remove(uuid) {
    this.RemovePlayer(uuid);

    return true;
  }

  /**
   * Replace generated players UUID with Cookie UUID.
   *
   * @param current     UUID Generated on Connection
   * @param replacement UUID from Cookie
   *
   * @return bool
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
   * @param uuid Players UUID
   *
   * @return bool
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
