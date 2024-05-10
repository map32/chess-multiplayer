import UserProfile from './profile';
import getPool from '../../../lib/db.mjs';
import {NextResponse} from "next/server";

const getData = async (username) => {
    try {
    const pool = await getPool();
    // Check if user with the same username or email already exists
    const existingUser = await pool.query(
        'SELECT * FROM Users WHERE username = $1',
        [username]
    );
    const data = existingUser.rows[0];
    const games = await pool.query(
        `select Games.*, Users.username as whitename, ub.username as blackname from Games join Users on Users.uid = Games.whiteid join Users as ub on ub.uid = Games.blackid WHERE whiteid = $1 or blackid = $2 order by Games.starttime desc`,
        [data.uid,data.uid]
    );
    const game = games.rows;
    console.log(data);
    return {user: data, game: game};
    } catch (err) {
    console.error(err);
    return null;
    }
}

const Profile = async ({params}) => {
    const user = await getData(params.username);

    return (
        <UserProfile
        user={user.user}
        games={user.game}
        friends={[]}
        />
    );
}

export default Profile;