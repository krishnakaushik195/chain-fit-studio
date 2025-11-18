import { Slider } from "./ui/slider";
import { Settings } from "lucide-react";

interface AdjustmentControlsProps {
  chainSize: number;
  verticalPosition: number;
  onChainSizeChange: (value: number) => void;
  onVerticalPositionChange: (value: number) => void;
}

export const AdjustmentControls = ({
  chainSize,
  verticalPosition,
  onChainSizeChange,
  onVerticalPositionChange,
}: AdjustmentControlsProps) => {
  return (
    <div className="p-4 bg-card border-t border-border space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">
          Adjustments
        </h3>
      </div>

      <div className="space-y-3">
        {/* Chain Size */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-foreground">
              Chain Size
            </label>
            <span className="text-sm text-muted-foreground">
              {chainSize.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[chainSize]}
            onValueChange={(values) => onChainSizeChange(values[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Vertical Position */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-foreground">
              Vertical Position
            </label>
            <span className="text-sm text-muted-foreground">
              {verticalPosition.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[verticalPosition]}
            onValueChange={(values) => onVerticalPositionChange(values[0])}
            min={-0.5}
            max={0.5}
            step={0.05}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
