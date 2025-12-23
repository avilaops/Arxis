@echo off
REM ARXIS - Script de inicialização do Backend (Batch)
REM Execute na pasta raiz: run-backend.bat

echo.
echo ========================================
echo   ARXIS API Backend - Inicializacao
echo ========================================
echo.

REM Verificar se está na pasta raiz
if not exist "Arxis.sln" (
    echo [ERRO] Execute este script na pasta raiz do projeto Arxis
    pause
    exit /b 1
)

REM Verificar se .NET está instalado
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] .NET SDK nao encontrado
    echo        Instale em: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo [OK] .NET SDK encontrado
dotnet --version
echo.

REM Menu de opções
echo Selecione o modo de execucao:
echo 1) Run (normal)
echo 2) Watch (hot reload)
echo 3) Build apenas
echo 4) Clean + Build
echo.

set /p option="Opcao [1]: "
if "%option%"=="" set option=1

if "%option%"=="1" (
    echo.
    echo [INFO] Executando dotnet run...
    dotnet run --project src\Arxis.API\Arxis.API.csproj
) else if "%option%"=="2" (
    echo.
    echo [INFO] Executando dotnet watch run (hot reload)...
    dotnet watch run --project src\Arxis.API\Arxis.API.csproj
) else if "%option%"=="3" (
    echo.
    echo [INFO] Executando dotnet build...
    dotnet build src\Arxis.API\Arxis.API.csproj
) else if "%option%"=="4" (
    echo.
    echo [INFO] Limpando projeto...
    dotnet clean
    echo [INFO] Executando dotnet build...
    dotnet build src\Arxis.API\Arxis.API.csproj
) else (
    echo [ERRO] Opcao invalida
    pause
    exit /b 1
)

pause
