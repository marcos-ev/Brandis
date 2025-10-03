import { Sparkles } from "lucide-react";

export const AuthLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-card">
          <Sparkles className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm font-medium">Carregando autenticação</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-muted-foreground">Verificando sua sessão...</p>
        </div>
      </div>
    </div>
  );
};
