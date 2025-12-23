const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins (for client app) and admin.socket.io
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket.IO Admin UI
instrument(io, {
  auth: false, // Set to true and configure auth for production
  mode: "development", // Use "production" for production
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store users and rooms
const users = {}; // { socketId: { name, joinedRooms: [] } }
const rooms = {}; // { roomName: [socketId1, socketId2, ...] }

// Default public room
const DEFAULT_ROOM = 'public';

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ name, roomName }) => {
    const room = roomName || DEFAULT_ROOM;
    
    // Initialize user if not exists
    if (!users[socket.id]) {
      users[socket.id] = { name, joinedRooms: [], currentRoom: null };
    } else {
      users[socket.id].name = name;
    }

    // Check if already in this room
    if (users[socket.id].joinedRooms.includes(room)) {
      // Already in room, just send update
      const roomUserNames = rooms[room]
        ? rooms[room].map(id => users[id]?.name).filter(name => name)
        : [];
      socket.emit('room-joined', {
        room,
        userCount: rooms[room] ? rooms[room].length : 0,
        userNames: roomUserNames,
        joinedRooms: users[socket.id].joinedRooms
      });
      return;
    }

    // Join new room
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = [];
    }
    
    // Add to room and user's joined rooms
    if (!rooms[room].includes(socket.id)) {
      rooms[room].push(socket.id);
    }
    if (!users[socket.id].joinedRooms.includes(room)) {
      users[socket.id].joinedRooms.push(room);
    }

    // Always set newly joined room as current room
    users[socket.id].currentRoom = room;

    // Get list of user names in the room
    const roomUserNames = rooms[room]
      .map(id => users[id]?.name)
      .filter(name => name);

    // Notify room
    socket.to(room).emit('user-joined', {
      name,
      room,
      userCount: rooms[room].length,
      userNames: roomUserNames
    });

    // Send room info to the user
    socket.emit('room-joined', {
      room,
      userCount: rooms[room].length,
      userNames: roomUserNames,
      joinedRooms: users[socket.id].joinedRooms,
      isCurrentRoom: users[socket.id].currentRoom === room
    });
  });

  socket.on('leave-room', ({ roomName }) => {
    const user = users[socket.id];
    if (!user) return;

    const room = roomName || DEFAULT_ROOM;
    
    // Can't leave if not in the room
    if (!user.joinedRooms.includes(room)) {
      return;
    }

    // Can't leave the current room if it's the only room
    // Actually, let's allow leaving any room, but switch to another if it was current
    const wasCurrentRoom = room === user.currentRoom;

    // Leave the room
    socket.leave(room);
    if (rooms[room]) {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
      
      // Get updated user names list immediately
      const leftRoomUserNames = rooms[room]
        .map(id => users[id]?.name)
        .filter(name => name);
      
      // Notify remaining users in the room with updated user list
      socket.to(room).emit('user-left', {
        name: user.name,
        room,
        userCount: rooms[room].length,
        userNames: leftRoomUserNames
      });
    }

    // Remove from user's joined rooms
    user.joinedRooms = user.joinedRooms.filter(r => r !== room);

    // If leaving current room, switch to another room or default
    if (wasCurrentRoom && user.joinedRooms.length > 0) {
      const newCurrentRoom = user.joinedRooms[0];
      user.currentRoom = newCurrentRoom;
      const newRoomUserNames = rooms[newCurrentRoom]
        ? rooms[newCurrentRoom].map(id => users[id]?.name).filter(name => name)
        : [];
      socket.emit('room-switched', {
        room: newCurrentRoom,
        userCount: rooms[newCurrentRoom] ? rooms[newCurrentRoom].length : 0,
        userNames: newRoomUserNames,
        joinedRooms: user.joinedRooms
      });
    } else if (wasCurrentRoom && user.joinedRooms.length === 0) {
      // No rooms left, join default
      socket.join(DEFAULT_ROOM);
      if (!rooms[DEFAULT_ROOM]) {
        rooms[DEFAULT_ROOM] = [];
      }
      rooms[DEFAULT_ROOM].push(socket.id);
      user.joinedRooms.push(DEFAULT_ROOM);
      user.currentRoom = DEFAULT_ROOM;
      const defaultRoomUserNames = rooms[DEFAULT_ROOM]
        .map(id => users[id]?.name)
        .filter(name => name);
      socket.emit('room-switched', {
        room: DEFAULT_ROOM,
        userCount: rooms[DEFAULT_ROOM].length,
        userNames: defaultRoomUserNames,
        joinedRooms: user.joinedRooms
      });
    } else {
      // Just update the joined rooms list
      socket.emit('rooms-updated', {
        joinedRooms: user.joinedRooms
      });
    }
  });

  socket.on('switch-room', ({ roomName }) => {
    const user = users[socket.id];
    if (!user) return;

    const room = roomName || DEFAULT_ROOM;
    
    // Must be in the room to switch to it
    if (!user.joinedRooms.includes(room)) {
      return;
    }

    user.currentRoom = room;
    const roomUserNames = rooms[room]
      ? rooms[room].map(id => users[id]?.name).filter(name => name)
      : [];
    socket.emit('room-switched', {
      room,
      userCount: rooms[room] ? rooms[room].length : 0,
      userNames: roomUserNames,
      joinedRooms: user.joinedRooms
    });
  });

  socket.on('send-chat-message', ({ message, roomName }) => {
    const user = users[socket.id];
    if (!user) return;

    const room = roomName || user.currentRoom || DEFAULT_ROOM;
    
    // Verify user is in the room
    if (!user.joinedRooms.includes(room)) {
      return;
    }

    const timestamp = new Date().toISOString();

    socket.to(room).emit('chat-message', {
      message,
      name: user.name,
      timestamp,
      room
    });
  });

  socket.on('get-joined-rooms', () => {
    const user = users[socket.id];
    if (user) {
      socket.emit('joined-rooms-list', user.joinedRooms);
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      // Leave all rooms
      user.joinedRooms.forEach(room => {
        if (rooms[room]) {
          rooms[room] = rooms[room].filter(id => id !== socket.id);
          
          // Get updated user names list immediately
          const updatedUserNames = rooms[room]
            .map(id => users[id]?.name)
            .filter(name => name);
          
          socket.to(room).emit('user-left', {
            name: user.name,
            room,
            userCount: rooms[room].length,
            userNames: updatedUserNames
          });
        }
      });
      delete users[socket.id];
    }
    console.log('User disconnected:', socket.id);
  });
});

// Handle both local development and Vercel deployment
if (require.main === module) {
  // Running directly (local development)
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Running as a module (Vercel)
  // Vercel will handle the server
}

// Export for Vercel
module.exports = server;