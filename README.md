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

### Quick Start

1. **Deploy backend to Render**:
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
   - Get your Render service URL (e.g., `https://your-app.onrender.com`)

2. **Update frontend configuration**:
   - Update `SOCKET_SERVER_URL` in `public/script.js` with your Render URL
   - Update Socket.IO script src in `public/index.html` with your Render URL

3. **Upload frontend files** to `chat.andierni.ch`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

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
├── vercel.json      # Vercel configuration
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
- **Deployment**: Vercel

## License

ISC

