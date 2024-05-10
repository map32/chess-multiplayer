import {getPool} from '../../lib/db.mjs';
import firebase from '../../firebase/admin.mjs';
import { getAuth } from 'firebase-admin/auth';
export const addgame = async ({uid_, uid_1, timecontrol}) => {
    try {
        const pool = await getPool();
        // Check if user with the same username or email already exists
        const res = await pool.query(
        `insert into Games (whiteid, blackid, timecontrol) values ($1,$2,$3) returning gid`,
        [uid_,uid_1,timecontrol]
        );
        return res.rows[0].gid;
    } catch (err) {
        console.log("addGame", err);
        return null;
    }
};

export const addmove = async ({gid, color, move, movenumber}) => {
    try {
        const pool = await getPool();
        // Check if user with the same username or email already exists
        if (color === 'w') {
            const res = await pool.query(
                `insert into Moves (gid, whitemove, movenumber) values ($1,$2,$3) returning mid`,
                [gid,move,movenumber]
                );
                return res.rows[0].mid;
        } else {
            const res = await pool.query(
                `update Moves set blackmove = $1, tomove = $2, completed = $3 where gid = $4 and movenumber = $5`,
                [move, 'b', true, gid, movenumber]);
        }
    } catch (err) {
        console.log("addGame", err);
        return null;
    }
};

export const authenticate = async (token,firebaseid) => {

    try {
        const decoded = await getAuth(firebase).verifyIdToken(token);
        console.log('decoded',decoded.uid,firebaseid);
        return decoded.uid === firebaseid;
    } catch (err) {
        console.log(err);
        return false;
    }
};
export const initialTime = (timecontrol) => parseInt(timecontrol.split('+')[0]);
export const incrementTime = (timecontrol) => parseInt(timecontrol.split('+')[1]) * 1000;
export const checkEnd = (game) => {
    if (game.game_over()) {
        if (game.in_draw()) {
            return 0.5
        } else if (game.in_checkmate()) {
            return (game.turn() === 'b' ? 1 : 0);
        }
    }
    return -1;
}
export const endGame = ({gid}) => {

}

export const Probability = (rating1, rating2) => {
    return (
        (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
    );
    }
     
    // Function to calculate Elo rating
    // K is a constant.
    // d determines whether Player A wins
    // or Player B.
export const EloRating = (Ra, Rb, K, d) => {
    // To calculate the Winning
    // Probability of Player B
    let Pb = Probability(Ra, Rb);
     
    // To calculate the Winning
    // Probability of Player A
    let Pa = Probability(Rb, Ra);
     
    // Case 1 When Player A wins
    // Updating the Elo Ratings
    if (d === 1) {
        Ra = Ra + K * (1 - Pa);
        Rb = Rb + K * (0 - Pb);
    }
     
    // Case 2 When Player B wins
    // Updating the Elo Ratings
    else {
        Ra = Ra + K * (0 - Pa);
        Rb = Rb + K * (1 - Pb);
    }
    return [Ra, Rb]
    }
     