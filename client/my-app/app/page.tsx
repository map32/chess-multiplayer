"use client"
import { useEffect, useState, useContext } from "react";
import Game, { GameResultProvider, GameResultContext } from "./utils/chessboard";
import { socket } from "../client";
import {millisecondsToSeconds} from './utils/dateutils';
import Chess from "chess.js";

const Home = () => {
  return (
    <GameResultProvider>
      <HomeContent />
    </GameResultProvider>
  )
}

export default Home;

function HomeContent() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [playerState, setPlayerState] = useState(0); //0: nothing, 1: matchmaking, 2: in a game
  const {gameState, setGameState, timerRef, timew, setTimew, timeb, setTimeb} = useContext(GameResultContext); // result:0: black win, 0.5: draw, 1: white win, -1: game ongoing
  const {game, result, color, turn, move} = gameState;
  let strictmodecheck: Boolean;
  useEffect(() => {
    const connect = async (token:String | null, id:String | null, fid: String | null) => {
      socket.auth = {};
      socket.auth.token = token;
      socket.auth.id = id;
      socket.auth.firebaseid = fid;
      console.log('connecting');
      socket.connect();
    }
    if (socket.connected) {
      onConnect();
    } else {
      if (localStorage.getItem('token') && !strictmodecheck) {
        strictmodecheck = true;
        connect(localStorage.getItem('token'),localStorage.getItem('id'),localStorage.getItem('firebaseid'));
      }
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function onDisconnecting() {
      if (localStorage.getItem('id'))
      socket.emit("matchmaking-cancel",{uid:localStorage.getItem('id')});
    }

    function onMatchFound(data) {
      //color, opponent id, game id, time control
      const {color, opponent, gid, timecontrol} = data;
      const time = parseInt(timecontrol.split('+')[0]) * 60 * 1000;
      const increment = parseInt(timecontrol.split('+')[1]) * 60 * 1000;
      const gameStateCopy = {...gameState};
      gameStateCopy.color = color;
      gameStateCopy.move = 1;
      gameStateCopy.turn = 'w';
      gameStateCopy.result = -1;
      gameStateCopy.game = new Chess();
      gameStateCopy.gid = gid;
      gameStateCopy.timeincrement = increment;
      
      setTimew(time);
      setTimeb(time);
      setGameState(gameStateCopy);
      setPlayerState(2);
    }

    function onGameRejoin(data) {
      const {gid, game, color, opponent, timecontrol, timew, timeb, turn, movenumber} = data;
      const increment = parseInt(timecontrol.split('+')[1]) * 60 * 1000;
      const gameStateCopy = {...gameState};
      gameStateCopy.color = color;
      gameStateCopy.move = movenumber;
      gameStateCopy.turn = turn;
      gameStateCopy.result = -1;
      gameStateCopy.game = new Chess(game);
      gameStateCopy.gid = gid;
      gameStateCopy.timeincrement = increment;
      
      setTimew(timew);
      setTimeb(timeb);
      setGameState(gameStateCopy);
      setPlayerState(2);
    }
    
    socket.on("disconnecting",onDisconnecting);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("matchmaking-found", onMatchFound);
    socket.on("game-rejoin", onGameRejoin);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("disconnecting",onDisconnecting);
      socket.off("matchmaking-found",onMatchFound);
      socket.off("game-rejoin", onGameRejoin);
    };
  }, []);

  const handleRequest = async (e: React.FormEvent<HTMLButtonElement> | React.FormEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (localStorage.getItem('id'))
      socket.emit("matchmaking-request",{uid:localStorage.getItem('id')});
    setPlayerState(1);
  }



  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <section className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold mb-4">Welcome to Chess Website</h1>
            <div>
              <a
                href="#"
                onClick={handleRequest}
                className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded mr-4"
              >
                Play Now
              </a>
            </div>
            <div>
            <p>Status: { isConnected ? "connected" : "disconnected" }</p>
            <p>Transport: { transport }</p>
          </div>
          </div>
          <div className="w-1 md:w-1/2">
          <div className="md:w-1/2 flex flex-col">
            <div className="time-display">
              {playerState === 2 && gameState.color ? <p>{millisecondsToSeconds(gameState.color === 'w' ? timeb : timew)}</p> : <></>}
            </div>
            <div className="game-container">
              {playerState === 2 ? <Game /> : <></>}
            </div>
            <div className="time-display">
              {playerState === 2 && gameState.color ? <p>{millisecondsToSeconds(gameState.color === 'b' ? timeb : timew)}</p> : <></>}
            </div>
            <div className="winner">
              {playerState === 2 && gameState.result !== -1 ? <p>{`You have ${gameState.result === 0.5 ? 'drawn': gameState.result === 1 && gameState.color === 'b' || gameState.result === 0 && gameState.color === 'w' ? 'lost' : 'won'} the game.`}</p> : <></>}
            </div>
            </div>
          </div>
        </section>


      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Chess Website. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}