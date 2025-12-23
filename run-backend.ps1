# ARXIS - Script de inicialização do Backend (PowerShell)
# Execute na pasta raiz: .\run-backend.ps1

Write-Host "🚀 Iniciando ARXIS API Backend..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta raiz
if (-Not (Test-Path "Arxis.sln")) {
    Write-Host "❌ Erro: Execute este script na pasta raiz do projeto Arxis" -ForegroundColor Red
    exit 1
}

# Verificar se .NET está instalado
try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET SDK encontrado: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: .NET SDK não encontrado" -ForegroundColor Red
    Write-Host "   Instale em: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Menu de opções
Write-Host "Selecione o modo de execução:" -ForegroundColor Yellow
Write-Host "1) Run (normal)"
Write-Host "2) Watch (hot reload)"
Write-Host "3) Build apenas"
Write-Host "4) Clean + Build"
Write-Host ""

$option = Read-Host "Opção [1]"
if ([string]::IsNullOrEmpty($option)) {
    $option = "1"
}

switch ($option) {
    "1" {
        Write-Host "🔨 Executando dotnet run..." -ForegroundColor Cyan
        dotnet run --project src\Arxis.API\Arxis.API.csproj
    }
    "2" {
        Write-Host "🔥 Executando dotnet watch run (hot reload)..." -ForegroundColor Cyan
        dotnet watch run --project src\Arxis.API\Arxis.API.csproj
    }
    "3" {
        Write-Host "🔨 Executando dotnet build..." -ForegroundColor Cyan
        dotnet build src\Arxis.API\Arxis.API.csproj
    }
    "4" {
        Write-Host "🧹 Limpando projeto..." -ForegroundColor Cyan
        dotnet clean
        Write-Host "🔨 Executando dotnet build..." -ForegroundColor Cyan
        dotnet build src\Arxis.API\Arxis.API.csproj
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}
