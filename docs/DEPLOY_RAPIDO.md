# 🚀 Deploy Rápido - Arxis

## Opções de Deploy

Você tem **3 opções** para fazer o deploy do Arxis:

---

## 🎯 Opção 1: Deploy Automático no Azure (Recomendado)

### ✅ O que já está pronto:
- Workflows do GitHub Actions configurados
- Secrets do Azure já cadastrados
- Arquivos de configuração prontos

### 📋 Passo a Passo:

#### 1. Commitar e enviar o código

```powershell
# No diretório do projeto
cd c:\Users\Administrador\source\repos\Engenharia\Arxis

# Adicionar todos os arquivos novos
git add src/Arxis.API/Controllers/EmailController.cs
git add src/Arxis.API/Services/EmailService.cs
git add src/Arxis.API/Services/IEmailService.cs
git add src/Arxis.API/Services/NotificationService.cs
git add src/Arxis.API/Models/EmailModels.cs
git add src/Arxis.Web/src/services/emailService.ts
git add EMAIL_SYSTEM_DOCUMENTATION.md

# Adicionar mudanças nos arquivos modificados
git add src/Arxis.API/Program.cs
git add src/Arxis.API/appsettings.json
git add src/Arxis.API/appsettings.Development.json

# Commit
git commit -m "feat: sistema completo de emails com 16 templates profissionais"

# Push para o GitHub
git push origin main
```

#### 2. Acompanhar o Deploy

1. Acesse: https://github.com/avilaops/Arxis/actions
2. Você verá 2 workflows rodando:
   - **Deploy Backend to Azure** (API)
   - **Azure Static Web Apps CI/CD** (Frontend)
3. Aguarde ambos ficarem verdes ✅

#### 3. URLs após o Deploy

- **Backend API**: https://arxis.azurewebsites.net
- **Swagger**: https://arxis.azurewebsites.net/swagger
- **Frontend**: https://kind-sand-04db77a1e.azurestaticapps.net

#### 4. Configurar Variáveis de Ambiente no Azure

```powershell
# Login no Azure
az login

# Adicionar configurações de email no App Service
az webapp config appsettings set `
  --resource-group arxis-rg `
  --name Arxis `
  --settings `
    Email__SmtpHost="smtp.porkbun.com" `
    Email__SmtpPort="587" `
    Email__EnableSsl="true" `
    Email__FromAddress="nicolas@avila.inc" `
    Email__FromName="Arxis Team" `
    Email__SmtpUser="nicolas@avila.inc" `
    Email__SmtpPassword="7Aciqgr7@3278579"
```

---

## 🐳 Opção 2: Deploy com Docker (Local ou Servidor)

### 1. Build das Imagens

```powershell
# Backend
docker build -t arxis-api -f Dockerfile --target api .

# Frontend
docker build -t arxis-web -f Dockerfile --target web .
```

### 2. Rodar os Containers

```powershell
# Backend (API na porta 5000)
docker run -d -p 5000:5000 --name arxis-api `
  -e Email__SmtpHost="smtp.porkbun.com" `
  -e Email__SmtpPort="587" `
  -e Email__EnableSsl="true" `
  -e Email__FromAddress="nicolas@avila.inc" `
  -e Email__SmtpPassword="7Aciqgr7@3278579" `
  arxis-api

# Frontend (Web na porta 80)
docker run -d -p 80:80 --name arxis-web arxis-web
```

### 3. Verificar

```powershell
# Verificar containers rodando
docker ps

# Testar API
curl http://localhost:5000/health

# Acessar no navegador
start http://localhost
```

---

## 💻 Opção 3: Deploy Manual (VPS/Servidor)

### No Servidor Linux:

```bash
# 1. Instalar .NET 8
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0

# 2. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clonar repositório
git clone https://github.com/avilaops/Arxis.git
cd Arxis

# 4. Build Backend
cd src/Arxis.API
dotnet publish -c Release -o /var/www/arxis-api

# 5. Build Frontend
cd ../Arxis.Web
npm install
npm run build

# 6. Copiar build do frontend
sudo cp -r dist/* /var/www/arxis-web/

# 7. Configurar Nginx
sudo nano /etc/nginx/sites-available/arxis
```

### Configuração do Nginx:

```nginx
# Backend
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name seudominio.com;
    root /var/www/arxis-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Rodar como serviço:

```bash
# Criar serviço systemd
sudo nano /etc/systemd/system/arxis-api.service
```

```ini
[Unit]
Description=Arxis API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/arxis-api
ExecStart=/usr/bin/dotnet /var/www/arxis-api/Arxis.API.dll
Restart=always
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=Email__SmtpHost=smtp.porkbun.com
Environment=Email__SmtpPort=587
Environment=Email__SmtpUser=nicolas@avila.inc
Environment=Email__SmtpPassword=7Aciqgr7@3278579

[Install]
WantedBy=multi-user.target
```

```bash
# Iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable arxis-api
sudo systemctl start arxis-api

# Verificar status
sudo systemctl status arxis-api
```

---

## 🔍 Verificação Pós-Deploy

### Checklist:

```powershell
# ✅ Backend respondendo
curl https://arxis.azurewebsites.net/health

# ✅ Swagger acessível
start https://arxis.azurewebsites.net/swagger

# ✅ Testar envio de email
$body = @{
    to = "nicolas@avila.inc"
    userName = "Teste Deploy"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://arxis.azurewebsites.net/api/email/send-welcome" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# ✅ Frontend carregando
start https://kind-sand-04db77a1e.azurestaticapps.net
```

---

## 🐛 Troubleshooting

### Erro: "App Service não encontrado"

```powershell
# Criar recursos no Azure
az group create --name arxis-rg --location brazilsouth

az appservice plan create `
  --name arxis-plan `
  --resource-group arxis-rg `
  --sku B1 `
  --is-linux

az webapp create `
  --resource-group arxis-rg `
  --plan arxis-plan `
  --name Arxis `
  --runtime "DOTNET:8.0"
```

### Erro: "Email não envia"

1. Verificar configurações no Azure Portal
2. Confirmar que as variáveis de ambiente estão corretas
3. Verificar logs:

```powershell
az webapp log tail --resource-group arxis-rg --name Arxis
```

### Erro: "Frontend não carrega"

1. Verificar se o build foi bem-sucedido no GitHub Actions
2. Limpar cache do navegador
3. Verificar console do navegador (F12)

---

## 📊 Monitoramento

### Ver logs em tempo real:

```powershell
# Backend
az webapp log tail --resource-group arxis-rg --name Arxis

# Ver últimas 100 linhas
az webapp log download --resource-group arxis-rg --name Arxis
```

### Métricas:

1. Acesse: https://portal.azure.com
2. Vá em: Resource Groups → arxis-rg → Arxis
3. Menu lateral: Monitoring → Metrics

---

## 🎯 Recomendação

Para começar rapidamente, use a **Opção 1 (Deploy Automático)**.

Basta rodar:

```powershell
cd c:\Users\Administrador\source\repos\Engenharia\Arxis
git add .
git commit -m "feat: sistema completo de emails"
git push origin main
```

Depois acesse: https://github.com/avilaops/Arxis/actions

✅ **Pronto!** Em ~5 minutos seu sistema estará no ar.

---

## 📞 Suporte

**Email**: nicolas@avila.inc
**Telefone**: +1 799-781-1471
**GitHub**: https://github.com/avilaops/Arxis

---

_Última atualização: 27/12/2024_
