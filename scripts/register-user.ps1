$ErrorActionPreference = 'Stop'
Set-Location 'd:\Projetos\Engenharia\Arxis'

Write-Host 'Starting API job...'
$job = Start-Job -ScriptBlock {
    Set-Location 'd:\Projetos\Engenharia\Arxis'
    dotnet run --project src\Arxis.API
}

try {
    $deadline = (Get-Date).AddSeconds(40)
    $ready = $false
    while (-not $ready -and (Get-Date) -lt $deadline) {
        Start-Sleep -Seconds 2
        try {
            Invoke-RestMethod -Uri 'http://localhost:5136/health' -TimeoutSec 3 | Out-Null
            $ready = $true
        }
        catch {
            $ready = $false
        }
    }

    if (-not $ready) {
        throw 'API não respondeu dentro do tempo limite.'
    }

    $registerBody = @{
        email     = 'nicolas@avila.inc'
        password  = '7Aciqgr7@'
        firstName = 'Nicolas'
        lastName  = 'Avila'
    } | ConvertTo-Json

    Write-Host 'REGISTER_BODY:'
    Write-Host $registerBody

    try {
        $registerResponse = Invoke-RestMethod -Method Post -Uri 'http://localhost:5136/api/auth/register' -ContentType 'application/json' -Headers @{ Accept = 'application/json' } -Body $registerBody
        Write-Host 'REGISTER_RESPONSE:'
        ($registerResponse | ConvertTo-Json -Depth 5)
    }
    catch {
        Write-Host 'REGISTER_ERROR:'
        $_ | Format-List -Force

        if ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $reader.BaseStream.Position = 0
                    $reader.DiscardBufferedData()
                    $body = $reader.ReadToEnd()
                    Write-Host 'REGISTER_ERROR_BODY:'
                    Write-Host $body
                }
            }
            catch {}
        }
    }

    Write-Host 'USERS_RESPONSE:'
    try {
        $users = Invoke-RestMethod -Method Get -Uri 'http://localhost:5136/api/auth/users'
        $usersJson = $users | ConvertTo-Json -Depth 5
        Write-Host $usersJson
    }
    catch {
        Write-Host 'USERS_ERROR:'
        $_ | Format-List -Force
    }
}
finally {
    Write-Host 'STOPPING_API_JOB...'
    Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
    Write-Host 'API_LOGS:'
    Receive-Job $job -ErrorAction SilentlyContinue | Out-String
    Remove-Job $job -ErrorAction SilentlyContinue | Out-Null
    Write-Host 'Done.'
}
