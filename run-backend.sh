#!/bin/bash

# ARXIS - Script de inicialização do Backend
# Execute na pasta raiz: ./run-backend.sh

echo "🚀 Iniciando ARXIS API Backend..."
echo ""

# Verificar se está na pasta raiz
if [ ! -f "Arxis.sln" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto Arxis"
    exit 1
fi

# Verificar se .NET está instalado
if ! command -v dotnet &> /dev/null; then
    echo "❌ Erro: .NET SDK não encontrado"
    echo "   Instale em: https://dotnet.microsoft.com/download"
    exit 1
fi

echo "✅ .NET SDK encontrado: $(dotnet --version)"
echo ""

# Opções
echo "Selecione o modo de execução:"
echo "1) Run (normal)"
echo "2) Watch (hot reload)"
echo "3) Build apenas"
echo ""
read -p "Opção [1]: " option
option=${option:-1}

case $option in
    1)
        echo "🔨 Executando dotnet run..."
        dotnet run --project src/Arxis.API/Arxis.API.csproj
        ;;
    2)
        echo "🔥 Executando dotnet watch run (hot reload)..."
        dotnet watch run --project src/Arxis.API/Arxis.API.csproj
        ;;
    3)
        echo "🔨 Executando dotnet build..."
        dotnet build src/Arxis.API/Arxis.API.csproj
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac
