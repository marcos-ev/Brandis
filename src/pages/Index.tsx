import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";
import { BriefingInput } from "@/components/BriefingInput";
import { BrandResults } from "@/components/BrandResults";
import { GenerationProgress } from "@/components/GenerationProgress";
import { AuthLoading } from "@/components/AuthLoading";
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
  const { user, profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logs para autenticação
  console.log('🔐 Estado de autenticação:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, plan_type: profile.plan_type } : null,
    loading
  });

  const handleGetStarted = () => {
    console.log('🚀 handleGetStarted chamado:', { user: !!user, loading });

    if (loading) {
      console.log('⏳ Ainda carregando autenticação...');
      return;
    }

    if (!user) {
      console.log('❌ Usuário não logado, redirecionando para auth');
      navigate("/auth");
      return;
    }

    console.log('✅ Usuário logado, indo para input');
    setStep("input");
  };

  const handleSubmitBriefing = async (briefing: string) => {
    console.log('🚀 Iniciando geração de marca...');
    console.log('🔐 Estado atual:', { user: !!user, profile: !!profile, loading });

    if (loading) {
      console.log('⏳ Ainda carregando autenticação...');
      toast.error("Aguarde o carregamento da autenticação.");
      return;
    }

    if (!user) {
      console.log('❌ Usuário não logado');
      toast.error("Você precisa estar logado para gerar uma marca.");
      navigate("/auth");
      return;
    }

    if (!profile) {
      console.log('❌ Perfil não carregado, criando perfil temporário...');

      // Criar perfil temporário para permitir continuar
      const tempProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        plan_type: 'free' as const,
        generations_used: 0,
        generations_limit: 3
      };

      console.log('🆕 Usando perfil temporário:', tempProfile);

      // Continuar com perfil temporário
      // Não retornar aqui, deixar continuar
    }

    // Check generation limits
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

    console.log('✅ Validações passaram, iniciando loading...');
    setIsLoading(true);

    try {
      console.log('📡 Chamando função Supabase...');

      // Adicionar timeout de 2 minutos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: A geração está demorando muito. Tente novamente.')), 120000);
      });

      const generatePromise = supabase.functions.invoke('generate-brand', {
        body: {
          briefing,
          variationsCount: currentProfile.plan_type === 'premium' ? 5 :
            currentProfile.plan_type === 'pro' ? 3 : 1
        }
      });

      const { data, error } = await Promise.race([generatePromise, timeoutPromise]);

      console.log('📡 Resposta recebida:', { data, error });

      if (error) {
        console.error('❌ Erro na geração:', error);

        if (error.message?.includes('Timeout')) {
          toast.error("A geração está demorando muito. Tente novamente.");
        } else if (error.message?.includes('429')) {
          toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
        } else if (error.message?.includes('402')) {
          toast.error("Créditos insuficientes.");
        } else {
          toast.error("Erro ao gerar marca. Tente novamente.");
        }

        return;
      }

      if (data) {
        console.log('✅ Dados recebidos, salvando no banco...');

        // Save generation to database
        await supabase.from('generations').insert({
          user_id: user.id,
          briefing,
          results: data
        });

        console.log('💾 Salvando contagem de uso...');
        // Update usage count
        await supabase
          .from('profiles')
          .update({ generations_used: currentProfile.generations_used + 1 })
          .eq('id', user.id);

        console.log('🔄 Atualizando perfil...');
        await refreshProfile();

        console.log('🎉 Finalizando com sucesso!');
        setResults(data);
        setStep("results");
        toast.success("Marca gerada com sucesso!");
      } else {
        console.log('⚠️ Nenhum dado recebido');
        toast.error("Nenhum dado foi retornado pela API.");
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      console.log('🏁 Finalizando loading...');
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

  // Se usuário está logado mas perfil não carregou, permitir continuar
  if (user && !profile) {
    console.log('⚠️ Usuário logado mas perfil não carregado, permitindo continuar...');
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16">
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
    </>
  );
};

export default Index;
