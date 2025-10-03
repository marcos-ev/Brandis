import { useState, useEffect } from "react";
import { Sparkles, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GenerationProgressProps {
  isLoading: boolean;
}

export const GenerationProgress = ({ isLoading }: GenerationProgressProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { id: 0, title: "Analisando briefing", description: "Processando informações do cliente" },
    { id: 1, title: "Criando estratégia", description: "Definindo cores e tipografia" },
    { id: 2, title: "Gerando logos", description: "Criando variações de logo" },
    { id: 3, title: "Criando mockups", description: "Gerando apresentações visuais" },
    { id: 4, title: "Finalizando", description: "Preparando resultados" }
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          return prev; // Mantém no último passo
        }
        return next;
      });

      setProgress(prev => {
        const next = prev + 20;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, 3000); // Muda de passo a cada 3 segundos

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-card mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm font-medium">Gerando sua marca</span>
          </div>
          <h2 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Criando</span> sua marca única
          </h2>
          <p className="text-muted-foreground">
            Isso pode levar alguns minutos. Por favor, aguarde...
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-8 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-primary/10 border border-primary/20'
                    : isCompleted
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-muted/30'
                    }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isActive ? (
                      <Clock className="w-4 h-4 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-muted-foreground'
                      }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${isActive ? 'text-primary/80' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading Animation */}
          <div className="text-center pt-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Processando...</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>⏱️ Tempo estimado: 1-2 minutos</p>
        </div>
      </div>
    </div>
  );
};
