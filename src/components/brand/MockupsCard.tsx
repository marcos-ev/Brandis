import { Card } from "@/components/ui/card";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MockupsCardProps {
  mockups: string[];
}

export const MockupsCard = ({ mockups }: MockupsCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextMockup = () => {
    setCurrentIndex((prev) => (prev + 1) % mockups.length);
  };

  const prevMockup = () => {
    setCurrentIndex((prev) => (prev - 1 + mockups.length) % mockups.length);
  };

  const downloadMockup = () => {
    const link = document.createElement('a');
    link.href = mockups[currentIndex];
    link.download = `mockup-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-smooth md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Mockups</h3>
        <Button
          onClick={downloadMockup}
          variant="ghost"
          size="sm"
          className="hover:bg-secondary transition-smooth"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar
        </Button>
      </div>
      
      <div className="relative aspect-video rounded-xl bg-secondary/50 overflow-hidden">
        <img
          src={mockups[currentIndex]}
          alt={`Mockup ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {mockups.length > 1 && (
          <>
            <button
              onClick={prevMockup}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-smooth shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextMockup}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-smooth shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {mockups.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-smooth ${
                    index === currentIndex ? "bg-primary w-6" : "bg-background/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
