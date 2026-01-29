using Arxis.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Arxis.Domain.Tests.Entities;

public class ProjectTests
{
    [Fact]
    public void Project_Should_CreateWithDefaultValues()
    {
        // Arrange & Act
        var project = new Project();

        // Assert
        project.Name.Should().BeEmpty();
        project.Currency.Should().Be("BRL");
        project.Status.Should().Be(ProjectStatus.Planning);
        project.Tags.Should().BeEmpty();
        project.ProjectUsers.Should().BeEmpty();
    }

    [Fact]
    public void Project_Should_SetPropertiesCorrectly()
    {
        // Arrange
        var startDate = DateTime.UtcNow;
        var endDate = startDate.AddMonths(6);

        var project = new Project
        {
            Name = "Shopping Center ABC",
            Description = "Construção de shopping center",
            Client = "XYZ Empreendimentos",
            Address = "Av. Paulista, 1000",
            City = "São Paulo",
            State = "SP",
            Country = "Brasil",
            Currency = "BRL",
            StartDate = startDate,
            EndDate = endDate,
            TotalBudget = 5000000.00m,
            Status = ProjectStatus.InProgress,
            Type = ProjectType.Commercial
        };

        // Assert
        project.Name.Should().Be("Shopping Center ABC");
        project.Client.Should().Be("XYZ Empreendimentos");
        project.City.Should().Be("São Paulo");
        project.TotalBudget.Should().Be(5000000.00m);
        project.Status.Should().Be(ProjectStatus.InProgress);
        project.Type.Should().Be(ProjectType.Commercial);
    }

    [Theory]
    [InlineData(ProjectStatus.Planning)]
    [InlineData(ProjectStatus.InProgress)]
    [InlineData(ProjectStatus.OnHold)]
    [InlineData(ProjectStatus.Completed)]
    [InlineData(ProjectStatus.Archived)]
    [InlineData(ProjectStatus.Cancelled)]
    public void Project_Should_AcceptValidStatuses(ProjectStatus status)
    {
        // Arrange & Act
        var project = new Project { Status = status };

        // Assert
        project.Status.Should().Be(status);
    }

    [Theory]
    [InlineData(ProjectType.Residential)]
    [InlineData(ProjectType.Commercial)]
    [InlineData(ProjectType.Industrial)]
    [InlineData(ProjectType.Infrastructure)]
    [InlineData(ProjectType.Hospital)]
    [InlineData(ProjectType.Educational)]
    public void Project_Should_AcceptValidTypes(ProjectType type)
    {
        // Arrange & Act
        var project = new Project { Type = type };

        // Assert
        project.Type.Should().Be(type);
    }

    [Fact]
    public void Project_Should_SupportTags()
    {
        // Arrange
        var project = new Project
        {
            Tags = new List<string> { "Urgent", "High-Priority", "Q1-2024" }
        };

        // Assert
        project.Tags.Should().HaveCount(3);
        project.Tags.Should().Contain("Urgent");
        project.Tags.Should().Contain("High-Priority");
    }
}
