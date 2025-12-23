#!/bin/bash

# ARXIS - Script de inicialização Frontend
# Execute na pasta raiz: ./run-frontend.sh

echo "🎨 Iniciando ARXIS Frontend..."
echo ""

# Verificar se está na pasta raiz
if [ ! -f "Arxis.sln" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto Arxis"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não encontrado"
    echo "   Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo "✅ npm encontrado: $(npm --version)"
echo ""

# Navegar para pasta do frontend
cd src/Arxis.Web

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Opções
echo "Selecione o modo de execução:"
echo "1) Dev (desenvolvimento)"
echo "2) Build (produção)"
echo "3) Preview (visualizar build)"
echo ""
read -p "Opção [1]: " option
option=${option:-1}

case $option in
    1)
        echo "🚀 Iniciando servidor de desenvolvimento..."
        npm run dev
        ;;
    2)
        echo "🔨 Criando build de produção..."
        npm run build
        ;;
    3)
        echo "👀 Visualizando build de produção..."
        npm run preview
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac
