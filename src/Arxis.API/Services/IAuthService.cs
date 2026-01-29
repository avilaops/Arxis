using Arxis.API.Models;
using Arxis.Domain.Entities;

namespace Arxis.API.Services;

public interface IAuthService
{
    Task<AuthResponse?> Login(LoginRequest request);
    Task<AuthResponse?> Register(RegisterRequest request);
    string GenerateJwtToken(Guid userId, string email, string role);
    Task<User?> GetUserByEmail(string email);
    Task<List<User>> GetAllUsers();
    Task UpdatePassword(Guid userId, string newPassword);
    Task<ForgotPasswordResponse> ForgotPassword(ForgotPasswordRequest request);
    Task<bool> ResetPassword(ResetPasswordRequest request);
}
