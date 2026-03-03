const { Chess } = require('chess.js');
const c = new Chess();
for(let i=0; i<40; i++) {
  const moves = c.moves();
  c.move(moves[Math.floor(Math.random() * moves.length)]);
}
const pgn = c.pgn();
const history = c.history({verbose:true});

console.time('loadPgn');
for(let i=0; i<100; i++) {
  const c2 = new Chess();
  c2.loadPgn(pgn);
}
console.timeEnd('loadPgn');

console.time('replayHistory');
for(let i=0; i<100; i++) {
  const c3 = new Chess();
  for(const m of history) {
    c3.move(m);
  }
}
console.timeEnd('replayHistory');
