'use client'
import { createContext, useState, useEffect, useContext, useRef } from "react";
import {socket} from "../../client";
import Chess from "chess.js";
import { Chessboard } from "react-chessboard";

export const GameResultContext = createContext({});

export const GameResultProvider = ({ children }) => {
  const [result, setResult] = useState('-1'); // 0: black win, 0.5: draw, 1: white win, -1: game ongoing
  const [game, setGame] = useState(new Chess());
  const [color, setColor] = useState(null);
  const timerRef = useRef();
  const [timew, setTimew] = useState(0);
  const [timeb, setTimeb] = useState(0);
  const [gameState, setGameState] = useState({
    game: new Chess(),
    result: -1,
    color: null,
    turn: 'w',
    move: 1,
    gid: null,
    timeincrement: 0
  })

  return (
    <GameResultContext.Provider value={{ gameState, setGameState, timerRef ,timew, setTimew, timeb, setTimeb}}>
      {children}
    </GameResultContext.Provider>
  );
};

const toMove = (fen) => {
  return fen.split(' ')[1];
}

export default function PlayRandomMoveEngine({}) {
  const {gameState, setGameState, timerRef, timew, setTimew, timeb, setTimeb} = useContext(GameResultContext); // result:0: black win, 0.5: draw, 1: white win, -1: game ongoing
  const {game, result, color, turn, move, gid} = gameState;                      // game: Chess.js object
                                                                            // color: my color 'w' 'b'
                                                                            // turn: current color to move 'w' 'b'
                                                                            // move: move number (changes after both colors move)
  
  
  const gameRef = useRef(gameState);
  useEffect(() => {
    gameRef.current = gameState;
    if (gameState.result !== -1) {
      clearInterval(timerRef.current);
    }
  },[gameState])
  const lasttimeRef = useRef();
    useEffect(() => {
      const onGameStateReceived = (data) => {
        console.log(data);
        const gameStateCopy = { ...gameState };
        gameStateCopy.game.move(data.move);
        gameStateCopy.turn = data.turn;
        gameStateCopy.move = data.movenumber;
        gameStateCopy.result = data.end;
        lasttimeRef.current = [Date.now(), gameStateCopy.turn === 'w' ? data.timew : data.timeb];
        setGameState(gameStateCopy);
        setTimew(data.timew);
        setTimeb(data.timeb);
      }
      lasttimeRef.current = [Date.now(), gameState.turn === 'w' ? timew : timeb];
      socket.on("game-state", onGameStateReceived);
      timerRef.current = setInterval(decrementTime,100);
      return () => {
        socket.off("game-state",onGameStateReceived);
        clearInterval(timerRef.current);
      }
    },[])

    const decrementTime = () => {
      if (gameRef.current.move < 2 || !lasttimeRef.current) return;
      const curtime = Date.now();
      if (gameRef.current.turn === 'w') setTimew(time => lasttimeRef.current[1] - (curtime - lasttimeRef.current[0]));
      else if (gameRef.current.turn === 'b') setTimeb(time => lasttimeRef.current[1] - (curtime - lasttimeRef.current[0]));
    }

  function makeAMove(move) {
    const gameStateCopy = { ...gameState };
    if (toMove(gameStateCopy.game.fen()) !== color || result !== -1) return null;
    const moveobj = gameStateCopy.game.move(move);
    if (!moveobj) return null;
    socket.emit("game-move",{gid:gid,uid:localStorage.getItem('id'),turn:gameStateCopy.turn,move,time:gameStateCopy === 'w' ? timew : timeb});
    if (gameStateCopy.turn === 'w') {
      gameStateCopy.turn = 'b';
      
    } else  {
      gameStateCopy.movenumber += 1;
      gameStateCopy.turn = 'w';

    }
    setGameState(gameStateCopy);
    return result; // null if the move was illegal, the move object if the move was legal
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
      return; // exit if the game is over
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeAMove(possibleMoves[randomIndex]);
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // illegal move
    
    if (move === null) return false;
    return true;
  }

  function onDragStart() {
    return result === -1;
  }

  return <Chessboard position={gameState.game.fen()} onDragStart={onDragStart} onPieceDrop={onDrop} boardOrientation={color === 'b' ? 'black' : 'white'}
    
  />;
}