import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BriefingInputProps {
  onSubmit: (briefing: string) => void;
  isLoading: boolean;
}

export const BriefingInput = ({ onSubmit, isLoading }: BriefingInputProps) => {
  const [briefing, setBriefing] = useState("");
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (briefing.trim()) {
      onSubmit(briefing);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-card mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Passo 1</span>
          </div>
          <h2 className="text-4xl font-bold mb-3">
            {t('briefing.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('briefing.subtitle')}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
          <Textarea
            placeholder={t('briefing.placeholder')}
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            className="min-h-[300px] resize-none text-base border-border focus:ring-primary"
            disabled={isLoading}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!briefing.trim() || isLoading}
              size="lg"
              className="gradient-primary hover:opacity-90 shadow-elegant transition-smooth"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  {t('progress.generating')}
                </>
              ) : (
                <>
                  {t('briefing.generate')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 Dica: Inclua informações sobre público-alvo, valores, estilo e cores preferidas</p>
        </div>
      </div>
    </div>
  );
};
