import { useState } from "react";
import { CameraView } from "@/components/CameraView";
import { ChainGallery } from "@/components/ChainGallery";
import { AdjustmentControls } from "@/components/AdjustmentControls";
import { useChains } from "@/hooks/useChains";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedChainIndex, setSelectedChainIndex] = useState<number | null>(null);
  const [chainSize, setChainSize] = useState(1.0);
  const [verticalPosition, setVerticalPosition] = useState(0.5);
  const { data, isLoading, error } = useChains();
  const { toast } = useToast();

  const selectedChain = selectedChainIndex !== null && data?.chains[selectedChainIndex]
    ? data.chains[selectedChainIndex].data
    : null;

  const handlePrevious = () => {
    if (selectedChainIndex !== null && selectedChainIndex > 0) {
      setSelectedChainIndex(selectedChainIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedChainIndex !== null && data?.chains && selectedChainIndex < data.chains.length - 1) {
      setSelectedChainIndex(selectedChainIndex + 1);
    }
  };

  const handleCapture = (imageData: string) => {
    toast({
      title: "Photo Captured!",
      description: "Your image has been downloaded successfully.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header - Compact on mobile */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="px-3 py-2 md:px-4 md:py-4">
          <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gold">
            Chain Fit Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
            Virtual Try-On Experience
          </p>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Camera View - Takes full available space on mobile */}
        <div className="flex-1 relative min-h-0">
          <CameraView
            selectedChain={selectedChain}
            onCapture={handleCapture}
            chainSize={chainSize}
            verticalPosition={verticalPosition}
          />
        </div>

        {/* Controls - Bottom sheet on mobile, sidebar on desktop */}
        <aside className="h-auto max-h-[45vh] md:max-h-none md:absolute md:right-0 md:top-0 md:bottom-0 md:w-80 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col shrink-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 md:h-full">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 md:h-full p-4 md:p-6">
              <div className="text-center">
                <p className="text-destructive mb-2 text-sm md:text-base">Failed to load chains</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Please check your connection
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto min-h-0">
                <ChainGallery
                  chains={data?.chains || []}
                  selectedChainIndex={selectedChainIndex}
                  onSelectChain={setSelectedChainIndex}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              </div>
              <div className="shrink-0">
                <AdjustmentControls
                  chainSize={chainSize}
                  verticalPosition={verticalPosition}
                  onChainSizeChange={setChainSize}
                  onVerticalPositionChange={setVerticalPosition}
                />
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Index;
