using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Arxis.Infrastructure.Data;

/// <summary>
/// Design-time factory to support Entity Framework Core tooling operations.
/// </summary>
public class ArxisDbContextFactory : IDesignTimeDbContextFactory<ArxisDbContext>
{
    public ArxisDbContext CreateDbContext(string[] args)
    {
        var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environmentName}.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=arxis.db";

        var optionsBuilder = new DbContextOptionsBuilder<ArxisDbContext>();
        optionsBuilder.UseSqlite(connectionString);

        return new ArxisDbContext(optionsBuilder.Options);
    }
}
