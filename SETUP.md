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

## Backend Setup (Flask)

1. **Install Python dependencies**:
```bash
pip install flask
```

2. **Create chains folder**:
```bash
mkdir chains
```

3. **Add chain images**:
   - Place PNG/JPG images of chains in the `chains/` folder
   - Name them descriptively (e.g., `gold-chain.png`, `silver-pendant.png`)

4. **Run Flask server**:
```bash
python app.py
```

Server will start at `http://localhost:5000`

## Frontend Setup (React)

1. **Install dependencies**:
```bash
npm install
```

2. **Configure API URL**:
   - Copy `.env.example` to `.env`
   - Set `VITE_API_URL` to your Flask backend URL
   
   For local development:
   ```
   VITE_API_URL=http://localhost:5000
   ```
   
   For production:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

3. **Start development server**:
```bash
npm run dev
```

Frontend will start at `http://localhost:8080`

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
