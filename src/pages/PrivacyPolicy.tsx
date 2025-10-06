import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: Janeiro de 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Informações que Coletamos</h2>
            <p className="text-muted-foreground mb-4">
              Coletamos informações que você nos fornece diretamente ao:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Criar uma conta no Brandis</li>
              <li>Utilizar nossos serviços de geração de marca</li>
              <li>Entrar em contato com nosso suporte</li>
              <li>Assinar nossa newsletter (se aplicável)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Como Usamos Suas Informações</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos as informações coletadas para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar transações e enviar notificações relacionadas</li>
              <li>Responder a comentários, perguntas e solicitações de suporte</li>
              <li>Enviar informações técnicas, atualizações e mensagens administrativas</li>
              <li>Monitorar e analisar tendências, uso e atividades</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Compartilhamento de Informações</h2>
            <p className="text-muted-foreground mb-4">
              Não vendemos suas informações pessoais. Podemos compartilhar suas informações nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Com fornecedores de serviços que nos auxiliam na operação da plataforma</li>
              <li>Para cumprir obrigações legais</li>
              <li>Para proteger e defender nossos direitos e propriedade</li>
              <li>Com seu consentimento ou sob sua direção</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Segurança dos Dados</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos</h2>
            <p className="text-muted-foreground mb-4">
              Você tem o direito de:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados imprecisos</li>
              <li>Solicitar a exclusão de suas informações</li>
              <li>Opor-se ao processamento de seus dados</li>
              <li>Solicitar a portabilidade de dados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e auxiliar em nossos esforços de marketing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Alterações nesta Política</h2>
            <p className="text-muted-foreground">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova política nesta página e atualizando a data de "última atualização".
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
            <p className="text-muted-foreground">
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em:{" "}
              <a href="mailto:marcosev@gmail.com" className="text-primary hover:underline">
                marcosev@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
