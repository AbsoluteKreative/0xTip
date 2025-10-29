#!/bin/sh
# start both backend and frontend

# start backend on port 3001 in background
PORT=3001 node server/index.js &

# start frontend on port 3000 (fly expects this)
PORT=3000 npm start
