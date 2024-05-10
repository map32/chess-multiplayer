const bcrypt = require('bcrypt');
import getPool from '../../../lib/db.mjs';
import app from '../../../firebase/config';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {NextResponse} from "next/server";


export async function GET(req) {
    // ... (code for handling the request method and required fields
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    try {
      const pool = await getPool();
      // Check if user with the same username or email already exists
      const existingUser = await pool.query(
        'SELECT * FROM Users WHERE uid = $1',
        [id]
      );
      const data = existingUser.rows[0];
      console.log(data);
      return NextResponse.json({ ...data },{status:200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }