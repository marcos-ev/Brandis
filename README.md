# 📦 Projeto Brandis

Este é um projeto frontend moderno desenvolvido com:

* ⚡ [Vite](https://vitejs.dev/)
* ⚛️ [React](https://react.dev/)
* 🟦 [TypeScript](https://www.typescriptlang.org/)
* 🎨 [Tailwind CSS](https://tailwindcss.com/)
* 🧩 [shadcn/ui](https://ui.shadcn.com/)

---

## 🚀 Como rodar o projeto localmente

### ✅ Pré-requisitos

* [Node.js](https://nodejs.org/) instalado (recomendado via [nvm](https://github.com/nvm-sh/nvm))
* npm (já incluso no Node.js)

### ▶️ Passo a passo

1. **Clone o repositório**

   ```bash
   git clone <SEU_REPOSITORIO_URL>
   ```

2. **Acesse o diretório do projeto**

   ```bash
   cd <NOME_DO_PROJETO>
   ```

3. **Instale as dependências**

   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

5. Acesse o projeto no navegador em:

   ```
   http://localhost:5173
   ```

---

## 📂 Estrutura básica

```
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Páginas principais
│   ├── styles/       # Estilos globais
│   └── main.tsx      # Arquivo principal de inicialização
├── public/           # Arquivos estáticos
├── package.json      # Configurações do projeto
└── vite.config.ts    # Configuração do Vite
```

---

## 📦 Build para produção

```bash
npm run build
```

Os arquivos finais serão gerados na pasta `dist/`.

---

## 🌐 Deploy

O deploy pode ser feito em qualquer serviço que suporte aplicações estáticas, como:

* [Vercel](https://vercel.com/)
* [Netlify](https://www.netlify.com/)
* [GitHub Pages](https://pages.github.com/)

---
