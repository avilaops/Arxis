using Microsoft.EntityFrameworkCore;
using Arxis.Domain.Entities;

namespace Arxis.Infrastructure.Data;

/// <summary>
/// Main database context for ARXIS
/// </summary>
public class ArxisDbContext : DbContext
{
    public ArxisDbContext(DbContextOptions<ArxisDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<ProjectUser> ProjectUsers { get; set; }
    public DbSet<WorkTask> WorkTasks { get; set; }
    public DbSet<Issue> Issues { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

                // Configure Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.TotalBudget).HasPrecision(18, 2);
            entity.HasIndex(e => e.TenantId);
        });

        // Configure User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.TenantId);
        });

        // Configure ProjectUser (many-to-many)
        modelBuilder.Entity<ProjectUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Project)
                .WithMany(p => p.ProjectUsers)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User)
                .WithMany(u => u.ProjectUsers)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.ProjectId, e.UserId }).IsUnique();
        });

        // Configure WorkTask
        modelBuilder.Entity<WorkTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.AssignedToUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.ParentTask)
                .WithMany(t => t.SubTasks)
                .HasForeignKey(e => e.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.OwnsMany(e => e.Checklist);
        });

        // Configure Issue
        modelBuilder.Entity<Issue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.AssignedToUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.ReportedByUser)
                .WithMany()
                .HasForeignKey(e => e.ReportedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}

