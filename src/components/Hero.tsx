import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-card mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{t('hero.badge')}</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in animation-delay-200">
          {t('hero.subtitle')}
        </p>

        {/* CTA Button */}
        <Button 
          onClick={onGetStarted}
          size="lg" 
          className="gradient-primary hover:opacity-90 shadow-elegant transition-smooth text-lg px-8 py-6 animate-fade-in animation-delay-400"
        >
          {t('hero.cta')}
        </Button>

        {/* Features list */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in animation-delay-600">
          {[
            { icon: "🎨", label: t('hero.features.logos') },
            { icon: "🎨", label: t('hero.features.colors') },
            { icon: "✍️", label: t('hero.features.typography') },
            { icon: "📱", label: t('hero.features.mockups') },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-card border border-border shadow-card transition-smooth hover:shadow-elegant hover:scale-105"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="text-sm font-medium">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};
