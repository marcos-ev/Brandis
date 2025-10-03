import { Card } from "@/components/ui/card";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LogoCardProps {
  logos: string[];
}

export const LogoCard = ({ logos }: LogoCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextLogo = () => {
    setCurrentIndex((prev) => (prev + 1) % logos.length);
  };

  const prevLogo = () => {
    setCurrentIndex((prev) => (prev - 1 + logos.length) % logos.length);
  };

  const downloadLogo = () => {
    const link = document.createElement('a');
    link.href = logos[currentIndex];
    link.download = `logo-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-smooth">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Logos</h3>
          {logos.length > 1 && (
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} de {logos.length}
            </p>
          )}
        </div>
        <Button
          onClick={downloadLogo}
          variant="ghost"
          size="sm"
          className="hover:bg-secondary transition-smooth"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar
        </Button>
      </div>
      
      <div className="relative aspect-square rounded-xl bg-secondary/50 flex items-center justify-center p-8">
        <img
          src={logos[currentIndex]}
          alt={`Logo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {logos.length > 1 && (
          <>
            <Button
              onClick={prevLogo}
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-elegant"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={nextLogo}
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-elegant"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {logos.length > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          {logos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </Card>
  );
};