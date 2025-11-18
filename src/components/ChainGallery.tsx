import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chain {
  name: string;
  data: string;
}

interface ChainGalleryProps {
  chains: Chain[];
  selectedChainIndex: number | null;
  onSelectChain: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const ChainGallery = ({ 
  chains, 
  selectedChainIndex, 
  onSelectChain,
  onPrevious,
  onNext 
}: ChainGalleryProps) => {
  if (chains.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No chains available</p>
      </div>
    );
  }

  const hasMultipleChains = chains.length > 1;

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-2 md:p-4 space-y-2 md:space-y-3">
          <h3 className="text-xs md:text-sm font-semibold text-gold uppercase tracking-wider mb-2 md:mb-4 px-1">
            Select Chain
          </h3>
          {chains.map((chain, index) => (
            <button
              key={index}
              onClick={() => onSelectChain(index)}
              className={cn(
                "w-full p-2 md:p-4 rounded-lg border-2 transition-all active:scale-95 md:hover:scale-105",
                "bg-card active:bg-secondary md:hover:bg-secondary",
                selectedChainIndex === index
                  ? "border-gold shadow-lg shadow-gold/20"
                  : "border-border active:border-gold/50 md:hover:border-gold/50"
              )}
            >
              <div className="aspect-square relative mb-1 md:mb-2 bg-background rounded-md overflow-hidden">
                <img
                  src={chain.data}
                  alt={chain.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs md:text-sm font-medium text-foreground truncate">
                {chain.name}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Navigation Controls - Mobile optimized */}
      {hasMultipleChains && (
        <div className="p-2 md:p-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={selectedChainIndex === null || selectedChainIndex === 0}
              className="flex-1 text-xs md:text-sm h-8 md:h-9"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={selectedChainIndex === null || selectedChainIndex === chains.length - 1}
              className="flex-1 text-xs md:text-sm h-8 md:h-9"
            >
              Next
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
