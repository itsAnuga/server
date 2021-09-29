// import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { WebSocketServer } from 'ws';
import Words from '../classes/Words.js';

const sessions = {};
const wss = new WebSocketServer({ port: 1337 });

function heartbeat() {
  this.isAlive = true;
}

wss.on('close', () => {
  let DateTime = new Date().toString();

  ws.send(DateTime + ' Disconnected');

  clearInterval(interval);

  console.log(`Client connected!`);
});

wss.on('connection', (ws, req) => {
  console.info(req.headers);

  ws.isAlive = true;
  ws.messages = {
    current: '',
    previous: '',
  };
  ws.uuid = uuid();

  ws.on('pong', heartbeat);

  let DateTime = new Date().toString();

  ws.on('message', (message) => {
    let DateTime = new Date().toString();

    ws.messages.current = JSON.parse(`${message}`);

    console.log(DateTime);
    console.log(ws.messages.current.message);
    // console.log(`Received: ${message}.`);
    // console.log(`Comparing: ${JSON.stringify(ws.messages)}`);

    let word = new Words(ws.messages.current.message, ws.messages.previous);

    console.log(word.valid);

    ws.send(DateTime + ' Returning: ' + message);

    ws.messages.previous = ws.messages.current.message;
  });

  ws.send(DateTime + ' Connected');
  ws.send(JSON.stringify({ user: ws.uuid }));

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
