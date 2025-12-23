# Configuration Guide

## Frontend Configuration

After deploying the backend to Render, you need to update these files with your Render server URL.

### 1. Update `public/script.js`

Find this line:
```javascript
const SOCKET_SERVER_URL = 'https://your-app-name.onrender.com';
```

Replace `your-app-name` with your actual Render service name.

**Example:**
If your Render service is named `chat-socket-server`, it should be:
```javascript
const SOCKET_SERVER_URL = 'https://chat-socket-server.onrender.com';
```

### 2. Update `public/index.html`

Find this line:
```html
<script src="https://your-app-name.onrender.com/socket.io/socket.io.js"></script>
```

Replace `your-app-name` with your actual Render service name.

**Example:**
```html
<script src="https://chat-socket-server.onrender.com/socket.io/socket.io.js"></script>
```

## Backend Configuration

The backend is already configured to allow requests from `chat.andierni.ch`. 

If you need to add additional domains, edit `server.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      'https://chat.andierni.ch',
      'http://chat.andierni.ch',
      'https://admin.socket.io',
      // Add more domains here if needed
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## Finding Your Render URL

1. Go to [render.com](https://render.com)
2. Log in to your dashboard
3. Click on your web service
4. The URL is shown at the top, e.g., `https://chat-socket-server.onrender.com`

## Testing Configuration

After updating the URLs:

1. Open `https://chat.andierni.ch` in your browser
2. Open browser console (F12)
3. Check for Socket.IO connection - you should see no errors
4. Try joining a room and sending a message

If you see connection errors, verify:
- Render service is running (check Render dashboard)
- URLs are correct in both `script.js` and `index.html`
- CORS settings in `server.js` include your frontend domain

