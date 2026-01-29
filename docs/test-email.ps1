#!/usr/bin/env pwsh
# Script para testar o sistema de email Arxis
# Inspirado no avx-cell email testing

Write-Host "📧 ARXIS Email System Test" -ForegroundColor Cyan
Write-Host "═══════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5136/api"
$testEmail = "nicolas@avila.inc"

Write-Host "⚙️  Configurações:" -ForegroundColor Yellow
Write-Host "   API URL: $baseUrl"
Write-Host "   Email de teste: $testEmail"
Write-Host "   SMTP: smtp.porkbun.com:587"
Write-Host ""

# Test 1: Validate Email
Write-Host "🔍 Teste 1: Validando email..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/email/validate?email=$testEmail" -Method Get
    Write-Host "   ✅ Email válido: $($response.isValid)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Erro na validação: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Send Simple Email
Write-Host "📨 Teste 2: Enviando email simples..." -ForegroundColor Green
$simpleEmail = @{
    to = @($testEmail)
    subject = "🧪 Teste ARXIS - Email Simples"
    body = @"
Olá Nícolas!

Este é um email de teste do sistema ARXIS.

✅ Sistema de email funcionando
✅ Integração com avx-cell concepts
✅ SMTP Porkbun configurado

Enviado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---
ARXIS - Sistema de Gestão de Obras
Desenvolvido por Nícolas Ávila
https://avila.inc
"@
    isHtml = $false
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/email/send" -Method Post -Body $simpleEmail -Headers $headers
    Write-Host "   ✅ Email enviado com sucesso!" -ForegroundColor Green
    Write-Host "   Resposta: $($response.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ❌ Erro no envio: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 3: Send Welcome Email
Write-Host "👋 Teste 3: Enviando email de boas-vindas..." -ForegroundColor Green
$welcomeEmail = @{
    to = $testEmail
    userName = "Nícolas Ávila"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/email/send-welcome" -Method Post -Body $welcomeEmail -Headers $headers
    Write-Host "   ✅ Email de boas-vindas enviado!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Erro no envio: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Send Notification Email
Write-Host "🔔 Teste 4: Enviando notificação..." -ForegroundColor Green
$notificationEmail = @{
    to = $testEmail
    title = "🎉 Sistema de Email Ativo"
    message = "O sistema de email do ARXIS está funcionando perfeitamente!"
    details = @"
Funcionalidades testadas:
• Validação de emails
• Envio simples
• Templates de email
• Sistema de notificações

Próximos passos:
• Integrar com issues
• Configurar lembretes de tarefas
• Sistema de filas
"@
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/email/send-notification" -Method Post -Body $notificationEmail -Headers $headers
    Write-Host "   ✅ Notificação enviada!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ❌ Erro no envio: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "═══════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Testes concluídos!" -ForegroundColor Green
Write-Host ""
Write-Host "📬 Verifique sua caixa de entrada em: $testEmail" -ForegroundColor Yellow
Write-Host ""
