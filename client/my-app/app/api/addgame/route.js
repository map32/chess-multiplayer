import getPool from '../../../lib/db.mjs';
import app from '../../../firebase/config';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {NextResponse} from "next/server";
//white uid, black uid, time control
export async function POST(req) {
    // ... (code for handling the request method and required fields
    const data = await req.json();
    console.log(data);
    const {whiteid, blackid, timecontrol} = data;
    try {
      const pool = await getPool();
      // Check if user with the same username or email already exists
      const res = await pool.query(
        `insert into Games (whiteid, blackid, timecontrol) values ($1,$2,$3) returning gid`,
        [whiteid,blackid,timecontrol]
      );
      console.log(res.rows);
      return NextResponse.json({ id: res.rows[0].gid },{status:201});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }