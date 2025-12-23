#!/bin/bash

# ARXIS - Script completo de inicialização
# Execute na pasta raiz: ./run.sh

echo "🚀 ARXIS - Sistema de Gerenciamento de Obras"
echo "=========================================="
echo ""

# Verificar se está na pasta raiz
if [ ! -f "Arxis.sln" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto Arxis"
    exit 1
fi

# Função para verificar dependências
check_dependencies() {
    echo "🔍 Verificando dependências..."
    
    # .NET
    if ! command -v dotnet &> /dev/null; then
        echo "❌ .NET SDK não encontrado"
        echo "   Instale em: https://dotnet.microsoft.com/download"
        return 1
    fi
    echo "✅ .NET SDK: $(dotnet --version)"
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js não encontrado"
        echo "   Instale em: https://nodejs.org/"
        return 1
    fi
    echo "✅ Node.js: $(node --version)"
    echo "✅ npm: $(npm --version)"
    
    echo ""
    return 0
}

# Verificar dependências
if ! check_dependencies; then
    exit 1
fi

# Menu principal
echo "Selecione o que deseja executar:"
echo "1) Backend apenas (API)"
echo "2) Frontend apenas (React)"
echo "3) Ambos (Backend + Frontend)"
echo "4) Build tudo"
echo "5) Limpar e reconstruir"
echo ""
read -p "Opção [3]: " option
option=${option:-3}

case $option in
    1)
        echo "🔨 Iniciando Backend..."
        dotnet run --project src/Arxis.API/Arxis.API.csproj
        ;;
    2)
        echo "🎨 Iniciando Frontend..."
        cd src/Arxis.Web
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências..."
            npm install
        fi
        npm run dev
        ;;
    3)
        echo "🚀 Iniciando Backend e Frontend..."
        echo ""
        
        # Instalar dependências do frontend se necessário
        cd src/Arxis.Web
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências do frontend..."
            npm install
        fi
        cd ../..
        
        # Iniciar backend em background
        echo "🔨 Iniciando Backend..."
        dotnet run --project src/Arxis.API/Arxis.API.csproj &
        BACKEND_PID=$!
        
        # Aguardar alguns segundos para o backend iniciar
        echo "⏳ Aguardando backend iniciar..."
        sleep 5
        
        # Iniciar frontend
        echo "🎨 Iniciando Frontend..."
        cd src/Arxis.Web
        npm run dev
        
        # Quando o frontend for encerrado, matar o backend também
        kill $BACKEND_PID
        ;;
    4)
        echo "🔨 Fazendo build de tudo..."
        echo ""
        echo "Backend..."
        dotnet build src/Arxis.API/Arxis.API.csproj
        echo ""
        echo "Frontend..."
        cd src/Arxis.Web
        npm run build
        cd ../..
        echo ""
        echo "✅ Build concluído!"
        ;;
    5)
        echo "🧹 Limpando projeto..."
        dotnet clean
        rm -rf src/Arxis.Web/node_modules
        rm -rf src/Arxis.Web/dist
        echo ""
        echo "🔨 Reconstruindo..."
        dotnet build src/Arxis.API/Arxis.API.csproj
        cd src/Arxis.Web
        npm install
        npm run build
        cd ../..
        echo ""
        echo "✅ Rebuild concluído!"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac
