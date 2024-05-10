const bcrypt = require('bcrypt');
import getPool from '../../../lib/db.mjs';
import firebase from '../../../firebase/admin.mjs';
import { getAuth } from "firebase-admin/auth";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";

export async function POST(req) {
    // ... (code for handling the request method and required fields)
    const data = await req.json();
    console.log(data);
    const { username, email, token } = data;
    if (!username || !email || !token) {
      return NextResponse.json({error:'Missing required fields'},{status:400});
    }
    try {
      const pool = await getPool();
      const auth = getAuth(firebase);
      let decodedToken;
      try {
        decodedToken = await auth.verifyIdToken(token);
        // Check if user with the same username or email already exists
      } catch (err) {
        return NextResponse.json({error:'Username or email already exists'},{status:409});
      }
      // Insert new user into the database
      const result = await pool.query(
        'INSERT INTO Users (username, email, firebaseid) VALUES ($1, $2, $3) RETURNING *',
        [username, email, decodedToken]
      );
      const uid = result.rows[0].uid;
      const fid = result.rows[0].firebaseid;
      cookies().set('token',token);
      cookies().set('uid',uid);
      cookies().set('fid',fid);
      return NextResponse.json({ message: 'User registered successfully', id: uid, token, firebaseid: fid},{status:201});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }