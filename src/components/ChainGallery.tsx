import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface Chain {
  name: string;
  data: string;
}

interface ChainGalleryProps {
  chains: Chain[];
  selectedChain: string | null;
  onSelectChain: (chainData: string) => void;
}

export const ChainGallery = ({ chains, selectedChain, onSelectChain }: ChainGalleryProps) => {
  if (chains.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No chains available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
          Select Chain
        </h3>
        {chains.map((chain, index) => (
          <button
            key={index}
            onClick={() => onSelectChain(chain.data)}
            className={cn(
              "w-full p-4 rounded-lg border-2 transition-all hover:scale-105",
              "bg-card hover:bg-secondary",
              selectedChain === chain.data
                ? "border-gold shadow-lg shadow-gold/20"
                : "border-border hover:border-gold/50"
            )}
          >
            <div className="aspect-square relative mb-2 bg-background rounded-md overflow-hidden">
              <img
                src={chain.data}
                alt={chain.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {chain.name}
            </p>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
