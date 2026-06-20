# F1 Fantasy Game

Um aplicativo web para montar times de fantasia inspirados na Fórmula 1. Cada participante escolhe pilotos e construtores dentro de um orçamento, e o sistema calcula pontuações e classificações com base nos resultados reais das corridas.

---

## Funcionalidades principais

- Montar equipe com 5 pilotos e 2 construtores (restrição orçamentária).
- Lançamento de pontuações por etapa (feito pelo administrador).
- Cálculo automático:
  - Pontuação da etapa para cada usuário
  - Classificação do GP
  - Pontuação de campeonato
  - Ranking geral dos participantes
- Painel administrativo para:
  - Configurar preços de pilotos e construtores
  - Definir deadline para alterações de equipe
  - Controlar fluxo de publicação de resultados

---

## Tecnologias

- Front-end: React + TypeScript (entrada em `index.tsx`)
- Arquivo de entrada HTML: `index.html`
- Banco de dados em tempo real: Firebase Firestore (usado para armazenar dados de usuários, equipes e pontuações)
- Imagens e recursos: pasta `images/`

> Observação: não há arquivos de configuração de build/versionamento no repositório (por exemplo `package.json`) visíveis na raiz — adapte instruções de execução conforme o gerenciador de pacotes e ferramentas que você utiliza (npm, yarn, Vite, webpack, etc).

---

## Como executar (guia rápido)

Opções dependem de como o projeto está configurado localmente. Se você tiver um fluxo de build com npm/yarn, use os scripts definidos no `package.json`. Caso contrário, use um servidor HTTP simples para servir os arquivos estáticos.

1. Servir localmente (sem build)
   - Abra `index.html` no navegador (funciona para builds já empacotados).
   - Ou use um servidor HTTP local (recomendado):
     - npx http-server . -p 8080
     - python -m http.server 8080
   - Acesse http://localhost:8080

2. Com gerenciador de pacotes (exemplo genérico)
   - Instale dependências:
     - npm install
     - ou yarn
   - Rodar em modo de desenvolvimento:
     - npm run dev
     - ou yarn dev
   - Build de produção:
     - npm run build
     - ou yarn build

Ajuste os comandos conforme os scripts definidos no seu `package.json` se houver.

---

## Configuração do Firebase

O projeto utiliza Firestore; para rodar localmente você precisará das credenciais/config do seu projeto Firebase. Exemplo de variáveis/arquivo `.env` (substitua pelos valores do seu projeto):

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Importe/initialize o Firebase no código usando essas variáveis. Mantenha as chaves seguras (não comite credenciais públicas).

---

## Estrutura esperada (visão geral)

- index.html — ponto de entrada HTML
- index.tsx — bootstrap do app React + TypeScript
- images/ — imagens e assets usados pela aplicação
- README.md — este arquivo

(Se houver mais pastas como `src/`, `public/`, `scripts/`, ou `package.json`, atualize a estrutura aqui conforme o repositório real.)

---

## Contribuição

- Abra uma issue descrevendo a mudança ou melhoria.
- Crie uma branch com nome descritivo (`feat/<descricao>`, `fix/<descricao>`).
- Abra um Pull Request explicando a mudança e como testar.
- Adicione testes ou instruções de verificação quando aplicável.

---

## Licença

Todos os direitos reservados. Feito por fã, sem prática comercial.

---

## Contato

Desenvolvedor: jonathanbonette
