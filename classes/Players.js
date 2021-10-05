class Players {
  index = 0;
  players = [];

  constructor() {}

  get list() {
    return this.players.filter((player) => player !== undefined);
  }

  add(uuid) {
    this.index++;

    return this.CreatePlayer(uuid);
  }

  CreatePlayer(uuid) {
    for (let index = 0; index < this.index; index++) {
      if (this.players[index] === undefined) {
        this.players[index] = {
          name: `Player ${index + 1}`,
          uuid: uuid,
        };

        return `Player ${index + 1}`;
      }
    }
  }

  remove(uuid) {
    this.index--;

    this.RemovePlayer(uuid);

    return true;
  }

  replace(current, replacement) {
    console.info(current, replacement);
  }

  RemovePlayer(uuid) {
    console.info(this.players.length);
    for (let index = 0; index < this.players.length; index++) {
      if (
        this.players[index] !== undefined &&
        this.players[index].uuid === uuid
      ) {
        this.players[index] = undefined;
        // this.players.splice(index, 1);

        break;
      }
    }
    return true;
  }
}

export default Players;
