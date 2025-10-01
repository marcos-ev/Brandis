import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ColorPaletteCardProps {
  colors: string[];
}

export const ColorPaletteCard = ({ colors }: ColorPaletteCardProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyColor = (color: string, index: number) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-smooth">
      <h3 className="text-xl font-semibold mb-4">Paleta de Cores</h3>
      
      <div className="space-y-3">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth"
          >
            <div
              className="w-12 h-12 rounded-lg shadow-md"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <p className="font-mono text-sm font-medium">{color}</p>
              <p className="text-xs text-muted-foreground">
                {index === 0 ? "Principal" : index === 1 ? "Secundária" : `Cor ${index + 1}`}
              </p>
            </div>
            <button
              onClick={() => copyColor(color, index)}
              className="p-2 rounded-md hover:bg-background transition-smooth"
            >
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
