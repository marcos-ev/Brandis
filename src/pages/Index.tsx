import { useState } from "react";
import { Hero } from "@/components/Hero";
import { BriefingInput } from "@/components/BriefingInput";
import { BrandResults } from "@/components/BrandResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "hero" | "input" | "results";

interface BrandResults {
  logo?: string;
  colors?: string[];
  typography?: { primary: string; secondary: string };
  mockups?: string[];
}

const Index = () => {
  const [step, setStep] = useState<Step>("hero");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BrandResults>({});

  const handleGetStarted = () => {
    setStep("input");
  };

  const handleSubmitBriefing = async (briefing: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-brand', {
        body: { briefing }
      });

      if (error) {
        console.error('Error generating brand:', error);
        
        if (error.message?.includes('429')) {
          toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
        } else if (error.message?.includes('402')) {
          toast.error("Créditos insuficientes. Adicione créditos em Settings → Workspace → Usage.");
        } else {
          toast.error("Erro ao gerar marca. Tente novamente.");
        }
        
        return;
      }

      if (data) {
        setResults(data);
        setStep("results");
        toast.success("Marca gerada com sucesso!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setResults({});
  };

  return (
    <div className="min-h-screen">
      {step === "hero" && <Hero onGetStarted={handleGetStarted} />}
      {step === "input" && (
        <BriefingInput onSubmit={handleSubmitBriefing} isLoading={isLoading} />
      )}
      {step === "results" && (
        <BrandResults results={results} onReset={handleReset} />
      )}
    </div>
  );
};

export default Index;
