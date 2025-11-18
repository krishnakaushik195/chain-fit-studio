import { useState, useEffect, useRef } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Camera as CameraIcon } from 'lucide-react';

interface Chain {
  name: string;
  data: string;
}

function App() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chainScale, setChainScale] = useState(1.0);
  const [verticalOffset, setVerticalOffset] = useState(0.2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentChainImageRef = useRef<HTMLImageElement>(new Image());
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Load chains from API
  useEffect(() => {
    fetch('/api/chains')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.chains.length > 0) {
          setChains(data.chains);
          currentChainImageRef.current.src = data.chains[0].data;
          setIsLoading(false);
        } else {
          setError('No chains found');
          setIsLoading(false);
        }
      })
      .catch(err => {
        setError('Failed to load chains: ' + err.message);
        setIsLoading(false);
      });
  }, []);

  // Update chain image when index changes
  useEffect(() => {
    if (chains.length > 0) {
      currentChainImageRef.current.src = chains[currentIndex].data;
    }
  }, [currentIndex, chains]);

  const startCamera = async () => {
    try {
      if (!videoRef.current || !canvasRef.current) return;

      // Initialize MediaPipe Face Mesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => 
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;

      // Start camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: window.innerWidth > 768 ? 1280 : 720,
        height: window.innerWidth > 768 ? 720 : 1280
      });

      await camera.start();
      cameraRef.current = camera;
      setCameraActive(true);
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    // Draw video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // Draw chain if face detected
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      drawChain(ctx, landmarks, canvas.width, canvas.height);
    }
  };

  const drawChain = (ctx: CanvasRenderingContext2D, landmarks: any[], w: number, h: number) => {
    const JAW_LEFT = 234;
    const JAW_RIGHT = 454;
    const CHIN = 152;
    const NOSE_TIP = 4;

    const jawL = { x: landmarks[JAW_LEFT].x * w, y: landmarks[JAW_LEFT].y * h };
    const jawR = { x: landmarks[JAW_RIGHT].x * w, y: landmarks[JAW_RIGHT].y * h };
    const chin = { x: landmarks[CHIN].x * w, y: landmarks[CHIN].y * h };
    const nose = { x: landmarks[NOSE_TIP].x * w, y: landmarks[NOSE_TIP].y * h };

    const jawMidX = (jawL.x + jawR.x) / 2;
    const faceLength = Math.sqrt((nose.x - chin.x) ** 2 + (nose.y - chin.y) ** 2);
    const jawWidth = Math.sqrt((jawR.x - jawL.x) ** 2 + (jawR.y - jawL.y) ** 2);

    let verticalOff = faceLength * 0.3;
    const widthFactor = Math.min(jawWidth / w, 0.3);
    verticalOff += widthFactor * faceLength * 0.8;

    const neckX = jawMidX;
    const neckY = chin.y + verticalOff;

    const targetW = jawWidth * (1.4 + (jawWidth / w) * 0.8);
    let scale = targetW / currentChainImageRef.current.width;
    scale *= chainScale;

    const angle = Math.atan2(jawR.y - jawL.y, jawR.x - jawL.x);

    const chainW = currentChainImageRef.current.width * scale;
    const chainH = currentChainImageRef.current.height * scale;

    ctx.save();
    ctx.translate(neckX, neckY + faceLength * 0.15 - chainH * verticalOffset);
    ctx.rotate(angle);
    ctx.drawImage(currentChainImageRef.current, -chainW / 2, 0, chainW, chainH);
    ctx.restore();
  };

  const previousChain = () => {
    setCurrentIndex((prev) => (prev - 1 + chains.length) % chains.length);
  };

  const nextChain = () => {
    setCurrentIndex((prev) => (prev + 1) % chains.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading Chain Fit Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
      {/* Video Panel */}
      <div className="flex-1 relative bg-black">
        <video ref={videoRef} className="hidden" autoPlay playsInline />
        <canvas ref={canvasRef} className="w-full h-full object-cover md:object-contain" />

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              onClick={startCamera}
              className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold text-lg px-8 py-6 hover:scale-105 transition-transform"
            >
              <CameraIcon className="mr-2 h-6 w-6" />
              Start Camera
            </Button>
          </div>
        )}

        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-md p-3 border-b border-white/10 flex justify-between items-center">
          <div className="text-green-400 text-sm font-medium flex items-center gap-2">
            {cameraActive && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
            {chains[currentIndex]?.name || 'Chain Fit Studio'}
          </div>
        </div>

        {/* Quick Actions (Mobile) */}
        <div className="md:hidden absolute right-4 bottom-20 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={previousChain}
            className="rounded-full w-12 h-12 bg-green-400/20 backdrop-blur border-2 border-green-400/50 hover:bg-green-400/30"
          >
            <ChevronLeft className="h-6 w-6 text-green-400" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={nextChain}
            className="rounded-full w-12 h-12 bg-green-400/20 backdrop-blur border-2 border-green-400/50 hover:bg-green-400/30"
          >
            <ChevronRight className="h-6 w-6 text-green-400" />
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      <div className={`md:w-[350px] bg-gray-900/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto transition-transform md:translate-y-0 ${isPanelOpen ? 'fixed bottom-0 left-0 right-0 max-h-[70vh]' : 'fixed bottom-0 left-0 right-0 translate-y-[calc(100%-60px)] max-h-[70vh]'} md:relative md:h-auto`}>
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gray-800/80 cursor-pointer" onClick={() => setIsPanelOpen(!isPanelOpen)}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              ⚙️ Controls
            </h2>
            <div className={`text-2xl transition-transform ${isPanelOpen ? 'rotate-180' : ''}`}>▼</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Chain Selection */}
          <Card className="bg-gray-800/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-green-400 text-base">🔗 Select Chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {chains.map((chain, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      idx === currentIndex
                        ? 'bg-gradient-to-r from-green-400/20 to-cyan-400/20 border-2 border-green-400'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={previousChain} className="w-full">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" onClick={nextChain} className="w-full">
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Adjustments */}
          <Card className="bg-gray-800/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-green-400 text-base">⚙️ Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-300">Chain Size</span>
                  <span className="text-green-400 font-semibold">{chainScale.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[chainScale]}
                  onValueChange={(v) => setChainScale(v[0])}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-300">Vertical Position</span>
                  <span className="text-green-400 font-semibold">{verticalOffset.toFixed(2)}</span>
                </div>
                <Slider
                  value={[verticalOffset]}
                  onValueChange={(v) => setVerticalOffset(v[0])}
                  min={-0.3}
                  max={0.5}
                  step={0.05}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-red-900/90 border-2 border-red-500 rounded-xl p-6 max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">Camera Access Required</h3>
            <p className="text-red-100 mb-4">{error}</p>
            <p className="text-sm text-red-200">Please allow camera access in your browser settings.</p>
            <Button onClick={() => setError('')} className="mt-4 w-full bg-red-600 hover:bg-red-700">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
