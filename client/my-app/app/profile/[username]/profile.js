import React from 'react';
import { formatDate } from '../../utils/dateutils';
import Link from 'next/link';

const UserProfile = ({ user, games, friends }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        {user ? <>
        <div className="mb-4">
          <span className="font-bold">Username:</span> {user?.username}
        </div>
        <div className="mb-4">
          <span className="font-bold">Email:</span> {user?.email}
        </div>
        <div className="mb-4">
          <span className="font-bold">ELO Rating:</span> {user?.rating}
        </div>
        <div className="mb-4">
          <span className="font-bold">Join Date:</span> {formatDate(user?.joindate)}
        </div></>
        : <></>}

        <h2 className="text-xl font-bold mb-4">Games Played</h2>
        <ul>
          {games.map((game) => (
            <li key={game.gid} className="mb-2 hover:bg-indigo-600">
              <Link href={`/game/${game.gid}`}>
              {(game.result == 1 && game.whitename === user?.username) || (game.result == 0 && game.blackname === user?.username) ? '🏆' : '❌'} vs. {game.whiteid === user?.uid ? game.blackname : game.whitename} ({formatDate(game.starttime)}) {game.timecontrol}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;