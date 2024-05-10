'use client'
import Image from 'next/image';
import Board, { GameResultContext, GameResultProvider} from '../../utils/chessboard.js';
import React , {useEffect, useState }from 'react';
import { Chessboard } from 'react-chessboard';
import Chess from "chess.js";
const Game = ({params}) => {
    
    return <>
        <GameResultProvider>
            <GameContent params={params}/>
        </GameResultProvider>
    </>
}
const GameContent = ({params}) => {
    const {result, game} = React.useContext(GameResultContext);
    const [gameData, setGameData] = useState({moves:[]});
    const [g, setG] = useState(new Chess());
    useEffect(() => {
        const getData = () => {
            let data = null;
            fetch(`/api/getGame?id=${params.id}`).then(res => {res.json().then(res => {res.moves = res.moves.filter((v,i) => i % 2 === 1);setGameData(res);console.log(res);}); }).catch((err) => console.log(err));
        }
        getData();
    },[])
    const handleMove = (fen) => {
        g.load(fen)
        setG({...g});
        return;
    }
    return (
    <>

      <main className="container mx-auto px-4 py-8">
        <section className="flex flex-col md:flex-row items-center">
            {gameData.game? <>
            <div>
                {gameData?.game?.whitename} {gameData?.game?.result == 1 ? '🏆' : '❌'} vs {gameData?.game?.blackname} {gameData?.game?.result == 0 ? '🏆' : '❌'}
            </div>
            <ul>
            {gameData.moves.map((move,i) => (
                <li key={move.mid} className="mb-2 hover:bg-indigo-600" onClick={() => handleMove(move.fen)}>
                {move.movenumber}. {move.whitemove} {move.blackmove}
                </li>
            ))}
            </ul>
            <div className="md: w-1/4"><Chessboard position={g.fen()}/></div>
            </> : <></>}
        </section>
      </main>
    </>
    )
};
export default Game;