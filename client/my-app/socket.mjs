import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import getPool from "./lib/db.mjs";
import { authenticate, addmove, checkEnd,initialTime ,incrementTime, EloRating} from './app/api/utils.mjs';
import { Chess } from "chess.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
let io;
const matchmaking = {}; //uid of people finding a match
const playing = {}; //uid of people in games
const games = {}; //key: gid, value: {game object, uidw, uidb, turn, movenumber, timecontrol, starttime, time left for 1, time left for 2, interval handler, time epoch for last move}

const processMatchQueue = async (queue) => {
    let time_ = Infinity;
    let uid_ = -1;
    let entries = Object.entries(queue);
    if (entries.length < 2) return;
    for (const [uid, time] of entries) {
      if (time_ > time) {
        time_ = time;
        uid_ = uid;
      }
    }
    if (uid_ === -1) return;
    delete queue[uid_];
    entries = Object.entries(queue);
    const randomIndex = Math.floor(Math.random() * entries.length);
    const [uid_1, time_1] = entries[randomIndex];
    delete entries[uid_1];
    console.log(`Match Found: id ${uid_} and ${uid_1}`);
    startGame(uid_,uid_1);
}

const startGame = async (uid_,uid_1) => {
  let timecontrol = '5+5';
  try {
    const pool = await getPool();
    // Check if user with the same username or email already exists
    const res = await pool.query(
      `insert into Games (whiteid, blackid, timecontrol) values ($1,$2,$3) returning gid`,
      [uid_,uid_1,timecontrol]
    );
    console.log(res.rows[0]);
    const gid = res.rows[0].gid;
    playing[uid_] = true;
    playing[uid_1] = true;
    const curtime = Date.now();
    games[gid] = {
      game: new Chess(),
      uidw: uid_,
      uidb: uid_1,
      turn: 'w',
      movenumber:1,
      starttime: curtime,
      timecontrol: timecontrol,
      timew: initialTime(timecontrol) * 60 * 1000,
      timeb: initialTime(timecontrol) * 60 * 1000,
      interval: null,
      lasttime: curtime,
      timew_start: initialTime(timecontrol) * 60 * 1000,
      timeb_start: initialTime(timecontrol) * 60 * 1000,
      fens: []
    };
    io.in(`${uid_}`).in(`${uid_1}`).socketsJoin(`game_${gid}`);
    io.in(`${uid_}`).in(`${uid_1}`).socketsLeave("match");
    io.in(`${uid_}`).emit("matchmaking-found",{color:'w', gid, opponent: uid_1, timecontrol: timecontrol});
    io.in(`${uid_1}`).emit("matchmaking-found",{color:'b', gid, opponent: uid_, timecontrol: timecontrol});
  } catch (err){
    console.log(err);
  }
}

const sendMove = async (gid, move) => {
    const {turn, movenumber, game, timew, timeb, lasttime} = games[gid];
    const end = checkEnd(game);
    io.in(`game_${gid}`).emit("game-state",{game: game.fen(), turn, movenumber, timew, timeb, end, move, lasttime});
    games[gid].fens.push(game.fen());
    if (end !== -1) {
      clearInterval(games[gid].interval);
      await setEnd(gid,games[gid].game,end);
    }
}

const countdown = async (gid, game, timecolor) => {
    const curtime = Date.now();
    games[gid][timecolor] = games[gid][`${timecolor}_start`] - (curtime - games[gid].lasttime);
    if (games[gid][timecolor] <= 0) {
        io.in(`game_${gid}`).emit("game-state",{game: game.fen(), turn, movenumber, timew, timeb, end:  timecolor === 'timew' ? 0 : 1, move, lasttime});
        await setEnd(gid, game, timecolor === 'timew' ? 0 : 1);
    }
}

const setEnd = async (gid, game, end) => {
  delete playing[games[gid].uidw];
  delete playing[games[gid].uidb];
  clearInterval(games[gid].interval);
  io.in(`game_${gid}`).socketsLeave(`game_${gid}`);
  try {
    const pool = await getPool();
    // Check if user with the same username or email already exists
    await pool.query(
      `update Games set result = $1 where gid = $2`,
      [end, gid]
    );
    if (end !== 0.5) {
        const resw = await pool.query(`select rating from Users where uid = $1`,[games[gid].uidw]);
        const resb = await pool.query(`select rating from Users where uid = $1`,[games[gid].uidb]);
        const [white, black] = EloRating(resw.rows[0].rating, resb.rows[0].rating, 50, end);
        console.log(white,black);
        await pool.query('update Users set rating = $1 where uid = $2',[white, games[gid].uidw]);
        await pool.query('update Users set rating = $1 where uid = $2',[black, games[gid].uidb]);
    }
    await pool.query('BEGIN');
      const history = game.history();
      const history_fen = games[gid].fens;
      try {
        // Execute individual INSERT statements for each row
        let i = 0;
        for (i=0;i<history.length;i+=2) {
            if (i+1 < history.length)
              await pool.query('insert into Moves (gid, movenumber, whitemove, blackmove, completed) values ($1,$2,$3,$4,$5)',[gid,parseInt(i/2)+1,history[i],history[i+1],true]);
            else
              await pool.query('insert into Moves (gid, movenumber, whitemove, tomove) values ($1,$2,$3,$4)',[gid,parseInt(i/2)+1,history[i],'b']);
        }

        for (i=0;i<history.length;i++) {
          await pool.query('insert into Positions (gid, movenumber, posnumber, fen) values ($1,$2,$3,$4)',[gid,parseInt(i/2)+1,i,history_fen[i]]);
        }
        // Commit the transaction
        await pool.query('COMMIT');
      } catch (err) {
        // Rollback the transaction on error
        await pool.query('ROLLBACK');
        console.log(err);
        console.log(`Error inserting move rows on game ${gid}`);
      }
  } catch (err) {
    console.log(err);
  }
  delete games[gid];
}


app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer);
  io.use(async (socket, next) => {
    console.log(`connection detected`);
    const token = socket.handshake.auth.token;
    const uid = socket.handshake.auth.id;
    const fid = socket.handshake.auth.firebaseid;
    if (!token || !fid) next(new Error("Unauthorized"));
    let auth = false;
    auth = await authenticate(token,fid);
    if (auth) {
      socket.customId = uid;
      socket.firebaseId = fid;
      socket.join(`${uid}`);
      console.log(`connecting from uid ${uid}`);
      next();
    } else {
      console.log(`token is not verified`);
      next(new Error("Unauthorized"));
    }
  });


  io.on("connection", (socket) => {
    if (playing[socket.customId]) {
      let game = null;
      let color = '';
      let gid = null;
      const entries = Object.entries(games);
      for (const [gid_,g] of entries) {
        if (g.uidw === socket.customId || g.uidb === socket.customId) {
          game = g;
          gid = gid_;
          color = g.uidw === socket.customId ? 'w' : 'b';
          io.in(`${socket.customId}`).socketsJoin(`game_${gid}`);
        }
      }
      if (!game) {
        //player is playing a game but the game does not exist
        //either an error or the game ended while disconnected
        delete playing[socket.customId];
      } else {
        //send game data
        io.in(`${socket.customId}`).emit('game-rejoin',{
          gid: gid,
          game: game.game.fen(),
          color: color,
          opponent: color === 'w' ? game.uidb : game.uidw,
          timecontrol: game.timecontrol,
          turn: game.turn,
          movenumber: game.movenumber,
          timew: game.timew,
          timeb: game.timeb
        });
      }
    }

    socket.on("matchmaking-request",(data) => {
      console.log(playing)
      if (playing[data.uid]) return;
      matchmaking[data.uid] = Date.now();
      socket.customId = data.uid;
      socket.join("match");
      console.log(`matchmaking request from ${data.uid}`);
      console.log(matchmaking);
    });

    socket.on("matchmaking-cancel",(data) => {
      delete matchmaking[data.uid];
      socket.leave("match");
      console.log(`matchmaking cancel from ${data.uid}`);
      console.log(matchmaking);
    });

    socket.on("game-move", (data) => {
      //gid, uid, color, move, time left, 
      //turn number.
      const {gid, uid, turn, move, time} = data;
      if (!games[gid]) return;
      if (turn === 'w' && games[gid].uidw !== uid) return;
      if (turn === 'b' && games[gid].uidb !== uid) return;
      if (time <= 0) return;
      const game = games[gid].game;
      const movenumber = games[gid].movenumber;
      const moveobj = game.move(move);
      if (!moveobj) return;
      if (games[gid].interval) clearInterval(games[gid].interval);
      addmove({gid, turn, move: moveobj.san, movenumber});
      try {
        if (turn === 'w') {
          if (games[gid].movenumber >= 2) games[gid].timew += incrementTime(games[gid].timecontrol);
          games[gid].turn = 'b';
          //games[gid].timew = time;
        } else  {
          if (games[gid].movenumber >= 2) games[gid].timeb += incrementTime(games[gid].timecontrol);
          games[gid].movenumber += 1;
          games[gid].turn = 'w';
          //games[gid].timeb = time;
        }
        if (games[gid].movenumber >= 2) {
          games[gid].lasttime = Date.now();
          games[gid][`time${games[gid].turn}_start`] = games[gid][`time${games[gid].turn}`];
          games[gid].interval = setInterval(() => countdown(gid, games[gid].game, games[gid].turn === 'w' ? 'timew':'timeb'), 50);
        }
      } catch (err) {
        return;
      }
      sendMove(gid, move);
    });

    socket.on('game-resign', async (data) => {
      const {gid} = data;
      const res = socket.customId === games[gid].uidw ? 0 : socket.customId === games[gid].uidb ? 1 : -1;
      if (res !== -1) setEnd(gid,games[gid],res);
    });

    socket.on("disconnecting", async (reason) => {
      console.log(reason);
      console.log(`disconnecting from ${socket.customId}`);
      delete matchmaking[socket.customId];
      /**if (playing[socket.customId]) {
        const entries = Object.entries(games);
        let gid = null;
        let end = -1;
        let game = null;
        for (const [key,value] of entries) {
          if (value.uidw === socket.customId || value.uidb === socket.customId) {
            end = socket.customId === value.uidw ? 0 : 1;
            clearInterval(games[key].interval);
            gid = key;
            game = games[key].game;
            await setEnd(gid,game,end);
            break;
          }
        }
      }**/
      console.log(matchmaking);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  setInterval(() => processMatchQueue(matchmaking), 5000);
});