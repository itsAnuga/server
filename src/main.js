// import axios from 'axios';

import ClassPlayers from '../classes/Players.js';
import ClassMessages from '../classes/Message.js';
import { v4 as uuid } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';
import Words from '../classes/Words.js';

const Message = new ClassMessages();
// const Messages = [];
const Players = new ClassPlayers();
const Rooms = {
  Lobby: [],
};
const Sessions = {};
const wss = new WebSocketServer({ port: process.env.PORT });

// const broadcast = wss.on('message', (data) => {
//   Messages.push(JSON.parse(`${data}`).message);

//   wss.clients.forEach((client) => {
//     if (client !== ws && client.readyState === WebSocket.OPEN) {
//       client.send(JSON.parse(data).message);
//     }
//   });
// });

/*
 * Add Welcome message.
 * Add Phrase: Who wants to go first?
 * While player is typing message.
 * Ignore messages from player whos turn it is not.
 * If message is correct, turn green.
 * If message is wrong, turn red.
 */

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws, req) => {
  const DateTime = new Date();

  // console.info(req.headers);

  ws.connected = DateTime.toUTCString();
  ws.isAlive = true;
  ws.messages = {
    current: '',
    previous: '',
  };
  ws.uuid = uuid();

  ws.player = Players.add(ws.uuid);

  ws.on('close', () => {
    let DateTime = new Date().toString();

    clearInterval(interval);

    Players.remove(ws.uuid);

    console.info(DateTime, ws.uuid, `Disconnected`);
  });

  /*
   * Move to function for reusability.
   * Globally broadcast message.
   * Turn into a function or class for reuseablity.
   */
  ws.on('message', (message) => {
    console.info(`${message}`);

    Message.message(JSON.parse(`${message}`));

    if (Message.type === `forfeit`) {
      Players.remove(ws.uuid);
      ws.close();
    }

    if (Message.type === `uuid`) {
      Players.replace(ws.uuid, Message.data);
      ws.uuid = Message.data;
    }

    if (Message.type === `word`) {
      // const word = new Words(ws.messages.current, ws.messages.previous);
    }

    // Messages.push(JSON.parse(`${message}`).message);
    // wss.clients.forEach((client) => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(JSON.parse(message).message);
    //   }
    // });
  });

  // ws.on('message', (data) => {
  //   let DateTime = new Date().toString();

  //   ws.messages.current = JSON.parse(`${data}`).message;

  //   console.log(ws.messages);
  //   let word = new Words(ws.messages.current, ws.messages.previous);
  //   console.log(word.valid);

  //   if (ws.messages.previous !== '' && !word.valid) {
  //     /*
  //      * Globally broadcast message.
  //      * Turn into a function or class.
  //      */
  //     wss.clients.forEach((client) => {
  //       if (client !== ws && client.readyState === WebSocket.OPEN) {
  //         client.send(JSON.parse(data).message);
  //       }
  //     });
  //   }

  // ws.send(DateTime + ' Returning: ' + ws.messages.current);

  //   ws.messages.previous = ws.messages.current;
  // });

  // ws.on('pong', heartbeat);

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

  // if (Messages.all.length > 0) {
  //   ws.send(JSON.stringify(Messages));
  // }

  console.info(`${DateTime.toUTCString()} Client connected.`);
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    console.info(`Checking ${ws.player} connection.`);

    if (ws.isAlive === false) {
      Players.remove(ws.uuid);

      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 1000);

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
