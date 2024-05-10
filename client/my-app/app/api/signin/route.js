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
    const { email, username, token } = data;
    if (!email || !token) {
      return NextResponse.json({error:'Missing required fields'},{status:400});
    }
    try {
      const pool = await getPool();
      // Hash the password
      const auth = getAuth(firebase);
      const decodedToken = await auth.verifyIdToken(token);
      const result = await pool.query(
        'SELECT * from Users where firebaseid = $1',
        [decodedToken.uid]
      );
      let uid,fid;
      if (result.rows.length == 0) {
        const result = await pool.query(
          'INSERT INTO Users (username, email, firebaseid) VALUES ($1, $2, $3) RETURNING *',
          [username, email, decodedToken.uid]
        );
        console.log(result);
      }
      uid = result.rows[0].uid;
      fid = result.rows[0].firebaseid;
      cookies().set('token',token);
      cookies().set('uid',uid);
      cookies().set('fid',fid);
      return NextResponse.json({ message: 'User signed in successfully', id: uid, token, firebaseid:fid},{status:200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }