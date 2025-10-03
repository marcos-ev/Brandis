import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, CreditCard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="text-2xl font-bold gradient-text cursor-pointer"
          onClick={() => navigate("/")}
        >
          Brandis
        </div>

        <nav className="flex items-center gap-4">
          <Button 
            variant="ghost"
            onClick={() => navigate("/pricing")}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Planos
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Plano {profile?.plan_type}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/pricing")}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver planos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate("/auth")}
              className="gradient-primary hover:opacity-90 transition-smooth"
            >
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};