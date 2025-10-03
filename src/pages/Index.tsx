import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";
import { BriefingInput } from "@/components/BriefingInput";
import { BrandResults } from "@/components/BrandResults";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Step = "hero" | "input" | "results";

interface BrandResults {
  logos?: string[];
  colors?: string[];
  typography?: { primary: string; secondary: string };
  mockups?: string[];
}

const Index = () => {
  const [step, setStep] = useState<Step>("hero");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BrandResults>({});
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setStep("input");
  };

  const handleSubmitBriefing = async (briefing: string) => {
    if (!user || !profile) {
      toast.error("Você precisa estar logado para gerar uma marca.");
      navigate("/auth");
      return;
    }

    // Check generation limits
    if (profile.generations_used >= profile.generations_limit) {
      toast.error("Você atingiu o limite de gerações do seu plano.");
      navigate("/pricing");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-brand', {
        body: { 
          briefing,
          variationsCount: profile.plan_type === 'premium' ? 5 : 
                          profile.plan_type === 'pro' ? 3 : 1
        }
      });

      if (error) {
        console.error('Error generating brand:', error);
        
        if (error.message?.includes('429')) {
          toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
        } else if (error.message?.includes('402')) {
          toast.error("Créditos insuficientes.");
        } else {
          toast.error("Erro ao gerar marca. Tente novamente.");
        }
        
        return;
      }

      if (data) {
        // Save generation to database
        await supabase.from('generations').insert({
          user_id: user.id,
          briefing,
          results: data
        });

        // Update usage count
        await supabase
          .from('profiles')
          .update({ generations_used: profile.generations_used + 1 })
          .eq('id', user.id);

        await refreshProfile();
        
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
    <>
      <Header />
      <div className="min-h-screen pt-16">
        {step === "hero" && <Hero onGetStarted={handleGetStarted} />}
        {step === "input" && (
          <BriefingInput onSubmit={handleSubmitBriefing} isLoading={isLoading} />
        )}
        {step === "results" && (
          <BrandResults results={results} onReset={handleReset} />
        )}
      </div>
    </>
  );
};

export default Index;
