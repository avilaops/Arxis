# 🚀 Scripts de inicialização do ARXIS

Write-Host "🎯 ARXIS - Sistema de Gerenciamento de Obras" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Escolha uma opção:" -ForegroundColor Cyan
Write-Host "1. 🏗️  Produção (otimizado, sem hot-reload)" -ForegroundColor White
Write-Host "2. 🔧 Desenvolvimento (com hot-reload)" -ForegroundColor White
Write-Host "3. 🛑 Parar todos os containers" -ForegroundColor White
Write-Host "4. 🧹 Limpar tudo (containers, volumes, imagens)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Digite o número da opção"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🏗️  Iniciando modo PRODUÇÃO..." -ForegroundColor Green
        Write-Host ""
        docker-compose up --build -d
        Write-Host ""
        Write-Host "✅ Aplicação rodando!" -ForegroundColor Green
        Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "🔌 API: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "📚 Swagger: http://localhost:5000/swagger" -ForegroundColor Cyan
        Write-Host "📊 Redis: localhost:6379" -ForegroundColor Cyan
    }
    "2" {
        Write-Host ""
        Write-Host "🔧 Iniciando modo DESENVOLVIMENTO (com hot-reload)..." -ForegroundColor Green
        Write-Host ""
        docker-compose -f docker-compose.dev.yml up --build
        Write-Host ""
        Write-Host "✅ Aplicação rodando!" -ForegroundColor Green
        Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "🔌 API: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "📚 Swagger: http://localhost:5000/swagger" -ForegroundColor Cyan
        Write-Host "📊 Redis: localhost:6379" -ForegroundColor Cyan
    }
    "3" {
        Write-Host ""
        Write-Host "🛑 Parando todos os containers..." -ForegroundColor Yellow
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        Write-Host "✅ Containers parados" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "🧹 Limpando tudo..." -ForegroundColor Red
        $confirm = Read-Host "Isso vai remover containers, volumes e imagens. Confirma? (s/n)"
        if ($confirm -eq "s") {
            docker-compose down -v --rmi all
            docker-compose -f docker-compose.dev.yml down -v --rmi all
            Write-Host "✅ Limpeza concluída" -ForegroundColor Green
        }
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
    }
}
