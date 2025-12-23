# Deployment Guide

## Deployment Architecture

This app uses a **split deployment**:
- **Frontend**: Served from `chat.andierni.ch` (your own server)
- **Backend**: Socket.IO server deployed on Render

## Backend Deployment on Render

### Step 1: Prepare for Render

1. **Create a repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create a `render.yaml` file** (optional, for infrastructure as code):
   ```yaml
   services:
     - type: web
       name: chat-socket-server
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository

4. Configure the service:
   - **Name**: `chat-socket-server` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier is fine for testing

5. **Important Settings**:
   - **Auto-Deploy**: `Yes` (deploys on every push)
   - **Health Check Path**: `/health`

6. Click **"Create Web Service"**

7. Wait for deployment to complete (usually 2-3 minutes)

8. **Copy your Render URL** - it will look like:
   ```
   https://chat-socket-server.onrender.com
   ```

### Step 3: Update Frontend Configuration

After deploying to Render, you need to update the frontend files to point to your Render server:

1. **Update `public/script.js`**:
   ```javascript
   const SOCKET_SERVER_URL = 'https://your-render-app-name.onrender.com';
   ```
   Replace `your-render-app-name` with your actual Render service name.

2. **Update `public/index.html`**:
   ```html
   <script src="https://your-render-app-name.onrender.com/socket.io/socket.io.js"></script>
   ```
   Replace `your-render-app-name` with your actual Render service name.

3. **Upload the updated files** to `chat.andierni.ch`

### Step 4: Configure CORS (Already Done)

The server is already configured to allow requests from `chat.andierni.ch`. The CORS settings in `server.js` include:
- `https://chat.andierni.ch`
- `http://chat.andierni.ch` (for testing)

## Frontend Deployment on Your Server

### Option 1: Simple File Upload

1. Upload the `public/` folder contents to your server at `chat.andierni.ch`
2. Ensure your web server serves the files correctly
3. Make sure `index.html` is accessible at the root

### Option 2: Using Git (Recommended)

1. Clone your repository on your server
2. Copy the `public/` folder to your web root:
   ```bash
   cp -r public/* /var/www/chat.andierni.ch/
   ```

### Option 3: Using a Build Process

If you want to automate updates:
```bash
# On your server
git pull origin main
cp -r public/* /var/www/chat.andierni.ch/
```

## Environment Variables

### Render Backend

No environment variables are required. Render automatically sets:
- `PORT` - Automatically assigned by Render
- `NODE_ENV` - Set to `production` in production

### Optional: Custom Domain on Render

If you want to use a custom domain for the backend:

1. In Render dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain (e.g., `socket.chat.andierni.ch`)
4. Update DNS records as instructed by Render
5. Update the frontend URLs to use your custom domain

## Testing Your Deployment

1. **Test Backend Health**:
   ```bash
   curl https://your-render-app.onrender.com/health
   ```
   Should return: `{"status":"ok","service":"socket.io-server"}`

2. **Test Frontend**:
   - Open `https://chat.andierni.ch` in your browser
   - Open browser console (F12)
   - Check for Socket.IO connection errors
   - Try joining a room and sending messages

3. **Test Real-time Features**:
   - Open the app in multiple browser tabs
   - Join the same room from different tabs
   - Send messages - they should appear in real-time
   - Verify user lists update when users join/leave

## Troubleshooting

### Connection Issues

**Problem**: Socket.IO can't connect to Render server

**Solutions**:
1. Check that your Render service is running (green status in dashboard)
2. Verify the URL in `public/script.js` matches your Render service URL
3. Check browser console for CORS errors
4. Ensure CORS in `server.js` includes your frontend domain

**Check Render Logs**:
- Go to Render dashboard → Your service → "Logs"
- Look for connection errors or startup issues

### CORS Errors

**Problem**: Browser shows CORS errors

**Solutions**:
1. Verify `chat.andierni.ch` is in the CORS origin list in `server.js`
2. Check that you're using `https://` (not `http://`) if your site uses HTTPS
3. Clear browser cache and try again

### Render Service Keeps Sleeping (Free Tier)

**Problem**: Service goes to sleep after 15 minutes of inactivity

**Solutions**:
1. This is normal for Render's free tier
2. First connection after sleep may take 30-50 seconds to wake up
3. Consider upgrading to paid plan for always-on service
4. Or use a service like UptimeRobot to ping `/health` every 5 minutes

### Messages Not Appearing

**Solutions**:
1. Check browser console for Socket.IO connection status
2. Verify you're in the same room in all tabs
3. Check Render logs for server-side errors
4. Ensure rooms are being joined correctly (check network tab)

## Updating the Deployment

### Update Backend (Render)

1. Make changes to `server.js`
2. Commit and push to GitHub:
   ```bash
   git add server.js
   git commit -m "Update server"
   git push
   ```
3. Render will automatically redeploy (if auto-deploy is enabled)

### Update Frontend (Your Server)

1. Make changes to files in `public/`
2. Upload updated files to `chat.andierni.ch`
3. Clear browser cache if needed

## Monitoring

### Render Dashboard

- View logs in real-time
- Monitor service health
- Check deployment history
- View metrics (requests, response times)

### Socket.IO Admin UI

The server is configured with Socket.IO Admin UI. To use it:

1. Go to [https://admin.socket.io](https://admin.socket.io)
2. Enter your Render server URL: `https://your-render-app.onrender.com`
3. Click "Connect"
4. Monitor connections, rooms, and events in real-time

## Security Considerations

1. **CORS**: Only allows requests from `chat.andierni.ch` (configured in `server.js`)
2. **HTTPS**: Always use HTTPS for production
3. **Admin UI**: Currently set to `auth: false` - consider enabling authentication for production
4. **Rate Limiting**: Consider adding rate limiting for production use

## Cost

- **Render Free Tier**: 
  - Services sleep after 15 minutes of inactivity
  - 750 hours/month free
  - Perfect for development and small projects

- **Render Paid Plans**: 
  - Always-on service
  - Better performance
  - More suitable for production

## Alternative: Railway

If you prefer Railway over Render:

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Get URL: `railway domain`

Then update frontend URLs accordingly.
