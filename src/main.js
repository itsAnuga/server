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
  ws.myTurn = false;

  /**
   * Client disconnected.
   */
  ws.on('close', () => {
    Players.remove(ws.uuid);

    // let DateTime = new Date();
    // console.info(`${DateTime.toUTCString()} Client disconnected`);
  });

  /**
   * Parse incoming messages/commands.
   */
  ws.on('message', (message) => {
    console.info(`${message}`); // Log incoming message to system.

    Message.message(JSON.parse(`${message}`)); // Parse message to JSON.

    /**
     * When a client gives up willingly.
     */
    if (Message.type === `forfeit`) {
      Players.remove(ws.uuid);

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send({ data: { message: `${ws.player} forfeited.` } });
        }
      });

      ws.terminate();
    }

    /**
     * Register new client or returning client.
     */
    if (Message.type === `register`) {
      ws.uuid = Message.data.uuid !== null ? Message.data.uuid : uuid();
      ws.player = Players.add(ws.uuid);

      /**
       * Send generated UserInformation to client.
       */
      ws.send(
        JSON.stringify({
          data: {
            connected: ws.connected,
            player: ws.player,
            online: ws.isAlive,
            uuid: ws.uuid,
          },
          type: 'UserInfo',
        }),
      );
    }

    /**
     * Returning client.
     * Set clients UUID.
     */
    // if (Message.type === `uuid`) {
    //   Players.replace(ws.uuid, Message.data);
    //   ws.uuid = Message.data;
    //   // if (Message.all.length !== 0) {
    //   //   Players.observer(ws.uuid);
    //   // }
    // }

    /**
     * If the message is a word from the game.
     */
    if (Message.type === `word`) {
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

          Message.messages.push({
            message: Message.data,
            player: ws.player,
          });
        } else {
          // Word is invalid.
          message = {
            data: { message: `${ws.player} is out of the game :(` },
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

        Message.messages.push({ message: Message.data, player: ws.player });
      }

      message.data.turn = `uuid`;

      /**
       * Broadcast the result to all clients, except the client who send the word.
       */
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
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
      }
    }
  });

  /**
   * What to do with a pong.
   */
  ws.on('pong', () => {
    console.info(`Received a pong.`);

    ws.isAlive = true;

    Players.online(ws.uuid, true);
  });

  if (Message.all.length > 0) {
    ws.send(JSON.stringify(Message.all));
  }
});

const interval = setInterval(() => {
  console.info(`Ping sent.`);

  wss.clients.forEach((client) => {
    if (client.isAlive === false) {
      // client.terminate();

      Players.online(client.uuid, false);
      // Players.remove(client.uuid);
    }
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

// wss.on('close', () => {
//   clearInterval(interval);
// });

// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.ping();
//   });
// }, 30000);

// setInterval(() => {
//   console.clear();
// }, 60000);
