using System.Net;
using System.Net.Mail;

var smtpHost = "smtp.porkbun.com";
var smtpPort = 587;
var smtpUser = "nicolas@avila.inc";
var smtpPassword = "7Aciqgr7@3278579";
var fromAddress = "nicolas@avila.inc";
var toAddress = "nicolas@avila.inc";

Console.WriteLine("📧 Teste Direto de SMTP");
Console.WriteLine("========================");
Console.WriteLine($"Host: {smtpHost}:{smtpPort}");
Console.WriteLine($"De: {fromAddress}");
Console.WriteLine($"Para: {toAddress}");
Console.WriteLine("");

try
{
    using var smtpClient = new SmtpClient(smtpHost, smtpPort)
    {
        EnableSsl = true,
        UseDefaultCredentials = false,
        Credentials = new NetworkCredential(smtpUser, smtpPassword),
        Timeout = 30000
    };

    using var message = new MailMessage
    {
        From = new MailAddress(fromAddress, "Nícolas Ávila - ARXIS"),
        Subject = "🧪 Teste Direto SMTP - ARXIS",
        Body = @"Olá Nícolas!

Este é um teste direto do sistema de email ARXIS.

✅ Conexão SMTP funcionando
✅ Credenciais Porkbun válidas
✅ Sistema pronto para enviar emails

Enviado em: " + DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss") + @"

---
ARXIS - Sistema de Gestão de Obras
Desenvolvido por Nícolas Ávila
https://avila.inc",
        IsBodyHtml = false
    };

    message.To.Add(toAddress);

    Console.WriteLine("🔄 Enviando email...");
    await smtpClient.SendMailAsync(message);
    Console.WriteLine("✅ Email enviado com sucesso!");
    Console.WriteLine("");
    Console.WriteLine("📬 Verifique sua caixa de entrada em: " + toAddress);
}
catch (Exception ex)
{
    Console.WriteLine("❌ Erro ao enviar email:");
    Console.WriteLine($"   {ex.Message}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"   Detalhe: {ex.InnerException.Message}");
    }
}

Console.WriteLine("");
Console.WriteLine("Pressione qualquer tecla para sair...");
Console.ReadKey();
