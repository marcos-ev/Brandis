import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BriefingInput } from "@/components/BriefingInput";
import { BrandResults } from "@/components/BrandResults";
import { GenerationProgress } from "@/components/GenerationProgress";
import { AuthLoading } from "@/components/AuthLoading";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRateLimit } from "@/utils/rateLimiter";
import { useGenerationQueue } from "@/utils/generationQueue";
import { useSmartCache } from "@/utils/smartCache";
import { useRetryHandler } from "@/utils/retryHandler";

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
  const { user, profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Sistemas inteligentes
  const { checkLimit } = useRateLimit(user?.id || null);
  const { addJob, getStatus } = useGenerationQueue();
  const { get: getCached, set: setCached, findSimilar } = useSmartCache();
  const { executeWithRetry, executeWithTimeout } = useRetryHandler();


  const handleGetStarted = () => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    setStep("input");
  };

  const handleSubmitBriefing = async (briefing: string) => {
    if (loading) {
      toast.error("Aguarde o carregamento da autenticação.");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para gerar uma marca.");
      navigate("/auth");
      return;
    }

    // 🚀 1. RATE LIMITING - Verifica se pode gerar
    const rateLimitCheck = checkLimit(1, 60000); // 1 geração por minuto
    if (!rateLimitCheck.canProceed) {
      toast.error(`Aguarde ${rateLimitCheck.retryAfter} segundos antes de gerar novamente.`);
      return;
    }

    // 🗄️ 2. CACHE - Verifica se já existe resultado similar
    const cachedResult = getCached(briefing, user.id);
    if (cachedResult) {
      toast.success("Resultado encontrado no cache!");
      setResults(cachedResult.data);
      setStep("results");
      return;
    }

    // 🔍 3. SIMILAR RESULTS - Oferece resultados similares
    const similarResults = findSimilar(briefing, user.id, 0.8);
    if (similarResults.length > 0) {
      const shouldUseSimilar = confirm(
        `Encontramos ${similarResults.length} resultado(s) similar(es). Deseja usar um deles ou gerar um novo?`
      );

      if (shouldUseSimilar) {
        const bestMatch = similarResults[0];
        setResults(bestMatch.data);
        setStep("results");
        toast.success("Usando resultado similar do cache!");
        return;
      }
    }

    // 📊 4. PROFILE & LIMITS - Verifica limites de geração
    const currentProfile = profile || {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      plan_type: 'free' as const,
      generations_used: 0,
      generations_limit: 3
    };

    if (currentProfile.generations_used >= currentProfile.generations_limit) {
      toast.error("Você atingiu o limite de gerações do seu plano.");
      navigate("/pricing");
      return;
    }

    // 🎯 5. QUEUE STATUS - Verifica status da fila
    const queueStatus = getStatus();
    if (queueStatus.isProcessing) {
      toast.info(`Fila ativa: ${queueStatus.queueLength} gerações na frente. Aguarde...`);
    }

    setIsLoading(true);

    try {
      // 🚀 6. INTELLIGENT GENERATION - Usa retry + timeout + queue
      const result = await executeWithTimeout(
        async () => {
          // Adiciona à fila inteligente
          const jobId = await addJob(user.id, briefing, 'normal');

          // Executa com retry inteligente
          return await executeWithRetry(
            async () => {
              const { data, error } = await supabase.functions.invoke('generate-brand', {
                body: {
                  briefing,
                  variationsCount: currentProfile.plan_type === 'premium' ? 999 :
                    currentProfile.plan_type === 'pro' ? 8 : 3
                }
              });

              if (error) throw error;
              return data;
            },
            `generate-brand-${user.id}`,
            { maxRetries: 3, baseDelay: 2000 }
          );
        },
        120000, // 2 minutos timeout
        `generation-${user.id}`
      );

      if (result) {
        // 💾 7. CACHE RESULT - Salva no cache inteligente
        setCached(briefing, user.id, result);

        // 💾 8. DATABASE - Salva no banco
        await supabase.from('generations').insert({
          user_id: user.id,
          briefing,
          results: result
        });

        // 📊 9. UPDATE USAGE - Atualiza contador
        await supabase
          .from('profiles')
          .update({ generations_used: currentProfile.generations_used + 1 })
          .eq('id', user.id);

        await refreshProfile();

        setResults(result);
        setStep("results");
        toast.success("Marca gerada com sucesso!");
      } else {
        toast.error("Nenhum dado foi retornado pela API.");
      }
    } catch (error: any) {
      console.error('Generation error:', error);

      // 🎯 10. SMART ERROR HANDLING
      if (error.message?.includes('Circuit breaker')) {
        toast.error("Serviço temporariamente indisponível. Tente novamente em alguns minutos.");
      } else if (error.message?.includes('timeout')) {
        toast.error("A geração está demorando muito. Tente novamente.");
      } else if (error.message?.includes('429')) {
        toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else if (error.message?.includes('402')) {
        toast.error("Créditos insuficientes.");
      } else if (error.message?.includes('All retry attempts failed')) {
        toast.error("Falha após múltiplas tentativas. Tente novamente mais tarde.");
      } else {
        toast.error("Erro ao gerar marca. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setResults({});
  };

  // Mostrar loading de autenticação se ainda estiver carregando
  if (loading) {
    return <AuthLoading />;
  }


  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 flex flex-col">
        <div className="flex-1">
          {step === "hero" && <Hero onGetStarted={handleGetStarted} />}
          {step === "input" && !isLoading && (
            <BriefingInput onSubmit={handleSubmitBriefing} isLoading={isLoading} />
          )}
          {step === "input" && isLoading && (
            <GenerationProgress isLoading={isLoading} />
          )}
          {step === "results" && (
            <BrandResults results={results} onReset={handleReset} />
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Index;
