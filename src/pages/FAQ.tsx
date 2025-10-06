import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "O que é o Brandis?",
      answer: "Brandis é uma plataforma de geração de identidade visual completa usando inteligência artificial. Com apenas algumas informações sobre seu negócio, criamos logo, paleta de cores, tipografia e mockups profissionais."
    },
    {
      question: "Como funciona a geração de marca?",
      answer: "Você fornece informações sobre seu negócio, público-alvo e estilo desejado. Nossa IA analisa essas informações e gera uma identidade visual completa em poucos minutos, incluindo logo, cores, fontes e mockups de aplicação."
    },
    {
      question: "Quantas gerações posso fazer?",
      answer: "Isso depende do seu plano. O plano gratuito permite 3 gerações por mês. O plano Pro oferece 50 gerações mensais, e o plano Premium é ilimitado."
    },
    {
      question: "Posso editar os resultados gerados?",
      answer: "Atualmente, a plataforma gera resultados completos baseados nas suas especificações. Se não estiver satisfeito, você pode fazer uma nova geração ajustando suas preferências no briefing."
    },
    {
      question: "Em que formatos recebo os arquivos?",
      answer: "Todos os assets gerados (logos e mockups) são fornecidos em formato PNG de alta qualidade. As informações de cores e tipografia são exibidas na interface para fácil aplicação."
    },
    {
      question: "Posso usar as marcas geradas comercialmente?",
      answer: "Sim! Todos os assets gerados através dos planos pagos podem ser utilizados comercialmente sem restrições. O plano gratuito é apenas para testes e uso pessoal."
    },
    {
      question: "Como funciona o pagamento?",
      answer: "Utilizamos o Stripe para processamento seguro de pagamentos. Você pode assinar mensalmente e cancelar quando quiser. Aceitamos cartões de crédito e débito."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento através da página de Preços. Você continuará tendo acesso até o fim do período pago."
    },
    {
      question: "Há reembolso?",
      answer: "Oferecemos reembolso integral dentro de 7 dias após a compra, sem perguntas, desde que você não tenha utilizado mais de 3 gerações."
    },
    {
      question: "Preciso ter conhecimento em design?",
      answer: "Não! Nossa plataforma foi criada para que qualquer pessoa, mesmo sem conhecimento em design, possa criar uma identidade visual profissional."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
            <p className="text-muted-foreground text-lg">
              Encontre respostas para as dúvidas mais comuns sobre o Brandis
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
