using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Arxis.API.Models;
using Arxis.API.Services;

namespace Arxis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// User login
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        var response = await _authService.Login(request);

        if (response == null)
        {
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        return Ok(response);
    }

    /// <summary>
    /// User registration
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

        var response = await _authService.Register(request);

        if (response == null)
        {
            return BadRequest(new { message = "Email já cadastrado" });
        }

        _logger.LogInformation("Registration successful for email: {Email}", request.Email);
        return Ok(response);
    }

    /// <summary>
    /// Get current user info (requires authentication)
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<object> GetCurrentUser()
    {
        var userId = User.FindFirst("userId")?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        return Ok(new
        {
            userId,
            email,
            role
        });
    }

    /// <summary>
    /// Reset password (DEV ONLY - Remove in production)
    /// </summary>
    [HttpPost("reset-password-dev")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPasswordDev([FromBody] ResetPasswordDevRequest request)
    {
        var user = await _authService.GetUserByEmail(request.Email);
        if (user == null)
            return NotFound(new { message = "Usuário não encontrado" });

        await _authService.UpdatePassword(user.Id, request.NewPassword);

        _logger.LogInformation("Password reset for: {Email}", request.Email);
        return Ok(new { message = "Senha resetada com sucesso!", email = request.Email });
    }

    /// <summary>
    /// List all users (DEV ONLY)
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _authService.GetAllUsers();
        return Ok(users.Select(u => new {
            u.Id,
            u.Email,
            Name = $"{u.FirstName} {u.LastName}".Trim(),
            u.Role,
            u.CreatedAt
        }));
    }
}
