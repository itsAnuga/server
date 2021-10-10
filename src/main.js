import ClassPlayers from '../classes/Players.js';
import ClassMessages from '../classes/Message.js';
import { v4 as uuid } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';
import Words from '../classes/Words.js';

const Message = new ClassMessages();
const Players = new ClassPlayers();
const wss = new WebSocketServer({ port: process.env.PORT });

wss.on('connection', (ws, req) => {
  const DateTime = new Date();

  console.info(`${DateTime.toUTCString()} Client connected.`);

  ws.connected = DateTime.toUTCString();
  ws.isAlive = true;
  ws.turn = false;

  /**
   * Client disconnected.
   */
  ws.on('close', () => {
    Players.remove(ws.uuid);

    // let DateTime = new Date();
    console.info(`${DateTime.toUTCString()} Client disconnected`);
  });

  /**
   * Parse incoming messages/commands.
   */
  ws.on('message', (message) => {
    console.info(`${message}`); // Log incoming message to system.

    Message.message(JSON.parse(`${message}`)); // Parse message to JSON.

    /**
     * When a client gives up willingly.
     *
     * @param {string} Message.type Incoming message type
     */
    if (Message.type === `forfeit`) {
      Players.remove(ws.uuid);

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send({ data: { message: `${ws.player} forfeited.` } });
        }
      });

      ws.terminate();

      /**
       * Check amount of players and annouce winner if there only is one left.
       */
      Winner(ws);

      console.info(`${DateTime.toUTCString()} Client forfeited.`);
    }

    /**
     * Register new client or returning client.
     *
     * @param {string} Message.type Incoming message type
     */
    if (Message.type === `register`) {
      ws.uuid = Message.data.uuid !== null ? Message.data.uuid : uuid();
      ws.player = Players.add(ws.uuid);
      ws.turn = Players.whosTurn() === ws.uuid;

      /**
       * Send generated UserInformation to client.
       */
      ws.send(
        JSON.stringify({
          data: {
            connected: ws.connected,
            player: ws.player,
            online: ws.isAlive,
            turn: ws.turn,
            uuid: ws.uuid,
          },
          type: 'UserInfo',
        }),
      );
    }

    /**
     * If the message is a word from the game
     * But it's not your turn.
     *
     * @param {string} Message.type Incoming message type
     */
    if (Message.type === `word` && !ws.turn) {
      ws.send(
        JSON.stringify({
          data: { message: `Sorry, it's not your turn.` },
          type: `NotYourTurn`,
        }),
      );
    }

    /**
     * If the message is a word from the game.
     *
     * @param {string} Message.type Incoming message type
     */
    if (Message.type === `word` && ws.turn) {
      let message = {};
      let state = true;

      /**
       * If it's not the first word in the current session.
       */
      if (Message.all.length !== 0) {
        const word = new Words(Message.data, Message.current);

        /**
         * Validate word.
         */
        if (word.valid) {
          // Word is valid.
          message = {
            data: { message: Message.data, player: ws.player, turn: `UUID` },
            type: `Word`,
          };

          // Not this clients turn anymore.
          ws.turn = false;

          Message.messages.push({
            message: Message.data,
            player: ws.player,
          });
        } else {
          // Word is invalid.
          message = {
            data: { message: `${ws.player} is out!` },
            type: `Loser`,
          };

          state = false;
        }
      } else {
        // It's the first word in the session.
        message = {
          data: { message: Message.data, player: ws.player },
          type: `Word`,
        };

        // Not this clients turn anymore.
        ws.turn = false;

        Message.messages.push({ message: Message.data, player: ws.player });
      }

      // Set next client to be its turn.
      Players.next();

      message.data.turn = Players.whosTurn();

      /**
       * Broadcast the result to all clients, except the client who send the word.
       */
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.turn = client.uuid === Players.whosTurn() ? true : false;
          client.send(JSON.stringify(message));
        }
      });

      /**
       * If it wasn't a valid word or match to previous word.
       */
      if (!state) {
        Players.remove(ws.uuid);

        ws.send(
          JSON.stringify({
            data: { message: `Sorry, that wasn't valid. Your out!` },
            type: `Lost`,
          }),
        );

        ws.terminate();

        /**
         * Let the last standing player know it has won!
         */
        Winner(ws);
      }
    }
  });

  // What to do with a pong.
  ws.on('pong', () => {
    // Set WebSocket Client Connected to true.
    ws.isAlive = true;

    // Set Player to connected.
    Players.online(ws.uuid, true);
  });

  /**
   * Broadcast current message/word list.
   *
   * @param {string} Message.all Retrieve all messages
   */
  if (Message.all.length > 0) {
    ws.send(JSON.stringify({ data: Message.all, type: `Words` }));
  }
});

// Check the connection to the client.
const interval = setInterval(() => {
  wss.clients.forEach((client) => {
    // if (client.isAlive === false) {
    //   // client.terminate();
    //   // Players.online(client.uuid, false);
    //   // Players.remove(client.uuid);
    // }
    client.isAlive = false;
    client.ping();
  });
}, 30000);

/**
 * Broadcast Playerlist every 2000 milliseconds.
 */
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(
      JSON.stringify({
        data: Players.list,
        type: 'PlayerList',
      }),
    );
  });
}, 2000);

// Let's not remove the heartbeat check :)
// wss.on('close', () => {
//   clearInterval(interval);
// });

/**
 * Announce the winner, to the winner.
 *
 * @param {WebSocket} ws WebSocket API
 */
const Winner = (ws) => {
  if (Players.list.length === 1) {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            data: { message: `You won!` },
            type: `Won`,
          }),
        );
      }
    });
    Message.clear();
    Players.clear();
    ws.close();
  }
};
