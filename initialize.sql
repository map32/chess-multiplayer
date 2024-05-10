<<<<<<< HEAD
-- Create the database
CREATE DATABASE chess_website;

-- Connect to the database
\c chess_website

-- Create the "Users" table
CREATE TABLE Users (
    uid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100),
    joindate DATE NOT NULL DEFAULT CURRENT_DATE,
    rating FLOAT
);

-- Create the "Games" table
CREATE TABLE Games (
    gid SERIAL PRIMARY KEY,
    whiteid INT NOT NULL REFERENCES Users(uid),
    blackid INT NOT NULL REFERENCES Users(uid),
    starttime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endtime TIMESTAMP,
    result NUMERIC(2,1) CHECK (result IN (1, 0, 0.5)),
    timecontrol VARCHAR(20) NOT NULL
);

-- Create the "Moves" table
CREATE TABLE Moves (
    mid SERIAL PRIMARY KEY,
    gid INT NOT NULL REFERENCES Games(gid),
    movenumber INT NOT NULL,
    whitemove VARCHAR(10),
    blackmove VARCHAR(10),
    tomove VARCHAR(1) NOT NULL CHECK (ToMove IN ('w', 'b')) DEFAULT 'w',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT move_un UNIQUE (gid,movenumber)
);

-- Create the "Moves" table
CREATE TABLE Positions (
    pid SERIAL PRIMARY KEY,
    gid INT NOT NULL REFERENCES Games(gid),
    posnumber INT NOT NULL,
    fen VARCHAR(256)
=======
-- Create the database
CREATE DATABASE chess_website;

-- Connect to the database
\c chess_website

-- Create the "Users" table
CREATE TABLE Users (
    uid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100),
    joindate DATE NOT NULL DEFAULT CURRENT_DATE,
    rating FLOAT
);

-- Create the "Games" table
CREATE TABLE Games (
    gid SERIAL PRIMARY KEY,
    whiteid INT NOT NULL REFERENCES Users(uid),
    blackid INT NOT NULL REFERENCES Users(uid),
    starttime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endtime TIMESTAMP,
    result NUMERIC(2,1) CHECK (result IN (1, 0, 0.5)),
    timecontrol VARCHAR(20) NOT NULL
);

-- Create the "Moves" table
CREATE TABLE Moves (
    mid SERIAL PRIMARY KEY,
    gid INT NOT NULL REFERENCES Games(gid),
    movenumber INT NOT NULL,
    whitemove VARCHAR(10),
    blackmove VARCHAR(10),
    tomove VARCHAR(1) NOT NULL CHECK (ToMove IN ('w', 'b')) DEFAULT 'w',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT move_un UNIQUE (gid,movenumber)
);

-- Create the "Moves" table
CREATE TABLE Positions (
    pid SERIAL PRIMARY KEY,
    gid INT NOT NULL REFERENCES Games(gid),
    posnumber INT NOT NULL,
    fen VARCHAR(256)
>>>>>>> 312561d3a398f0f5b0d2f3028f0fa93e491a3d2c
);