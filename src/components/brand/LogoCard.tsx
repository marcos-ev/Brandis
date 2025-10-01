import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoCardProps {
  logoUrl: string;
}

export const LogoCard = ({ logoUrl }: LogoCardProps) => {
  const downloadLogo = () => {
    const link = document.createElement('a');
    link.href = logoUrl;
    link.download = 'logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-smooth">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Logo</h3>
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
      
      <div className="aspect-square rounded-xl bg-secondary/50 flex items-center justify-center p-8">
        <img
          src={logoUrl}
          alt="Logo gerado"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </Card>
  );
};
