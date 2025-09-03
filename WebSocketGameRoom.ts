import { Server } from 'socket.io';

const io = new Server();

class GameRoom {
  constructor() {
    this.players = [];
    this.gameState = {};
  }

  handleMove(playerId, move) {
    // Validate and broadcast move
  }
}

io.on('connection', (socket) => {
  socket.on('join-game', (data) => {
    // handle join
  });
  socket.on('make-move', (move) => {
    // handle move
  });
});

export default io;
