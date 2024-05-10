import getPool from '../../../lib/db.mjs';
import app from '../../../firebase/config';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {NextResponse} from "next/server";
//game id, move number, color, user id
export async function POST(req) {
    // ... (code for handling the request method and required fields
    const data = await req.json();
    const {gid, movenumber, color, uid, move} = data;
    try {
      const pool = await getPool();
      // Check if user with the same username or email already exists
      const res = await pool.query(
        `insert into Moves (gid, movenumber, ${color === 'w' ? 'whitemove' : 'blackmove'}) values ($1,$2,$3)
        on conflict (gid, movenumber) do update set ${color === 'w' ? 'whitemove' : 'blackmove'} = $3
        returning (whitemove, blackmove)`,
        [gid,movenumber,move]
      );
      return NextResponse.json({ id: res.rows[0].gid },{status:201});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }