namespace Arxis.API.Models;

public class ResetPasswordDevRequest
{
    public string Email { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
