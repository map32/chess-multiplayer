import getPool from '../../../lib/db.mjs';
import app from '../../../firebase/config';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {NextResponse} from "next/server";
//gid, result(0,0.5,1)
export async function POST(req) {
    // ... (code for handling the request method and required fields
    const data = await req.json();
    const {gid, result} = data;
    try {
      const pool = await getPool();
      // Check if user with the same username or email already exists
      const res = await pool.query(
        `update Games set result = $1 where gid = $2`,
        [result, gid]
      );
      return NextResponse.json({ message: 'set successfully' },{status:200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }