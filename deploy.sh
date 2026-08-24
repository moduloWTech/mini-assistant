#!/bin/bash
set -e

echo "=================================================="
echo "🚀 Mini-Assistant Enterprise - Turnkey Deploy Script"
echo "=================================================="

# 1. Verificar Node.js e Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

echo "📦 1. Verificando variáveis de ambiente (.env)..."
if [ ! -f .env ]; then
    echo "⚠️ .env não encontrado. Copiando do .env.example..."
    cp .env.example .env
    echo "👉 Edite o arquivo .env com suas chaves de API e execute ./deploy.sh novamente."
    exit 1
fi

echo "📥 2. Instalando dependências..."
npm install

echo "🔄 3. Sincronizando schema do banco de dados (Prisma)..."
npx prisma generate
npx prisma db push

echo "🐳 4. Subindo serviços de infraestrutura (Redis / Queue)..."
docker compose up -d

echo "🔨 5. Compilando o TypeScript..."
npm run build

echo "=================================================="
echo "✅ Sistema pronto e configurado com sucesso!"
echo "👉 Para iniciar em modo desenvolvimento: npm run dev"
echo "👉 Para iniciar em modo produção: npm start"
echo "👉 Dashboard disponível em: http://localhost:3000/dashboard"
echo "👉 Documentação Swagger em: http://localhost:3000/api-docs"
echo "=================================================="
