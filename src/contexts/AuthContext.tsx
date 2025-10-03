import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan_type: 'free' | 'pro' | 'premium';
  generations_used: number;
  generations_limit: number;
}

interface SubscriptionInfo {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: SubscriptionInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PLANS = {
  pro: {
    price_id: "price_1SE7qvA6tacMfnHGnIt2XIS7",
    product_id: "prod_TASmJbItTFTpjE",
  },
  premium: {
    price_id: "price_1SE7rEA6tacMfnHGGscCJFnw",
    product_id: "prod_TASmf42D4966cH",
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createProfile = async (userId: string) => {
    console.log('🆕 Criando perfil para usuário:', userId);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: userData.user?.user_metadata?.full_name || null,
          plan_type: 'free',
          generations_used: 0,
          generations_limit: 3
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar perfil:', error);
        return;
      }

      if (data) {
        console.log('✅ Perfil criado com sucesso:', data);
        setProfile({
          ...data,
          plan_type: data.plan_type as 'free' | 'pro' | 'premium'
        });
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao criar perfil:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    console.log('👤 Buscando perfil para usuário:', userId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📡 Resposta da query:', { data, error });

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);

        // Se o perfil não existe, criar um automaticamente
        if (error.code === 'PGRST116') {
          console.log('🆕 Perfil não existe, criando automaticamente...');
          await createProfile(userId);
          return;
        }
        return;
      }

      if (data) {
        console.log('✅ Perfil carregado:', {
          id: data.id,
          email: data.email,
          plan_type: data.plan_type,
          generations_used: data.generations_used,
          generations_limit: data.generations_limit
        });

        setProfile({
          ...data,
          plan_type: data.plan_type as 'free' | 'pro' | 'premium'
        });
      } else {
        console.log('⚠️ Nenhum perfil encontrado');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar perfil:', error);
    }
  };

  const checkSubscription = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      setSubscription(data);

      // Update profile with subscription info
      if (data.subscribed && profile) {
        const planType = data.product_id === PLANS.pro.product_id ? 'pro' :
          data.product_id === PLANS.premium.product_id ? 'premium' : 'free';

        const generationsLimit = planType === 'premium' ? 999999 :
          planType === 'pro' ? 30 : 3;

        await supabase
          .from('profiles')
          .update({
            plan_type: planType,
            generations_limit: generationsLimit
          })
          .eq('id', profile.id);

        await fetchProfile(profile.id);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔄 Auth state change:', event, currentSession?.user?.email);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('👤 Usuário logado, buscando perfil...');

          // Adicionar timeout para evitar loading infinito
          const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout ao carregar perfil')), 10000);
          });

          try {
            await Promise.race([fetchProfile(currentSession.user.id), timeoutPromise]);
          } catch (error) {
            console.error('⏰ Timeout ou erro ao carregar perfil:', error);
            // Continuar mesmo com erro para não travar a aplicação
          }
        } else {
          console.log('👤 Usuário deslogado, limpando estados...');
          setProfile(null);
          setSubscription(null);
        }

        setLoading(false);
        console.log('✅ Loading finalizado');
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        console.log('🔄 Sessão inicial encontrada, buscando perfil...');

        // Adicionar timeout para evitar loading infinito
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao carregar perfil')), 10000);
        });

        try {
          await Promise.race([fetchProfile(currentSession.user.id), timeoutPromise]);
        } catch (error) {
          console.error('⏰ Timeout ou erro ao carregar perfil na inicialização:', error);
          // Continuar mesmo com erro para não travar a aplicação
        }
      }

      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && profile) {
      checkSubscription();
    }
  }, [user, profile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Bem-vindo ao Brandis!",
      });
    }

    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Iniciando logout...');

    try {
      await supabase.auth.signOut();
      console.log('✅ Supabase signOut executado');

      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);

      console.log('✅ Estados limpos');

      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        subscription,
        loading,
        signIn,
        signUp,
        signOut,
        refreshSubscription,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};