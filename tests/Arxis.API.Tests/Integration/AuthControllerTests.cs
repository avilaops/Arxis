using System.Net;
using System.Net.Http.Json;
using Arxis.API.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Arxis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Arxis.API.Tests.Integration;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("test", "true");
            builder.ConfigureServices(services =>
            {
                // Remove Serilog para evitar conflitos em testes
                var serilogDescriptor = services.FirstOrDefault(d => d.ServiceType?.FullName?.Contains("Serilog") == true);
                if (serilogDescriptor != null)
                {
                    services.Remove(serilogDescriptor);
                }

                // Remove o DbContext existente
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ArxisDbContext>));
                
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Adiciona DbContext InMemory para testes
                services.AddDbContext<ArxisDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });

                // Build service provider
                var sp = services.BuildServiceProvider();

                // Cria escopo e obtém o contexto
                using var scope = sp.CreateScope();
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<ArxisDbContext>();

                // Garante que o banco está criado
                db.Database.EnsureCreated();
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Register_Should_CreateNewUser()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Email = $"test_{Guid.NewGuid()}@example.com",
            Password = "Test@1234",
            FirstName = "Test",
            LastName = "User"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrEmpty();
        authResponse.Email.Should().Be(registerRequest.Email);
        authResponse.FirstName.Should().Be(registerRequest.FirstName);
        authResponse.LastName.Should().Be(registerRequest.LastName);
    }

    [Fact]
    public async Task Login_Should_ReturnToken_WhenCredentialsAreValid()
    {
        // Arrange - Primeiro registra um usuário
        var email = $"login_test_{Guid.NewGuid()}@example.com";
        var password = "Test@1234";
        
        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = password,
            FirstName = "Login",
            LastName = "Test"
        };

        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_Should_ReturnUnauthorized_WhenPasswordIsInvalid()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "WrongPassword123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
