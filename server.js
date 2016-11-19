let http = require('http');
let express = require('express');
let webpack = require('webpack');
let webpackDevMiddleware = require('webpack-dev-middleware');
let webpackConfig = require('./webpack.dev');

let webpackCompiler = webpack(webpackConfig);
let app = express();
let server = http.Server(app);
let io = require('socket.io')(server);

// Game
let Player = require('./players/Player');
let Battle = require('./battle/Battle');

app.use(webpackDevMiddleware(webpackCompiler, {
  noInfo: true
}));
app.use(express.static(__dirname + '/dist'));

// Rooms bases on level
let rooms = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: []
};

let roomsInUse = [];

io.on('connection', function (socket) {
  console.log(`The user ${socket.id} is connected.`);

  socket.on('login', function (data) {
    // TODO: Find a user from database and auth it
    let user = new Player(data);

    socket.emit('logged', user);

    console.log(`The user ${data.nickname} is logged in.`);

    socket.on('play', function () {
      let {player} = user;

      console.log(`The user ${player.nickname} want to play.`);

      // Check if has rooms availables, if yes, join at room and the battle starts between the users
      if (rooms[player.level].length) {
        let roomEntered = rooms[player.level].shift();
        let oponent = roomEntered.user;

        // Join on the first room and remove the room of availables rooms
        console.log(`Joining the user ${player.nickname} on room ${roomEntered.roomId} at level ${player.level} against the oponent ${oponent.player.nickname}.`);
        socket.join(roomEntered.roomId);

        let players = {};
        players[oponent.player.nickname] = oponent;
        players[player.nickname] = user;

        let battle = new Battle({
          players,
          turns: [oponent.player.nickname, player.nickname],
        }, io.sockets.in(roomEntered.roomId));

        helpers.getSocketIdsByRoom(roomEntered.roomId, s => {
          s.on('draw card', battle.drawCard.bind(battle));
          s.on('close turn', battle.closeTurn.bind(battle));
          s.on('attack oponent', battle.attackTo.bind(battle));
          s.on('buy cards', battle.buyCards.bind(battle));
        });

        battle.starts();
      }
      else {
        // Create a room and wait for a oponent
        let roomId = String(parseInt(Math.random() * 9999999));

        console.log(`There is not a room available.. Creating the room ${roomId} at level ${player.level}.`);
        rooms[player.level].push({
          user,
          roomId
        });

        socket.join(roomId);

        socket.emit('waiting a oponent', roomId);
      }
    });
  });
});

const helpers = {
  getSocketIdsByRoom: (room, cb) => {
    let r = io.sockets.adapter.rooms[room].sockets;

    if (!cb) return r;

    return Object.keys(r).forEach(id => {
      let s = io.sockets.adapter.nsp.connected[id];

      cb(s);
    });
  },

};


// Some User Connected -> Find User Data ->
// -> Want to play -> Search Oponent -> Check for oponents in ranking ~
// -> Start a Battle

server.listen(8888);
