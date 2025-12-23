# ARXIS - Script completo de inicialização (PowerShell)
# Execute na pasta raiz: .\run.ps1

Write-Host "🚀 ARXIS - Sistema de Gerenciamento de Obras" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta raiz
if (-Not (Test-Path "Arxis.sln")) {
    Write-Host "❌ Erro: Execute este script na pasta raiz do projeto Arxis" -ForegroundColor Red
    exit 1
}

# Função para verificar dependências
function Check-Dependencies {
    Write-Host "🔍 Verificando dependências..." -ForegroundColor Yellow
    
    # .NET
    try {
        $dotnetVersion = dotnet --version
        Write-Host "✅ .NET SDK: $dotnetVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ .NET SDK não encontrado" -ForegroundColor Red
        Write-Host "   Instale em: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
        return $false
    }
    
    # Node.js
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
        Write-Host "   Instale em: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host ""
    return $true
}

# Verificar dependências
if (-Not (Check-Dependencies)) {
    exit 1
}

# Menu principal
Write-Host "Selecione o que deseja executar:" -ForegroundColor Yellow
Write-Host "1) Backend apenas (API)"
Write-Host "2) Frontend apenas (React)"
Write-Host "3) Ambos (Backend + Frontend)"
Write-Host "4) Build tudo"
Write-Host "5) Limpar e reconstruir"
Write-Host "6) Migrations (atualizar banco)"
Write-Host ""

$option = Read-Host "Opção [3]"
if ([string]::IsNullOrEmpty($option)) {
    $option = "3"
}

switch ($option) {
    "1" {
        Write-Host "🔨 Iniciando Backend..." -ForegroundColor Cyan
        dotnet run --project src\Arxis.API\Arxis.API.csproj
    }
    "2" {
        Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Cyan
        Set-Location src\Arxis.Web
        if (-Not (Test-Path "node_modules")) {
            Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
            npm install
        }
        npm run dev
        Set-Location ..\..
    }
    "3" {
        Write-Host "🚀 Iniciando Backend e Frontend..." -ForegroundColor Cyan
        Write-Host ""
        
        # Instalar dependências do frontend se necessário
        Set-Location src\Arxis.Web
        if (-Not (Test-Path "node_modules")) {
            Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
            npm install
        }
        Set-Location ..\..
        
        # Iniciar backend em background
        Write-Host "🔨 Iniciando Backend..." -ForegroundColor Cyan
        $backendJob = Start-Job -ScriptBlock {
            Set-Location $using:PWD
            dotnet run --project src\Arxis.API\Arxis.API.csproj
        }
        
        # Aguardar alguns segundos para o backend iniciar
        Write-Host "⏳ Aguardando backend iniciar..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        # Iniciar frontend
        Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Cyan
        Set-Location src\Arxis.Web
        npm run dev
        
        # Quando o frontend for encerrado, matar o backend também
        Stop-Job $backendJob
        Remove-Job $backendJob
        Set-Location ..\..
    }
    "4" {
        Write-Host "🔨 Fazendo build de tudo..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Backend..." -ForegroundColor Yellow
        dotnet build src\Arxis.API\Arxis.API.csproj
        Write-Host ""
        Write-Host "Frontend..." -ForegroundColor Yellow
        Set-Location src\Arxis.Web
        npm run build
        Set-Location ..\..
        Write-Host ""
        Write-Host "✅ Build concluído!" -ForegroundColor Green
    }
    "5" {
        Write-Host "🧹 Limpando projeto..." -ForegroundColor Cyan
        dotnet clean
        Remove-Item -Path "src\Arxis.Web\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "src\Arxis.Web\dist" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host ""
        Write-Host "🔨 Reconstruindo..." -ForegroundColor Cyan
        dotnet build src\Arxis.API\Arxis.API.csproj
        Set-Location src\Arxis.Web
        npm install
        npm run build
        Set-Location ..\..
        Write-Host ""
        Write-Host "✅ Rebuild concluído!" -ForegroundColor Green
    }
    "6" {
        Write-Host "🗄️ Aplicando migrations..." -ForegroundColor Cyan
        dotnet ef database update --project src\Arxis.Infrastructure --startup-project src\Arxis.API
        Write-Host "✅ Migrations aplicadas!" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}
