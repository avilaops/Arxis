# ARXIS - Script de inicialização Frontend (PowerShell)
# Execute na pasta raiz: .\run-frontend.ps1

Write-Host "🎨 Iniciando ARXIS Frontend..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta raiz
if (-Not (Test-Path "Arxis.sln")) {
    Write-Host "❌ Erro: Execute este script na pasta raiz do projeto Arxis" -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: Node.js não encontrado" -ForegroundColor Red
    Write-Host "   Instale em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Navegar para pasta do frontend
Set-Location src\Arxis.Web

# Verificar se node_modules existe
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Menu de opções
Write-Host "Selecione o modo de execução:" -ForegroundColor Yellow
Write-Host "1) Dev (desenvolvimento)"
Write-Host "2) Build (produção)"
Write-Host "3) Preview (visualizar build)"
Write-Host "4) Install Dependencies"
Write-Host ""

$option = Read-Host "Opção [1]"
if ([string]::IsNullOrEmpty($option)) {
    $option = "1"
}

switch ($option) {
    "1" {
        Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
        npm run dev
    }
    "2" {
        Write-Host "🔨 Criando build de produção..." -ForegroundColor Cyan
        npm run build
    }
    "3" {
        Write-Host "👀 Visualizando build de produção..." -ForegroundColor Cyan
        npm run preview
    }
    "4" {
        Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
        npm install
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}

# Voltar para pasta raiz
Set-Location ..\..
