// import axios from 'axios';
// import Player from '../classes/Player.js';
import { v4 as uuid } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';
import Words from '../classes/Words.js';

const Messages = [];
const Rooms = {
  Lobby: [],
};
const Players = {};
const Sessions = {};
const wss = new WebSocketServer({ port: 1337 });

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
  let DateTime = new Date().toString();

  // console.info(req.headers);

  ws.isAlive = true;
  ws.messages = {
    current: '',
    previous: '',
  };
  ws.uuid = uuid();

  ws.on('close', () => {
    let DateTime = new Date().toString();

    ws.send(DateTime + ' Disconnected');

    clearInterval(interval);

    console.log(`Client disconnected!`);
  });

  /*
   * Move to function for reusability.
   */
  ws.on('message', (data) => {
    Messages.push(JSON.parse(`${data}`).message);

    /*
     * Globally broadcast message.
     * Turn into a function or class for reuseablity.
     */
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.parse(data).message);
      }
    });
  });

  ws.on('message', (data) => {
    let DateTime = new Date().toString();

    ws.messages.current = JSON.parse(`${data}`).message;

    console.log(ws.messages);
    let word = new Words(ws.messages.current, ws.messages.previous);
    console.log(word.valid);

    if (ws.messages.previous !== '' && !word.valid) {
      /*
       * Globally broadcast message.
       * Turn into a function or class.
       */
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.parse(data).message);
        }
      });
    }

    ws.send(DateTime + ' Returning: ' + ws.messages.current);

    ws.messages.previous = ws.messages.current;
  });

  ws.on('pong', heartbeat);

  ws.send(DateTime + ' Connected');
  ws.send(JSON.stringify({ user: ws.uuid }));

  if (Messages.length > 0) {
    ws.send(JSON.stringify(Messages));
  }

  console.log(`Client connected!`);
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 1000);

setInterval(() => {
  console.log(Messages);
}, 1000);
