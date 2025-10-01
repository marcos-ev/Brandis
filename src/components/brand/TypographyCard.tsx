import { Card } from "@/components/ui/card";
import { Type } from "lucide-react";

interface TypographyCardProps {
  primary: string;
  secondary: string;
}

export const TypographyCard = ({ primary, secondary }: TypographyCardProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-smooth">
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Tipografia</h3>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-secondary/50">
          <p className="text-sm text-muted-foreground mb-2">Fonte Principal</p>
          <p className="text-3xl font-bold" style={{ fontFamily: primary }}>
            {primary}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Para títulos e destaques
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-secondary/50">
          <p className="text-sm text-muted-foreground mb-2">Fonte Secundária</p>
          <p className="text-2xl" style={{ fontFamily: secondary }}>
            {secondary}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Para corpo de texto e parágrafos
          </p>
        </div>
      </div>
    </Card>
  );
};
