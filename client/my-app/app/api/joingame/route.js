import getPool from '../../../lib/db.mjs';
import app from '../../../firebase/config';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {NextResponse} from "next/server";
//game id, user id
export async function POST(req) {
    // ... (code for handling the request method and required fields
    const data = await req.json();
    const {gid, uid} = data;
    try {
      const pool = await getPool();
      // Check if user with the same username or email already exists
      const res = await pool.query(
        `select whiteid, blackid from Games where gid = $1`,
        [gid]
      );
      if (res.rows.length == 0) {
        return NextResponse.json({ error: 'Game not found' },{status:404});
      }
      if (res.rows[0].whiteid)
      return NextResponse.json({ id: res.rows[0].gid },{status:201});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }