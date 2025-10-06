# 🎨 Brandis - Gerador de Marcas com IA

Transforme briefings em marcas completas usando inteligência artificial. O Brandis é uma ferramenta revolucionária que automatiza o processo de criação de identidades visuais, gerando logos, paletas de cores, tipografia e mockups profissionais a partir de um simples briefing do cliente.

## ✨ Funcionalidades

### 🎯 Geração Automática de Marcas
- **Logos únicos**: Múltiplas variações de logos profissionais e modernos
- **Paletas de cores**: 5 cores harmoniosas estrategicamente escolhidas
- **Tipografia**: Fontes primárias e secundárias complementares do Google Fonts
- **Mockups realistas**: Apresentações visuais profissionais para demonstração

### 🚀 Recursos Avançados
- **Análise estratégica com IA**: Google Gemini Pro analisa o briefing e cria estratégia de marca
- **Geração de imagens**: Google Gemini Flash gera logos e mockups de alta qualidade
- **Cache inteligente**: Sistema de cache que evita regenerações desnecessárias
- **Rate limiting**: Controle de uso para otimizar performance
- **Fila de geração**: Sistema de filas para gerenciar múltiplas requisições
- **Retry automático**: Tentativas automáticas em caso de falha
- **Sistema de planos**: Gratuito, Pro e Premium com diferentes limites

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca principal para interface
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Vite** - Build tool rápido e moderno
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface modernos
- **React Router** - Roteamento client-side
- **React Hook Form** - Gerenciamento de formulários
- **TanStack Query** - Gerenciamento de estado servidor
- **Zod** - Validação de schemas

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service
  - Edge Functions (Deno)
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
- **Google Gemini AI** - Inteligência artificial
  - Gemini 2.5 Pro (análise estratégica)
  - Gemini 2.5 Flash (geração de imagens)

### Pagamentos
- **Stripe** - Processamento de pagamentos
- **Webhooks** - Sincronização de assinaturas

### Deploy
- **Vercel/Netlify** - Hospedagem de aplicação estática
- **Supabase Edge Functions** - Serverless functions

## 🏗️ Arquitetura

### Fluxo de Geração de Marca

1. **Análise do Briefing**
   - Usuário insere briefing no frontend
   - Sistema verifica rate limits e cache
   - Briefing é enviado para Edge Function

2. **Estratégia de Marca (Gemini Pro)**
   - IA analisa o briefing
   - Gera estratégia com cores, tipografia e prompts
   - Retorna JSON estruturado

3. **Geração de Logos (Gemini Flash)**
   - Cria múltiplas variações de logos
   - Aplica cores da estratégia
   - Gera imagens de alta qualidade

4. **Geração de Mockups (Gemini Flash)**
   - Cria mockups realistas
   - Integra logos gerados
   - Aplica tipografia e cores consistentes

5. **Cache e Armazenamento**
   - Salva resultado no cache inteligente
   - Armazena no banco de dados
   - Atualiza contadores de uso

### Sistema de Cache Inteligente

```typescript
// Verifica cache antes de gerar
const cachedResult = getCached(briefing, user.id);
if (cachedResult) {
  return cachedResult.data;
}

// Oferece resultados similares
const similarResults = findSimilar(briefing, user.id, 0.8);
```

### Rate Limiting

```typescript
// Controle de uso por usuário
const rateLimitCheck = checkLimit(1, 60000); // 1 geração por minuto
if (!rateLimitCheck.canProceed) {
  throw new Error('Rate limit exceeded');
}
```

## 📦 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── brand/           # Componentes específicos de marca
│   │   ├── ColorPaletteCard.tsx
│   │   ├── LogoCard.tsx
│   │   ├── TypographyCard.tsx
│   │   └── MockupsCard.tsx
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── BriefingInput.tsx
│   ├── BrandResults.tsx
│   └── GenerationProgress.tsx
├── pages/               # Páginas da aplicação
│   ├── Index.tsx        # Página principal
│   ├── Auth.tsx         # Autenticação
│   ├── Pricing.tsx      # Planos e preços
│   ├── FAQ.tsx          # Perguntas frequentes
│   └── Contact.tsx      # Contato
├── contexts/            # Contextos React
│   └── AuthContext.tsx  # Gerenciamento de autenticação
├── hooks/               # Custom hooks
├── integrations/        # Integrações externas
│   └── supabase/        # Cliente Supabase
├── utils/               # Utilitários
│   ├── generationQueue.ts    # Fila de geração
│   ├── rateLimiter.ts        # Controle de rate limiting
│   ├── retryHandler.ts       # Sistema de retry
│   └── smartCache.ts         # Cache inteligente
└── lib/                 # Bibliotecas auxiliares
    └── utils.ts

supabase/
├── functions/           # Edge Functions
│   └── generate-brand/  # Função principal de geração
│       └── index.ts
└── migrations/          # Migrações do banco
```

## 🚀 Como Executar Localmente

### ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ instalado
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Conta no [Supabase](https://supabase.com/)
- Chave da API do [Google Gemini](https://ai.google.dev/)

### ▶️ Configuração

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd brief-to-behold
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   LOVABLE_API_KEY=sua_chave_do_google_gemini
   ```

4. **Configure o Supabase**
   
   - Crie um novo projeto no Supabase
   - Execute as migrações do banco de dados
   - Configure as Edge Functions
   - Configure as políticas de RLS (Row Level Security)

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação**
   ```
   http://localhost:8080
   ```

## 🗄️ Configuração do Banco de Dados

### Tabelas Principais

```sql
-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'premium')),
  generations_used INTEGER DEFAULT 0,
  generations_limit INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de gerações
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  briefing TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Políticas RLS

```sql
-- Política para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para generations
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🔧 Edge Functions

### generate-brand

Função principal que processa briefings e gera marcas completas.

**Endpoint**: `POST /functions/v1/generate-brand`

**Body**:
```json
{
  "briefing": "string",
  "variationsCount": "number (opcional, padrão: 1)"
}
```

**Response**:
```json
{
  "logos": ["url1", "url2", ...],
  "colors": ["#hex1", "#hex2", ...],
  "typography": {
    "primary": "Font Name",
    "secondary": "Font Name"
  },
  "mockups": ["url1", "url2", ...]
}
```


## 🔒 Segurança

- **Autenticação**: Supabase Auth com JWT
- **Autorização**: Row Level Security (RLS)
- **Rate Limiting**: Controle de uso por usuário
- **Validação**: Zod schemas para validação de dados
- **CORS**: Configuração adequada para Edge Functions
- **Sanitização**: Limpeza de inputs do usuário

## 📊 Monitoramento e Logs

- **Console logs** estruturados nas Edge Functions
- **Error tracking** com try/catch abrangente
- **Performance monitoring** com timeouts
- **Usage tracking** no banco de dados

## 🚀 Deploy

### Frontend (Vercel/Netlify)

1. **Build da aplicação**
   ```bash
   npm run build
   ```

2. **Configure as variáveis de ambiente** no painel do Vercel/Netlify

3. **Deploy automático** via Git

### Backend (Supabase)

1. **Deploy das Edge Functions**
   ```bash
   supabase functions deploy generate-brand
   ```

2. **Configure as variáveis de ambiente** no painel do Supabase

3. **Execute as migrações** do banco de dados

## 🧪 Testes

```bash
# Lint
npm run lint

# Build
npm run build

# Preview
npm run preview
```

## 📈 Performance

- **Cache inteligente** reduz regenerações desnecessárias
- **Rate limiting** previne sobrecarga do sistema
- **Fila de geração** gerencia requisições de forma eficiente
- **Retry automático** aumenta taxa de sucesso
- **Lazy loading** de componentes
- **Otimização de imagens** com compressão

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Email**: marcosev@gmail.com


## 🙏 Agradecimentos

- [Supabase](https://supabase.com/) pela infraestrutura
- [Google Gemini](https://ai.google.dev/) pela IA
- [shadcn/ui](https://ui.shadcn.com/) pelos componentes
- [Tailwind CSS](https://tailwindcss.com/) pelo styling
- [Vite](https://vitejs.dev/) pelo build tool

---

**Desenvolvido com ❤️ para revolucionar a criação de marcas**
