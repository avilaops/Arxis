using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Arxis.API.Models;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;

namespace Arxis.API.Services;

public class AuthService : IAuthService
{
    private readonly ArxisDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;
    private readonly IEmailService _emailService;

    public AuthService(ArxisDbContext context, IConfiguration configuration, ILogger<AuthService> logger, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _emailService = emailService;
    }

    public async Task<AuthResponse?> Login(LoginRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted);

            if (user == null)
            {
                _logger.LogWarning("Login attempt failed: User not found - {Email}", request.Email);
                return null;
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login attempt failed: Invalid password - {Email}", request.Email);
                return null;
            }

            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user.Id, user.Email, user.Role);

            _logger.LogInformation("User logged in successfully: {Email}", request.Email);

            return new AuthResponse
            {
                Token = token,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                UserId = user.Id
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}", request.Email);
            throw;
        }
    }

    public async Task<AuthResponse?> Register(RegisterRequest request)
    {
        try
        {
            // Verificar se email já existe
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                _logger.LogWarning("Registration attempt failed: Email already exists - {Email}", request.Email);
                return null;
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user.Id, user.Email, user.Role);

            _logger.LogInformation("User registered successfully: {Email}", request.Email);

            return new AuthResponse
            {
                Token = token,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                UserId = user.Id
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for {Email}", request.Email);
            throw;
        }
    }

    public string GenerateJwtToken(Guid userId, string email, string role)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key not configured");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("userId", userId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User?> GetUserByEmail(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
    }

    public async Task<List<User>> GetAllUsers()
    {
        return await _context.Users
            .Where(u => !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdatePassword(Guid userId, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<ForgotPasswordResponse> ForgotPassword(ForgotPasswordRequest request)
    {
        try
        {
            var user = await GetUserByEmail(request.Email);
            if (user == null)
            {
                // Return success even if user doesn't exist for security
                _logger.LogWarning("Forgot password attempt for non-existent email: {Email}", request.Email);
                return new ForgotPasswordResponse
                {
                    Success = true,
                    Message = "Se o email existir em nossa base, você receberá instruções para redefinir sua senha."
                };
            }

            // Generate reset token (simple implementation - in production use JWT or secure token)
            var resetToken = GenerateResetToken(user.Id);

            // Store reset token in user (in production, use separate table with expiration)
            user.ResetToken = resetToken;
            user.ResetTokenExpires = DateTime.UtcNow.AddHours(1); // Token expires in 1 hour
            await _context.SaveChangesAsync();

            // Send email with reset link
            try
            {
                await SendPasswordResetEmail(user.Email, resetToken);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send password reset email to {Email}", user.Email);
                // Don't fail the request if email fails
            }

            _logger.LogInformation("Password reset initiated for: {Email}", request.Email);

            return new ForgotPasswordResponse
            {
                Success = true,
                Message = "Instruções para redefinir sua senha foram enviadas para seu email.",
                ResetToken = resetToken // Only for development - remove in production
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during forgot password for {Email}", request.Email);
            return new ForgotPasswordResponse
            {
                Success = false,
                Message = "Erro interno do servidor. Tente novamente mais tarde."
            };
        }
    }

    public async Task<bool> ResetPassword(ResetPasswordRequest request)
    {
        try
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                _logger.LogWarning("Password reset failed: passwords don't match");
                return false;
            }

            if (string.IsNullOrEmpty(request.Token))
            {
                _logger.LogWarning("Password reset failed: empty token");
                return false;
            }

            // Find user with reset token (in production, validate token properly)
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.ResetToken == request.Token && !u.IsDeleted);

            if (user == null)
            {
                _logger.LogWarning("Password reset failed: invalid token");
                return false;
            }

            // Check if token is expired
            if (user.ResetTokenExpires < DateTime.UtcNow)
            {
                _logger.LogWarning("Password reset failed: expired token for user {Email}", user.Email);
                return false;
            }

            // Update password
            await UpdatePassword(user.Id, request.NewPassword);

            // Clear reset token
            user.ResetToken = null;
            user.ResetTokenExpires = null;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Password reset successful for: {Email}", user.Email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset");
            return false;
        }
    }

    private string GenerateResetToken(Guid userId)
    {
        // Simple token generation - in production use proper JWT or secure random token
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = Guid.NewGuid().ToString("N").Substring(0, 8);
        return $"{userId:N}_{timestamp}_{random}";
    }

    private async Task SendPasswordResetEmail(string email, string resetToken)
    {
        // In production, use proper email service
        var resetLink = $"http://localhost:5173/reset-password?token={resetToken}";

        var emailMessage = new EmailMessage
        {
            To = new List<string> { email },
            Subject = "Redefinição de Senha - ARXIS",
            Body = $@"
Olá,

Você solicitou a redefinição de sua senha no ARXIS.

Para redefinir sua senha, clique no link abaixo:
{resetLink}

Este link é válido por 1 hora.

Se você não solicitou esta redefinição, ignore este email.

Atenciosamente,
Equipe ARXIS
            ",
            IsHtml = false
        };

        // Use the email service if available
        await _emailService.SendEmailAsync(emailMessage);
    }
}
