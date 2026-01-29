#!/bin/bash

# 🚀 Script de inicialização do ARXIS para Linux/Mac

echo "🎯 ARXIS - Sistema de Gerenciamento de Obras"
echo ""

# Verificar se Docker está rodando
echo "🔍 Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi
echo "✅ Docker está rodando"

echo ""
echo "Escolha uma opção:"
echo "1. 🏗️  Produção (otimizado, sem hot-reload)"
echo "2. 🔧 Desenvolvimento (com hot-reload)"
echo "3. 🛑 Parar todos os containers"
echo "4. 🧹 Limpar tudo (containers, volumes, imagens)"
echo ""

read -p "Digite o número da opção: " choice

case $choice in
    1)
        echo ""
        echo "🏗️  Iniciando modo PRODUÇÃO..."
        echo ""
        docker-compose up --build -d
        echo ""
        echo "✅ Aplicação rodando!"
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔌 API: http://localhost:5000"
        echo "📚 Swagger: http://localhost:5000/swagger"
        echo "📊 Redis: localhost:6379"
        ;;
    2)
        echo ""
        echo "🔧 Iniciando modo DESENVOLVIMENTO (com hot-reload)..."
        echo ""
        docker-compose -f docker-compose.dev.yml up --build
        echo ""
        echo "✅ Aplicação rodando!"
        echo "🌐 Frontend: http://localhost:5173"
        echo "🔌 API: http://localhost:5000"
        echo "📚 Swagger: http://localhost:5000/swagger"
        echo "📊 Redis: localhost:6379"
        ;;
    3)
        echo ""
        echo "🛑 Parando todos os containers..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        echo "✅ Containers parados"
        ;;
    4)
        echo ""
        echo "🧹 Limpando tudo..."
        read -p "Isso vai remover containers, volumes e imagens. Confirma? (s/n) " confirm
        if [ "$confirm" = "s" ]; then
            docker-compose down -v --rmi all
            docker-compose -f docker-compose.dev.yml down -v --rmi all
            echo "✅ Limpeza concluída"
        fi
        ;;
    *)
        echo "❌ Opção inválida"
        ;;
esac
