# Quick Filler - Extrator de Documentos Trabalhistas

A Quick Filler é uma aplicação desenvolvida para transcrever documentos trabalhistas em PDF (Holerites e Cartões de Ponto) para planilhas estruturadas (.xlsx) utilizando Inteligência Artificial.

## Tecnologias Utilizadas

- **Backend:** Node.js com TypeScript e Express.
- **Inteligência Artificial:** Google Gemini API (Modelo `gemini-3.6-flash` via `@google/genai`).
- **Geração de Planilhas:** Biblioteca `xlsx`.
- **Uploads:** Multer (processamento em memória).
- **Frontend:** HTML/CSS/JS Vanilla (interface leve e rápida para testes da API).
- **Infraestrutura:** Docker e Docker Compose.

## Como Executar o Projeto

### Pré-requisitos

- Docker e Docker Compose instalados na máquina.
- Uma chave de API válida do Google Gemini Studio.

### Passos

1. Clone o repositório:
   \`\`\`bash
   git clone <https://github.com/seu-usuario/quick-filler.git>
   cd quick-filler
   \`\`\`

2. Crie um arquivo \`.env\` na raiz do projeto e insira sua chave da API:
   \`\`\`env
   GEMINI_API_KEY=sua_chave_aqui
   PORT=3000
   \`\`\`

3. Suba a aplicação via Docker:
   \`\`\`bash
   docker compose up --build
   \`\`\`

4. Acesse a interface web para testes em:
   **<http://localhost:3000>**

## 📡 Documentação da API

- \`POST /api/transcricoes\`: Recebe um \`multipart/form-data\` com \`arquivo\` (PDF) e \`tipo\` (\`holerite\` ou \`cartao-ponto\`). Retorna \`202 Accepted\` com o \`id\`.
- \`GET /api/transcricoes/:id\`: Retorna o status do processamento (\`processando\`, \`concluido\` ou \`erro\`) e o JSON extraído.
- \`PUT /api/transcricoes/:id\`: Permite atualizar o JSON extraído enviando o novo objeto no corpo da requisição.
- \`GET /api/transcricoes/:id/download\`: Baixa o arquivo Excel (\`.xlsx\`) gerado a partir do JSON (original ou editado).
- \`GET /healthz\`: Retorna \`200 OK\` se a API estiver online.
