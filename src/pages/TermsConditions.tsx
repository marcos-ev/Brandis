import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="text-4xl font-bold mb-4">Termos e Condições</h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: Janeiro de 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground">
              Ao acessar e usar o Brandis, você concorda em cumprir e estar vinculado a estes Termos e Condições. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground">
              O Brandis é uma plataforma de geração de identidade visual usando inteligência artificial. Fornecemos ferramentas para criação de logos, paletas de cores, tipografia e mockups baseados nas especificações fornecidas pelos usuários.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Contas de Usuário</h2>
            <p className="text-muted-foreground mb-4">
              Para usar nossos serviços, você deve:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Ter pelo menos 18 anos de idade</li>
              <li>Fornecer informações precisas e completas durante o registro</li>
              <li>Manter a segurança de sua conta e senha</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Planos e Pagamentos</h2>
            <p className="text-muted-foreground mb-4">
              Oferecemos diferentes planos de assinatura:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Gratuito:</strong> 3 gerações por mês para uso pessoal e testes</li>
              <li><strong>Pro:</strong> 50 gerações mensais com uso comercial permitido</li>
              <li><strong>Premium:</strong> Gerações ilimitadas com uso comercial permitido</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Os pagamentos são processados através do Stripe. As assinaturas são renovadas automaticamente até o cancelamento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Direitos de Propriedade Intelectual</h2>
            <p className="text-muted-foreground mb-4">
              Plano Gratuito:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Uso limitado a projetos pessoais e testes</li>
              <li>Não é permitido uso comercial</li>
            </ul>
            <p className="text-muted-foreground mt-4 mb-4">
              Planos Pagos (Pro e Premium):
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Você recebe licença comercial completa para todos os assets gerados</li>
              <li>Pode usar, modificar e aplicar em projetos comerciais</li>
              <li>A licença permanece válida mesmo após o cancelamento da assinatura</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Uso Aceitável</h2>
            <p className="text-muted-foreground mb-4">
              Você concorda em não:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Usar o serviço para criar conteúdo ilegal, ofensivo ou prejudicial</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Tentar acessar áreas restritas do sistema</li>
              <li>Usar o serviço de forma que possa sobrecarregar nossa infraestrutura</li>
              <li>Revender ou redistribuir nossos serviços sem autorização</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cancelamento e Reembolso</h2>
            <p className="text-muted-foreground">
              Você pode cancelar sua assinatura a qualquer momento. O acesso permanecerá até o fim do período pago. Oferecemos reembolso integral dentro de 7 dias após a compra, desde que você não tenha utilizado mais de 3 gerações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground">
              O serviço é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais resultantes do uso de nossos serviços.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Modificações dos Termos</h2>
            <p className="text-muted-foreground">
              Reservamos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas por email ou através da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável</h2>
            <p className="text-muted-foreground">
              Estes termos serão regidos e interpretados de acordo com as leis brasileiras.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
            <p className="text-muted-foreground">
              Para questões sobre estes Termos e Condições, entre em contato:{" "}
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

export default TermsConditions;
