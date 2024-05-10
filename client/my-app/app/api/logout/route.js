import getPool from '../../../lib/db.mjs';
import firebase from '../../../firebase/admin.mjs';
import { getAuth } from "firebase-admin/auth";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";

export async function POST(req) {
    // ... (code for handling the request method and required fields)
    
    const data = await req.json();
  
    console.log(data);
    const { token } = data;
    if (!token) {
      return NextResponse.json({error:'Missing required fields'},{status:400});
    }
    try {
      const auth = getAuth(firebase);
      const decodedToken = await auth.verifyIdToken(token);
      cookies().delete('token');
      cookies().delete('uid');
      cookies().delete('fid');
      return NextResponse.json({ message: 'All cookies deleted' },{status:200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }