import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { ColorPaletteCard } from "./brand/ColorPaletteCard";
import { LogoCard } from "./brand/LogoCard";
import { TypographyCard } from "./brand/TypographyCard";
import { MockupsCard } from "./brand/MockupsCard";
import JSZip from "jszip";
import { toast } from "sonner";

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
  const handleDownloadAll = async () => {
    try {
      toast.info("Preparando download...");
      const zip = new JSZip();

      // Criar pasta de imagens
      const imagesFolder = zip.folder("imagens");

      // Baixar logos
      if (results.logos) {
        for (let i = 0; i < results.logos.length; i++) {
          const response = await fetch(results.logos[i]);
          const blob = await response.blob();
          imagesFolder?.file(`logo-${i + 1}.png`, blob);
        }
      }

      // Baixar mockups
      if (results.mockups) {
        for (let i = 0; i < results.mockups.length; i++) {
          const response = await fetch(results.mockups[i]);
          const blob = await response.blob();
          imagesFolder?.file(`mockup-${i + 1}.png`, blob);
        }
      }

      // Criar arquivo TXT com informações
      let infoText = "=== INFORMAÇÕES DA MARCA ===\n\n";
      
      if (results.colors) {
        infoText += "PALETA DE CORES:\n";
        results.colors.forEach((color, index) => {
          infoText += `Cor ${index + 1}: ${color}\n`;
        });
        infoText += "\n";
      }

      if (results.typography) {
        infoText += "TIPOGRAFIA:\n";
        infoText += `Fonte Principal: ${results.typography.primary}\n`;
        infoText += `Fonte Secundária: ${results.typography.secondary}\n`;
        infoText += "\n";
      }

      infoText += "DATA DE CRIAÇÃO:\n";
      infoText += new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      zip.file("informacoes-da-marca.txt", infoText);

      // Gerar e baixar o ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `marca-completa-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Download concluído!");
    } catch (error) {
      console.error("Erro ao baixar:", error);
      toast.error("Erro ao preparar o download");
    }
  };

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
              onClick={handleDownloadAll}
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
