using Arxis.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Arxis.Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void User_Should_CreateWithDefaultValues()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        user.Email.Should().BeEmpty();
        user.FirstName.Should().BeEmpty();
        user.LastName.Should().BeEmpty();
        user.IsActive.Should().BeTrue();
        user.Role.Should().Be("User");
        user.Language.Should().Be("pt-BR");
        user.ProjectUsers.Should().BeEmpty();
    }

    [Fact]
    public void User_Should_SetPropertiesCorrectly()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            Phone = "+55 11 99999-9999",
            Role = "Admin",
            IsActive = true
        };

        // Assert
        user.Email.Should().Be("test@example.com");
        user.FirstName.Should().Be("John");
        user.LastName.Should().Be("Doe");
        user.Phone.Should().Be("+55 11 99999-9999");
        user.Role.Should().Be("Admin");
        user.IsActive.Should().BeTrue();
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("Manager")]
    [InlineData("User")]
    [InlineData("Viewer")]
    public void User_Should_AcceptValidRoles(string role)
    {
        // Arrange & Act
        var user = new User { Role = role };

        // Assert
        user.Role.Should().Be(role);
    }

    [Fact]
    public void User_Should_TrackLastLogin()
    {
        // Arrange
        var user = new User();
        var loginTime = DateTime.UtcNow;

        // Act
        user.LastLoginAt = loginTime;

        // Assert
        user.LastLoginAt.Should().BeCloseTo(loginTime, TimeSpan.FromSeconds(1));
    }
}
