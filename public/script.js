// Connect to Render backend server
// Update this URL to match your Render service URL
const SOCKET_SERVER_URL = 'https://your-app-name.onrender.com'; // Replace with your Render URL

const socket = io(SOCKET_SERVER_URL, {
  transports: ['websocket', 'polling']
});

// DOM elements
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const welcomeModal = document.getElementById('welcome-modal');
const nameInput = document.getElementById('name-input');
const startChatBtn = document.getElementById('start-chat-btn');
const roomInput = document.getElementById('room-input');
const joinRoomBtn = document.getElementById('join-room-btn');
const currentRoomName = document.getElementById('current-room-name');
const roomDisplay = document.getElementById('room-display');
const userCount = document.getElementById('user-count');
const userNameDisplay = document.getElementById('user-name-display');
const roomsList = document.getElementById('rooms-list');
const userNamesList = document.getElementById('user-names-list');

let userName = '';
let currentRoom = 'public';
let joinedRooms = [];

// Welcome modal
startChatBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name) {
    userName = name;
    userNameDisplay.textContent = name;
    welcomeModal.style.display = 'none';
    joinRoom('public', name, true);
  }
});

nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    startChatBtn.click();
  }
});

// Join room function
function joinRoom(roomName, name = userName, switchToRoom = true) {
  const room = roomName || 'public';
  socket.emit('join-room', { name, roomName: room });
  // Don't call switchToRoomView here - let the server response handle it
  // The room-joined event will set it as current room
  roomInput.value = '';
}

// Switch to a room view (change current room)
function switchToRoomView(roomName) {
  if (!joinedRooms.includes(roomName)) {
    return; // Can't switch to a room we're not in
  }
  currentRoom = roomName;
  socket.emit('switch-room', { roomName: currentRoom });
  currentRoomName.textContent = currentRoom;
  roomDisplay.textContent = currentRoom;
  messageContainer.innerHTML = '';
  appendMessage('system', `Switched to ${currentRoom}`, 'system');
}

// Join room button
joinRoomBtn.addEventListener('click', () => {
  const roomName = roomInput.value.trim().toLowerCase().replace(/\s+/g, '-');
  if (roomName) {
    if (!joinedRooms.includes(roomName)) {
      joinRoom(roomName, userName, true);
    } else {
      // Already in room, just switch to it
      switchToRoomView(roomName);
    }
  }
});

roomInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    joinRoomBtn.click();
  }
});

// Socket events
socket.on('room-joined', (data) => {
  const isNewRoom = !joinedRooms.includes(data.room);
  const wasDifferentRoom = currentRoom !== data.room;
  
  if (isNewRoom) {
    joinedRooms.push(data.room);
  }
  joinedRooms = data.joinedRooms || joinedRooms;
  
  // Always set the newly joined room as current room
  if (data.isCurrentRoom) {
    currentRoom = data.room;
    currentRoomName.textContent = currentRoom;
    roomDisplay.textContent = currentRoom;
    
    // Clear messages and show join message when joining a new room or switching rooms
    if (isNewRoom || wasDifferentRoom) {
      messageContainer.innerHTML = '';
      appendMessage('system', `You joined ${currentRoom}`, 'system');
    }
    
    userCount.textContent = `${data.userCount} ${data.userCount === 1 ? 'user' : 'users'}`;
    if (data.userNames) {
      updateUserNamesList(data.userNames);
    }
  }
  
  updateRoomsList();
});

socket.on('room-switched', (data) => {
  currentRoom = data.room;
  currentRoomName.textContent = currentRoom;
  roomDisplay.textContent = currentRoom;
  userCount.textContent = `${data.userCount} ${data.userCount === 1 ? 'user' : 'users'}`;
  joinedRooms = data.joinedRooms || joinedRooms;
  if (data.userNames) {
    updateUserNamesList(data.userNames);
  }
  messageContainer.innerHTML = '';
  appendMessage('system', `Switched to ${currentRoom}`, 'system');
  updateRoomsList();
});

socket.on('rooms-updated', (data) => {
  const previousRooms = [...joinedRooms];
  joinedRooms = data.joinedRooms || joinedRooms;
  
  // Find which room was left (not the current one)
  const leftRoom = previousRooms.find(r => !joinedRooms.includes(r) && r !== currentRoom);
  if (leftRoom) {
    appendMessage('system', `You left ${leftRoom}`, 'system');
  }
  
  updateRoomsList();
});

socket.on('user-joined', (data) => {
  // Only update if this is for the current room
  if (data.room === currentRoom) {
    appendMessage('system', `${data.name} joined the room`, 'system');
    userCount.textContent = `${data.userCount} ${data.userCount === 1 ? 'user' : 'users'}`;
    if (data.userNames) {
      updateUserNamesList(data.userNames);
    }
  }
});

socket.on('user-left', (data) => {
  // Only update if this is for the current room
  if (data.room === currentRoom) {
    appendMessage('system', `${data.name} left the room`, 'system');
    userCount.textContent = `${data.userCount} ${data.userCount === 1 ? 'user' : 'users'}`;
    // Immediately update user names list
    if (data.userNames) {
      updateUserNamesList(data.userNames);
    }
  }
});

socket.on('chat-message', (data) => {
  appendMessage(data.name, data.message, 'other');
});

socket.on('joined-rooms-list', (rooms) => {
  joinedRooms = rooms || [];
  updateRoomsList();
});

// Update rooms list - show all joined rooms with leave button
function updateRoomsList() {
  roomsList.innerHTML = '';
  
  joinedRooms.forEach(room => {
    const roomItem = document.createElement('div');
    roomItem.className = 'room-item';
    
    const roomNameSpan = document.createElement('span');
    roomNameSpan.className = 'room-item-name';
    roomNameSpan.textContent = `# ${room}`;
    if (room === currentRoom) {
      roomItem.classList.add('active');
    }
    
    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'room-leave-btn';
    leaveBtn.innerHTML = '×';
    leaveBtn.setAttribute('aria-label', `Leave ${room}`);
    leaveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      leaveRoom(room);
    });
    
    roomItem.appendChild(roomNameSpan);
    roomItem.appendChild(leaveBtn);
    
    roomItem.addEventListener('click', (e) => {
      if (e.target !== leaveBtn && !leaveBtn.contains(e.target)) {
        switchToRoomView(room);
      }
    });
    
    roomsList.appendChild(roomItem);
  });
  
  if (roomsList.children.length === 0) {
    roomsList.innerHTML = '<div class="no-rooms">No rooms joined</div>';
  }
}

// Leave room function
function leaveRoom(roomName) {
  if (joinedRooms.length <= 1) {
    // Can't leave if it's the only room
    appendMessage('system', 'You must be in at least one room', 'system');
    return;
  }
  
  socket.emit('leave-room', { roomName });
  // Don't show message here - wait for server response to handle room switching
}

// Update user names list
function updateUserNamesList(userNames) {
  userNamesList.innerHTML = '';
  
  if (!userNames || userNames.length === 0) {
    return;
  }
  
  userNames.forEach(name => {
    const userNameItem = document.createElement('div');
    userNameItem.className = 'user-name-item';
    userNameItem.textContent = name;
    userNamesList.appendChild(userNameItem);
  });
}

// Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    appendMessage('You', message, 'self');
    socket.emit('send-chat-message', { message, roomName: currentRoom });
    messageInput.value = '';
  }
});

// Append message to chat
function appendMessage(name, message, type) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (type === 'system') {
    messageElement.innerHTML = `
      <div class="message-content system-message">
        <span>${message}</span>
      </div>
    `;
  } else {
    messageElement.innerHTML = `
      <div class="message-content">
        <span class="message-name">${name}</span>
        <span class="message-text">${message}</span>
        <span class="message-time">${timestamp}</span>
      </div>
    `;
  }
  
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Auto-focus message input
messageInput.addEventListener('focus', () => {
  messageInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Request joined rooms list on load
socket.on('connect', () => {
  socket.emit('get-joined-rooms');
});

