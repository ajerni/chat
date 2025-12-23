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

## Deployment to Vercel

### Important Note About Socket.IO on Vercel

⚠️ **WebSocket Limitations**: Vercel's serverless functions have timeout limits and may not support long-lived WebSocket connections perfectly. The current setup should work for basic use, but for production with many concurrent users, consider:

1. **Current Setup** (Works for testing/small scale):
   - Deploy using: `vercel`
   - WebSocket connections may disconnect after inactivity
   - Best for development and small-scale deployments

2. **Production Alternatives** (Recommended for production):
   - **Railway** - Great for Socket.IO apps
   - **Render** - Supports WebSockets well
   - **Fly.io** - Good for real-time apps
   - **DigitalOcean App Platform** - Full WebSocket support
   - **VPS** (DigitalOcean, Linode, etc.) - Full control

If you need to deploy to Vercel specifically, the current configuration should work, but be aware of potential connection stability issues with long-lived WebSocket connections.

### Deploy to Vercel

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

4. For production deployment:
```bash
vercel --prod
```

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

