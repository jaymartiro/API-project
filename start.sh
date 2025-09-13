#!/bin/bash

echo "Starting Task Manager Application..."
echo

echo "Starting Backend API Server..."
gnome-terminal --title="Backend API" -- bash -c "npm install && npm run dev; exec bash" &

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend Application..."
gnome-terminal --title="Frontend App" -- bash -c "cd frontend && npm install && npm run dev; exec bash" &

echo
echo "Both services are starting..."
echo "Backend API: http://localhost:5000"
echo "Frontend App: http://localhost:3000"
echo
echo "Press Ctrl+C to stop all services..."
echo

# Wait for user to stop
wait
