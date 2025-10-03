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
        console.error('Error creating profile:', error);
        return;
      }

      if (data) {
        setProfile({
          ...data,
          plan_type: data.plan_type as 'free' | 'pro' | 'premium'
        });
      }
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);

        // Se o perfil não existe, criar um automaticamente
        if (error.code === 'PGRST116') {
          await createProfile(userId);
          return;
        }
        return;
      }

      if (data) {
        setProfile({
          ...data,
          plan_type: data.plan_type as 'free' | 'pro' | 'premium'
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
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
          planType === 'pro' ? 15 : 3;

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
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Adicionar timeout para evitar loading infinito
          const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout loading profile')), 5000);
          });

          try {
            await Promise.race([fetchProfile(currentSession.user.id), timeoutPromise]);
          } catch (error) {
            console.error('Timeout or error loading profile:', error);
            // Continuar mesmo com erro para não travar a aplicação
          }
        } else {
          setProfile(null);
          setSubscription(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Adicionar timeout para evitar loading infinito
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout loading profile')), 5000);
        });

        try {
          await Promise.race([fetchProfile(currentSession.user.id), timeoutPromise]);
        } catch (error) {
          console.error('Timeout or error loading profile on init:', error);
          // Continuar mesmo com erro para não travar a aplicação
        }
      }

      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && profile) {
      // Temporariamente desabilitado devido a erro 500
      // checkSubscription();
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
    console.log('🔐 AuthContext: Iniciando signOut...');
    try {
      console.log('🔐 AuthContext: Chamando supabase.auth.signOut()...');
      await supabase.auth.signOut();
      console.log('🔐 AuthContext: Supabase signOut executado');

      console.log('🔐 AuthContext: Limpando estados...');
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      console.log('🔐 AuthContext: Estados limpos');

      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      console.log('🔐 AuthContext: Toast exibido');
    } catch (error) {
      console.error('❌ AuthContext: Erro durante logout:', error);
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