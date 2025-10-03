import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para testar",
    features: [
      "3 gerações por mês",
      "3 logos + 9 mockups por geração",
      "Downloads em qualidade padrão",
      "Suporte por email"
    ],
    highlighted: false,
    priceId: null,
    planType: "free"
  },
  {
    name: "Pro",
    price: "R$ 29",
    period: "/mês",
    description: "Para designers profissionais",
    features: [
      "15 gerações por mês",
      "8 logos + 24 mockups por geração",
      "Downloads em HD",
      "Suporte prioritário",
      "Sem marca d'água",
      "API access básica"
    ],
    highlighted: true,
    priceId: "price_1SE7qvA6tacMfnHGnIt2XIS7",
    planType: "pro"
  },
  {
    name: "Premium",
    price: "R$ 79",
    period: "/mês",
    description: "Para agências e equipes",
    features: [
      "Gerações ilimitadas",
      "Logos e mockups ilimitados por geração",
      "Downloads em HD",
      "Suporte prioritário VIP",
      "Sem marca d'água",
      "API access completa",
      "White-label disponível",
      "Integração com ferramentas"
    ],
    highlighted: false,
    priceId: "price_1SE7rEA6tacMfnHGGscCJFnw",
    planType: "premium"
  }
];

export default function Pricing() {
  const { user, profile, subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string | null, planType: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (priceId === null) {
      toast({
        title: "Você já está no plano gratuito",
        description: "Escolha um plano pago para desbloquear mais recursos!",
      });
      return;
    }

    setLoading(priceId);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');

        // Refresh subscription after a delay to check if user completed payment
        setTimeout(() => {
          refreshSubscription();
        }, 3000);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar checkout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('portal');

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao abrir portal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planType: string) => {
    return profile?.plan_type === planType;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-subtle pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-3">
                Escolha seu <span className="gradient-text">plano</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Transforme briefings em marcas completas
              </p>
            </div>

            {/* Current Plan Info */}
            {profile && (
              <div className="mb-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Plano atual: <span className="font-semibold gradient-text capitalize">{profile.plan_type}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile.generations_used} de {profile.generations_limit} gerações utilizadas este mês
                </p>
                {subscription?.subscribed && (
                  <Button
                    onClick={handleManageSubscription}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    disabled={loading === 'portal'}
                  >
                    {loading === 'portal' ? "Carregando..." : "Gerenciar Assinatura"}
                  </Button>
                )}
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid gap-8 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent = isCurrentPlan(plan.planType);

                return (
                  <Card
                    key={plan.name}
                    className={`relative transition-smooth ${plan.highlighted
                      ? "border-primary shadow-elegant scale-105"
                      : "shadow-card"
                      } ${isCurrent ? "ring-2 ring-primary" : ""}`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary px-4 py-1 rounded-full text-xs font-semibold text-white">
                        Mais Popular
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute -top-4 right-4 bg-secondary px-3 py-1 rounded-full text-xs font-semibold">
                        Seu Plano
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold gradient-text">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleSubscribe(plan.priceId, plan.planType)}
                        disabled={loading === plan.priceId || isCurrent}
                        className={`w-full transition-smooth ${plan.highlighted
                          ? "gradient-primary hover:opacity-90"
                          : ""
                          }`}
                        variant={plan.highlighted ? "default" : "outline"}
                      >
                        {loading === plan.priceId
                          ? "Carregando..."
                          : isCurrent
                            ? "Plano Atual"
                            : plan.priceId
                              ? "Assinar Agora"
                              : "Começar Grátis"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}