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

  ws.connected = DateTime.toUTCString();
  ws.isAlive = true;
  ws.uuid = uuid();

  ws.player = Players.add(ws.uuid);

  ws.on('close', () => {
    let DateTime = new Date();

    // clearInterval(interval);

    Players.remove(ws.uuid);

    console.info(`${DateTime.toUTCString()} Client disconnected`);
  });

  ws.on('message', (message) => {
    console.info(`${message}`);

    Message.message(JSON.parse(`${message}`));

    if (Message.type === `forfeit`) {
      Players.remove(ws.uuid);
      ws.terminate();
    }

    /**
     * Returning client.
     * Set clients UUID.
     */
    if (Message.type === `uuid`) {
      Players.replace(ws.uuid, Message.data);
      ws.uuid = Message.data;
    }

    /**
     * If the message is a word from the game.
     */
    if (Message.type === `word`) {
      if (Message.all.length === 0) {
        Message.messages.push({ message: Message.data, player: ws.player });
      } else {
        // const word = new Words(Message.current, Message.data);
      }

      /**
       * Validate word.
       */
      // if (word.valid) {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              data: { message: Message.data, player: ws.player },
              type: `Word`,
            }),
          );
        }
      });
      // }
    }
  });

  /**
   * Send generated UserInformation to client.
   */
  ws.send(
    JSON.stringify({
      data: {
        connected: ws.connected,
        player: ws.player,
        uuid: ws.uuid,
      },
      type: 'UserInfo',
    }),
  );

  if (Message.all.length > 0) {
    ws.send(JSON.stringify(Message.all));
  }

  console.info(`${DateTime.toUTCString()} Client connected.`);
});

// const interval = setInterval(() => {
//   wss.clients.forEach((ws) => {
//     console.info(`Checking ${ws.player} connection.`);
//     if (ws.isAlive === false) {
//       Players.remove(ws.uuid);
//       return ws.terminate();
//     }
//     ws.isAlive = false;
//     ws.ping();
//   });
// }, 1000);

setInterval(() => {
  wss.clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        data: Players.list,
        type: 'PlayerList',
      }),
    );
  });
}, 2000);

// setInterval(() => {
//   wss.clients.forEach((ws) => {
//     ws.ping();
//   });
// }, 30000);

// setInterval(() => {
//   if (Messages.length > 0) {
//     console.info(Messages);
//   }
// }, 1000);

// setInterval(() => {
//   console.clear();
// }, 60000);
