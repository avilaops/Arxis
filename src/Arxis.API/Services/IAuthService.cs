using Arxis.API.Models;

namespace Arxis.API.Services;

public interface IAuthService
{
    Task<AuthResponse?> Login(LoginRequest request);
    Task<AuthResponse?> Register(RegisterRequest request);
    string GenerateJwtToken(Guid userId, string email, string role);
}
