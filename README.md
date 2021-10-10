# The Server - The Game

## Requirements

- OS: Linux, macOS, Windows
- node.js >= 14.x

## Installation Instructions

```bash
# create a .env file

# add a .env key `PORT=`

# add a int value `PORT=1337`

# install dependencies
$ npm install

# start server
$ npm start
```

You're up and running on `ws://localhost:PORT`!

## Event types

* `wss.on('connection')`, Every thing involving a connected client goes in here.
* `wss.close`, if the WebSocketServer ever closes it's connection. Ain't gonne happen thou :)
* `ws.close`, if client closes it's connection.
* `ws.message`, messages from the client. See [Message types](#message-types)
* `ws.pong`, Heartbeat response from client.

### Message types

* `forfeit`, client gives up.
* `register`, register/add a new or returning client.
* `word`, a word from the active game. Validate and handle the situation accordingly.

### Classes

`Messages`, contains functions regarding the message handling.

`Players`, contains functions regarding the player handling.
