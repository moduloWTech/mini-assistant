# Usa uma imagem oficial do Node.js (versão 22) baseada no Alpine Linux (mais leve e segura)
FROM node:22-alpine

# Cria uma pasta dentro do "computador virtual" (container) onde a aplicação vai ficar
WORKDIR /app

# Copia os arquivos que listam as dependências do projeto ANTES do código fonte.
# Por que fazemos isso? O Docker faz cache por camadas. Se o código mudar, mas as bibliotecas não,
# ele não vai precisar baixar todas as bibliotecas de novo, deixando o deploy muito mais rápido!
COPY package*.json ./

# Instala as bibliotecas de produção e desenvolvimento (precisamos das de dev para compilar o TypeScript)
RUN npm install

# Copia a pasta do Prisma e gera os clientes locais de banco de dados
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o resto do código da sua máquina para dentro do container
COPY . .

# Compila o projeto TypeScript (transforma os arquivos .ts em .js dentro da pasta dist/)
RUN npm run build

# Expõe a porta que o seu servidor Express usa
EXPOSE 3000

# O comando que o servidor vai executar para iniciar a aplicação de vez
CMD ["npm", "start"]
