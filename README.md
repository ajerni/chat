# Chat Room App

A modern, real-time chat application with room support built with Socket.IO, Express, and vanilla JavaScript.

## Features

- 🎨 Modern, dark-themed UI
- 💬 Real-time messaging with Socket.IO
- 🏠 Room support - join public or create custom rooms
- 👥 User count display per room
- 📱 Responsive design
- ⚡ Fast and lightweight

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run devStart
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment

This app uses a **split deployment**:
- **Frontend**: Served from `chat.andierni.ch` (your own server)
- **Backend**: Socket.IO server deployed on Render

### Deploy Backend to Render (server.js is deployed as web app on render.com)

1. **Create a GitHub repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Render**:
   - Go to [render.com](https://render.com) and sign up/login
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `chat-socket-server` (or your preferred name)
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free tier is fine for testing
     - **Health Check Path**: `/health`
   - Click **"Create Web Service"**
   - Wait for deployment (2-3 minutes)
   - Copy your Render URL (e.g., `https://chat-nivx.onrender.com`)

3. **Update frontend configuration**:
   - Update `SOCKET_SERVER_URL` in `public/script.js` with your Render URL
   - Update Socket.IO script src in `public/index.html` with your Render URL
   - (Already configured for `https://chat-nivx.onrender.com`)

4. **Upload frontend files**:
   - Upload the `public/` folder contents to `chat.andierni.ch`
   - Ensure `index.html` is accessible at the root

### Testing

1. **Test backend health**:
   ```bash
   curl https://chat-nivx.onrender.com/health
   ```
   Should return: `{"status":"ok","service":"socket.io-server"}`

2. **Test frontend**:
   - Open `https://chat.andierni.ch` in your browser
   - Check browser console for connection errors
   - Try joining a room and sending messages

For detailed deployment instructions and troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Environment Variables

No environment variables are required for basic functionality. The app will use:
- `PORT` environment variable (defaults to 3000)
- Automatically detects protocol (http/https) based on deployment

## Project Structure

```
chat/
├── public/           # Frontend files
│   ├── index.html   # Main HTML file
│   ├── script.js    # Client-side JavaScript
│   └── style.css    # Styles
├── server.js        # Express + Socket.IO server
├── render.yaml      # Render configuration (optional)
├── package.json     # Dependencies
└── README.md        # This file
```

## Usage

1. **Enter your name** when prompted
2. **Join a room**:
   - Default room is "public"
   - Type a room name and click "Join Room" to create/join a custom room
   - Click on any room in the "Active Rooms" list to join
3. **Send messages** in the chat input
4. **Switch rooms** anytime by joining a different room

## Socket.IO Admin UI

This app is configured to work with [Socket.IO Admin UI](https://admin.socket.io/) for monitoring and debugging.

### Using Admin UI

1. Make sure your server is running
2. Go to [https://admin.socket.io](https://admin.socket.io)
3. Enter your server URL (e.g., `http://localhost:3000` for local development)
4. Click "Connect" to start monitoring

The Admin UI allows you to:
- Monitor active connections
- View rooms and their members
- Send messages to specific sockets
- Monitor events in real-time
- Debug connection issues

**Note**: For production, enable authentication in `server.js` by setting `auth: true` and configuring credentials.

## Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Monitoring**: Socket.IO Admin UI
- **Deployment**: Render (backend), Self-hosted (frontend)

## License

ISC

