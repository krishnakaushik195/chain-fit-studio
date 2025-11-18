# Chain Fit Studio - Setup Guide

## Overview
A production-ready virtual try-on experience for chains/necklaces with real-time face mesh detection.

## Architecture
- **Frontend**: React + TypeScript + Vite
- **Backend**: Flask (Python)
- **Face Detection**: MediaPipe Face Mesh
- **Styling**: Tailwind CSS with custom design system

## Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Webcam/camera access

## IMPORTANT: Local Development Setup

**To connect your React frontend to the Flask backend running on localhost:**

1. You MUST run the React app locally (not in Lovable preview)
2. The Lovable preview cannot connect to `localhost:5000` due to browser security
3. Follow the steps below to run both backend and frontend locally

## Backend Setup (Flask)

1. **Install Python dependencies**:
```bash
pip install flask flask-cors
```

2. **Update Flask app.py to enable CORS**:
Add this to your Flask code:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
```

3. **Create chains folder**:
```bash
mkdir chains
```

4. **Add chain images**:
   - Place PNG/JPG images of chains in the `chains/` folder
   - Name them descriptively (e.g., `gold-chain.png`, `silver-pendant.png`)

5. **Run Flask server**:
```bash
python app.py
```

Server will start at `http://localhost:5000`

## Frontend Setup (React)

1. **Download the project code** (from Lovable: click on project name → Download Code)

2. **Install dependencies**:
```bash
npm install
```

3. **Configure API URL**:
   - Create a `.env` file in the root directory
   - Add this line:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Start development server**:
```bash
npm run dev
```

Frontend will start at `http://localhost:8080`

## Running Both Together (Local Development)

**Terminal 1** - Start Flask Backend:
```bash
python app.py
```

**Terminal 2** - Start React Frontend:
```bash
npm run dev
```

Now open `http://localhost:8080` in your browser - the frontend will connect to your Flask backend!

## Production Deployment

### Backend (Flask)
- Deploy to Render, Railway, or any Python hosting platform
- Ensure `PORT` environment variable is set (Render does this automatically)
- Add your chain images to the deployment

### Frontend (React)
1. **Build for production**:
```bash
npm run build
```

2. **Deploy** using Lovable's built-in deployment:
   - Click "Publish" in Lovable
   - Or deploy `dist/` folder to Vercel/Netlify

3. **Update API URL**:
   - Set `VITE_API_URL` to your production Flask backend URL

## Usage
1. Allow camera permissions when prompted
2. Select a chain from the gallery
3. Position your face in view
4. The chain will overlay on your neck in real-time
5. Click "Capture" to download a photo

## Key Features
- Real-time face mesh detection
- Accurate neck positioning
- Multiple chain selection
- Photo capture & download
- Responsive design
- Premium UI/UX

## Troubleshooting

**Camera not working:**
- Ensure HTTPS is used (required for camera access in production)
- Check browser permissions
- Try a different browser

**Chains not loading:**
- Verify Flask backend is running
- Check `VITE_API_URL` in `.env`
- Ensure chain images exist in `chains/` folder

**Face not detected:**
- Ensure good lighting
- Face the camera directly
- Wait a moment for initialization

## Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- MediaPipe Face Mesh
- Flask
- TanStack Query

## API Endpoints

### GET /api/chains
Returns all available chain images as base64

**Response:**
```json
{
  "chains": [
    {
      "name": "gold-chain",
      "data": "data:image/png;base64,..."
    }
  ],
  "names": ["gold-chain", ...]
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "chains_loaded": 5
}
```
