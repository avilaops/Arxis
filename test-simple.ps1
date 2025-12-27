Write-Host "🔧 Testando Email - ARXIS" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Validar Email
Write-Host "1️⃣ Validando email..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:5136/api/email/validate?email=nicolas@avila.inc"
    Write-Host "   ✅ Válido: $($result.isValid)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Teste 2: Enviar Email de Password Reset (sem autenticação)
Write-Host "2️⃣ Enviando email de teste..." -ForegroundColor Yellow
$body = @{
    to = "nicolas@avila.inc"
    userName = "Nícolas Ávila"
    resetLink = "https://arxis.com/reset?token=test123"
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5136/api/email/send-password-reset" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"

    Write-Host "   ✅ Email enviado!" -ForegroundColor Green
    Write-Host "   Mensagem: $($result.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host "📬 Verifique sua caixa: nicolas@avila.inc" -ForegroundColor Cyan
