namespace Arxis.API.Models;

/// <summary>
/// Request for forgot password
/// </summary>
public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request for reset password with token
/// </summary>
public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// Response for forgot password
/// </summary>
public class ForgotPasswordResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ResetToken { get; set; }
}
