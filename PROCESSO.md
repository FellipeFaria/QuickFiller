# O Processo e o Uso de IA

O desenvolvimento desta solução contou com o auxílio de IA (LLMs) tanto para o pareamento de código (Pair Programming) quanto como núcleo do produto final.

## Ferramentas Utilizadas

- **Google Gemini API (3.6-flash):** Como o motor principal de OCR e extração estruturada de dados do produto.
- **LLM (Chat/Copilot):** Utilizado para discutir arquitetura, refatorar injeção de dependências e debugar erros específicos de sintaxe.

## Erros da IA e Correções de Rota

1. **A quebra do JSON em documentos gigantes:** * **O erro:** Ao processar o arquivo \`time-card-04.pdf\` (muito longo), a IA atingiu o limite de \`maxOutputTokens\` padrão e a string JSON quebrou na metade, causando um \`SyntaxError: Unterminated string\`.
   - **A correção:** Percebi o erro pela resposta do Express. A primeira tentativa foi forçar o \`gemini-3.5-flash-lite\` com um prompt pedindo o JSON minificado (em uma linha só) para economizar tokens. Isso funcionou temporariamente, mas causou "engasgos" da IA ao não conseguir contar os colchetes \`]\` corretamente. A solução final escrita à mão foi atualizar o SDK para suportar o \`gemini-3.6-flash\`, remover a regra de minificação do prompt e aumentar o limite rígido para \`maxOutputTokens: 65536\`.

2. **A "Invenção" de dados em Holerites Complexos:**
   - **O erro:** Inicialmente, a IA tentou formatar a aba de impostos inventando colunas vazias só para caber na estrutura.
   - **A correção:** O prompt de sistema foi reescrito rigidamente com Few-Shot Prompting, adicionando condicionais lógicas no Service para separar o prompt de Holerite do prompt de Cartão de Ponto, forçando o motor a usar null e o caractere \`?\` em caso de dúvida.

## Respostas Obrigatórias

### 1. Cite 3 decisões em que havia mais de uma resposta razoável. Por que escolheu essa?

- **OCR Tradicional (Tesseract) vs IA Multimodal (Gemini):** Escolhi a IA Multimodal. O Tesseract exigiria instalação no Dockerfile (aumentando o peso da imagem) e limpeza manual pesada com Regex. A IA resolveu imagem e estruturação JSON num único passo de rede.
- **Armazenamento: SQLite/Postgres vs Memória (Map):** Escolhi Memória RAM. O desafio foca na extração e na privacidade dos dados. Adicionar um banco relacional aumentaria a fricção para avaliar o desafio, enquanto a memória garante o apagamento total dos dados (PII) pós-uso.
- **Framework Frontend: React vs Vanilla JS:** Escolhi HTML/JS Vanilla fornecido via pasta estática (\`public\`) do Express. Isso eliminou a necessidade de gerenciar CORS e configurar duas portas/containers separados, garantindo que o avaliador rode tudo com um único \`docker compose up\`.

### 2. O que na sua solução quebra primeiro em produção?

O sistema em memória RAM. Se a aplicação escalar para múltiplos usuários simultâneos ou for feito um deploy em Kubernetes com balanceador de carga, o \`Map\` na memória não será compartilhado entre as instâncias da API (alguém faria o POST no Servidor A, e o GET bateria no Servidor B, retornando 404). Em produção, isso precisaria ser trocado imediatamente por um Redis para controle de fila e estado.

### 3. Onde você não confia no que entregou?

Não confio plenamente na resiliência da aplicação perante documentos intencionalmente maliciosos ou PDFs de 500 páginas. Como os arquivos vão inteiros em formato Buffer para a memória antes do envio para a IA, um ataque de negação de serviço enviando múltiplos PDFs colossais pode estourar a memória RAM do container Node.js antes de ser processado pelo limite da API. Um sistema real exigiria streams ou limitação forte no Multer.
