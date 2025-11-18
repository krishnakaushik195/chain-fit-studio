import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Button } from "./ui/button";
import { Camera as CameraIcon, Download, AlertCircle } from "lucide-react";

interface CameraViewProps {
  selectedChain: string | null;
  onCapture?: (imageData: string) => void;
}

export const CameraView = ({ selectedChain, onCapture }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chainImageRef = useRef<HTMLImageElement | null>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (selectedChain) {
      const img = new Image();
      img.src = selectedChain;
      img.onload = () => {
        chainImageRef.current = img;
      };
    }
  }, [selectedChain]);

  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Initialize FaceMesh
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;

        // Initialize Camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current && videoRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });

        cameraRef.current = camera;
        await camera.start();

        if (mounted) {
          setIsCameraReady(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Camera initialization error:", err);
        if (mounted) {
          setError("Failed to access camera. Please check permissions.");
          setIsLoading(false);
        }
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  const onResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Draw chain if selected and face detected
    if (chainImageRef.current && results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Get neck points (approximately)
      // Point 152: chin center
      // Points for neck width estimation
      const chinCenter = landmarks[152];
      const leftJaw = landmarks[172];
      const rightJaw = landmarks[397];

      if (chinCenter && leftJaw && rightJaw) {
        const neckCenterX = chinCenter.x * canvas.width;
        const neckCenterY = chinCenter.y * canvas.height + 40; // Offset below chin
        
        const neckWidth = Math.abs(rightJaw.x - leftJaw.x) * canvas.width * 1.2;
        const chainHeight = (chainImageRef.current.height / chainImageRef.current.width) * neckWidth;

        ctx.globalAlpha = 0.9;
        ctx.drawImage(
          chainImageRef.current,
          neckCenterX - neckWidth / 2,
          neckCenterY - chainHeight / 3,
          neckWidth,
          chainHeight
        );
        ctx.globalAlpha = 1.0;
      }
    }

    ctx.restore();
  };

  const handleCapture = () => {
    if (!canvasRef.current) return;
    
    const imageData = canvasRef.current.toDataURL("image/png");
    onCapture?.(imageData);

    // Download image
    const link = document.createElement("a");
    link.download = `chain-fit-${Date.now()}.png`;
    link.href = imageData;
    link.click();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Video element (hidden, used for processing) */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        autoPlay
      />

      {/* Canvas for rendering */}
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-full object-contain ${isCameraReady ? 'block' : 'hidden'}`}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <CameraIcon className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
            <p className="text-foreground text-lg font-medium">Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground text-lg font-medium mb-2">Camera Access Required</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Capture Button */}
      {isCameraReady && !error && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button
            onClick={handleCapture}
            size="lg"
            className="bg-gold hover:bg-gold-muted text-background font-semibold gap-2 shadow-lg"
          >
            <Download className="w-5 h-5" />
            Capture
          </Button>
        </div>
      )}
    </div>
  );
};
