import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { ColorPaletteCard } from "./brand/ColorPaletteCard";
import { LogoCard } from "./brand/LogoCard";
import { TypographyCard } from "./brand/TypographyCard";
import { MockupsCard } from "./brand/MockupsCard";

interface BrandResultsProps {
  results: {
    logos?: string[];
    colors?: string[];
    typography?: { primary: string; secondary: string };
    mockups?: string[];
  };
  onReset: () => void;
}

export const BrandResults = ({ results, onReset }: BrandResultsProps) => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">
            Sua <span className="gradient-text">marca</span> está pronta!
          </h2>
          <p className="text-muted-foreground mb-6">
            Explore os elementos gerados e faça o download quando estiver satisfeito
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onReset}
              variant="outline"
              className="border-border hover:bg-secondary transition-smooth"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Novo Briefing
            </Button>
            <Button
              className="gradient-primary hover:opacity-90 shadow-elegant transition-smooth"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Tudo
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {results.logos && <LogoCard logos={results.logos} />}
          
          {results.colors && <ColorPaletteCard colors={results.colors} />}
          
          {results.typography && (
            <TypographyCard 
              primary={results.typography.primary}
              secondary={results.typography.secondary}
            />
          )}
          
          {results.mockups && <MockupsCard mockups={results.mockups} />}
        </div>
      </div>
    </div>
  );
};
