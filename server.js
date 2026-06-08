const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-memory seating state: { seatId: { name, at } }
const seats = {};
let connected = 0;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Health check / current state
app.get('/api/state', (req, res) => {
  res.json({ seats, connected, total: Object.keys(seats).length });
});

// Admin reset (POST /api/reset with { secret: "..." })
app.post('/api/reset', (req, res) => {
  const secret = req.body?.secret;
  const adminSecret = process.env.ADMIN_SECRET || 'nostalgia2024';
  if (secret !== adminSecret) return res.status(403).json({ error: 'Forbidden' });
  Object.keys(seats).forEach(k => delete seats[k]);
  io.emit('update', seats);
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  connected++;
  // Send full current state to new connection
  socket.emit('init', { seats, connected });
  socket.broadcast.emit('peers', connected);

  socket.on('claim', ({ seatId, name }) => {
    if (!seatId || !name) return;
    name = String(name).trim().slice(0, 25);
    if (!name) return;

    // Reject if seat is taken by a different person
    if (seats[seatId] && seats[seatId].name !== name) {
      socket.emit('rejected', { seatId, by: seats[seatId].name });
      return;
    }

    // Release any other seat currently held by this name (moving)
    for (const id of Object.keys(seats)) {
      if (seats[id].name === name && id !== seatId) {
        delete seats[id];
      }
    }

    seats[seatId] = { name, at: Date.now() };
    io.emit('update', seats);
  });

  socket.on('vacate', ({ seatId, name }) => {
    if (seats[seatId]?.name === name) {
      delete seats[seatId];
      io.emit('update', seats);
    }
  });

  socket.on('disconnect', () => {
    connected = Math.max(0, connected - 1);
    io.emit('peers', connected);
    // Seats persist across disconnects (user can reconnect and reclaim)
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`ClassRoom Nostalgia running at http://localhost:${PORT}`);
  console.log(`Admin reset: POST /api/reset with { "secret": "${process.env.ADMIN_SECRET || 'nostalgia2024'}" }`);
});
