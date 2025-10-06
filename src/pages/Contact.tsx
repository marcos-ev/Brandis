import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contato</h1>
            <p className="text-muted-foreground text-lg">
              Entre em contato conosco. Estamos aqui para ajudar!
            </p>
          </div>

          <div className="bg-card border rounded-lg p-8 shadow-card">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-2">Email</h2>
                <p className="text-muted-foreground mb-4">
                  Envie-nos um email e responderemos o mais breve possível
                </p>
                <a 
                  href="mailto:marcosev@gmail.com"
                  className="text-primary hover:underline text-lg font-medium inline-flex items-center gap-2"
                >
                  marcosev@gmail.com
                </a>
              </div>

              <div className="pt-8 border-t w-full">
                <h3 className="text-lg font-semibold mb-4">Horário de Atendimento</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Segunda a Sexta: 9h às 18h</p>
                  <p>Tempo de resposta: até 24 horas úteis</p>
                </div>
              </div>

              <div className="pt-8 border-t w-full">
                <h3 className="text-lg font-semibold mb-4">Suporte Técnico</h3>
                <p className="text-muted-foreground mb-4">
                  Para questões técnicas, bugs ou problemas com a plataforma, 
                  por favor inclua o máximo de detalhes possível em seu email:
                </p>
                <ul className="text-left text-muted-foreground space-y-2 max-w-md mx-auto">
                  <li>• Descrição do problema</li>
                  <li>• Passos para reproduzir</li>
                  <li>• Capturas de tela (se aplicável)</li>
                  <li>• Navegador e sistema operacional</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
