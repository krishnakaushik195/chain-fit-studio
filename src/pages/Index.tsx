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
  const [verticalPosition, setVerticalPosition] = useState(0.2);
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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gold">
            Chain Fit Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Virtual Try-On Experience
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Camera View */}
        <div className="flex-1 relative">
          <CameraView
            selectedChain={selectedChain}
            onCapture={handleCapture}
            chainSize={chainSize}
            verticalPosition={verticalPosition}
          />
        </div>

        {/* Chain Gallery Sidebar */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <p className="text-destructive mb-2">Failed to load chains</p>
                <p className="text-sm text-muted-foreground">
                  Please check your connection
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                <ChainGallery
                  chains={data?.chains || []}
                  selectedChainIndex={selectedChainIndex}
                  onSelectChain={setSelectedChainIndex}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              </div>
              <AdjustmentControls
                chainSize={chainSize}
                verticalPosition={verticalPosition}
                onChainSizeChange={setChainSize}
                onVerticalPositionChange={setVerticalPosition}
              />
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Index;
