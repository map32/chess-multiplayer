'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import {socket} from '../../client';
import app from '../../firebase/config';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, getIdToken} from "firebase/auth";

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [signin, setSignin] = useState(true);
  const [logged, setLogged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!logged) return;
    router.push('/');
    router.refresh();
  },[logged])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Here, you would typically send the username and password to a server for authentication
    // For this example, we'll just check if the username and password are not empty
    if (email && password && ((!signin && username) || signin)) {
          try {
            const auth = getAuth(app);
            const userCredential = signin? await signInWithEmailAndPassword(auth, email, password)
            : await createUserWithEmailAndPassword(auth,email,password);
            const data = userCredential.user.toJSON();
            console.log(data);
            const token = await auth.currentUser?.getIdToken();
            console.log(token);
            const refresh_token = data.stsTokenManager.refreshToken;
            const response = await fetch(`/api/${signin? 'signin' : 'register'}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, email, token, password }),
            });
            const _ = await response.json();
            if (response.ok) {
              localStorage.setItem('id',_.id);
              localStorage.setItem('refresh_token',refresh_token);
              localStorage.setItem('token',token);
              localStorage.setItem('firebaseid',_.firebaseid);
              socket.auth.token = token;
              socket.auth.id = _.id;
              socket.auth.firebaseid = _.firebaseid;
              socket.connect();
              // Handle successful registration
            } else {
              console.error('Registration failed');
              // Handle registration failure
            }
          } catch (error) {
            console.error('Error:', error);
            // Handle network error
          }
      setMessage('Sign in successful!');
      setLogged(true);
    } else {
      setMessage('Please enter a valid username and password.');
    }
  };

  const handleSwitch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignin(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <form onSubmit={handleSubmit}>
          { !signin ? 
          <div className="mb-4">
            <label htmlFor="username" className="block font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-400 p-2 rounded"
            />
          </div>
          :
            <>
            </>
          }
          
          <div className="mb-6">
            <label htmlFor="email" className="block font-bold mb-2">
              Email:
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-400 p-2 rounded"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-400 p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
        </form>
        {message && <p className="mt-4 text-red-500 text-center">{message}</p>}

        <div className="flex justify-center mb-4 py-4">
          <button
            id="signInBtn"
            className={`py-2 px-4 rounded-l-lg bg-blue-500 text-white font-semibold focus:outline-none ${
              signin === true
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600 hover:bg-blue-200'
            }`}
            onClick={(e) => setSignin(true)}
          >
            Sign In
          </button>
          <button
            id="registerBtn"
            className={`py-2 px-4 rounded-r-lg bg-blue-500 text-white font-semibold focus:outline-none ${
              signin === false
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600 hover:bg-blue-200'
            }`}
            onClick={(e) => setSignin(false)}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}