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
        'select Games.*, Users.username as whitename, ub.username as blackname from Games join Users on Users.uid = Games.whiteid join Users as ub on ub.uid = Games.blackid WHERE Games.gid = $1',
        [id]
      );
      const movesres = await pool.query(
        'select moves.*, positions.fen, positions.posnumber from moves join positions on moves.gid = positions.gid and moves.movenumber = positions.movenumber WHERE moves.gid = $1 order by posnumber,movenumber asc',
        [id]
      );
      const moves = movesres.rows;
      const data = existingUser.rows[0];
      
      console.log(data);
      return NextResponse.json({ game: data, moves,  },{status:200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' },{status:500});
    }
  }