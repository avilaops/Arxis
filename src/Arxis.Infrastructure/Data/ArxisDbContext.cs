using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
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
    public DbSet<IssueComment> IssueComments { get; set; }
    public DbSet<IssueAttachment> IssueAttachments { get; set; }
    public DbSet<IssueLink> IssueLinks { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<TaskWorkflow> TaskWorkflows { get; set; }
    public DbSet<TaskWorkflowStep> TaskWorkflowSteps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var stringListConverter = new ValueConverter<List<string>, string>(
            v => SerializeStringList(v),
            v => DeserializeStringList(v));

        var stringListComparer = new ValueComparer<List<string>>(
            (left, right) => (left == null && right == null) || (left != null && right != null && left.SequenceEqual(right)),
            list => list == null ? 0 : list.Aggregate(0, (current, item) => HashCode.Combine(current, item == null ? 0 : item.GetHashCode())),
            list => list == null ? new List<string>() : list.ToList());

        var stringComparer = new ValueComparer<string>(
            (left, right) => left == right,
            value => value == null ? 0 : value.GetHashCode(),
            value => value);

                // Configure Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.TotalBudget).HasPrecision(18, 2);
            entity.HasIndex(e => e.TenantId);
            var tagsProperty = entity.Property(e => e.Tags)
                .HasConversion(stringListConverter)
                .HasColumnType("TEXT");
            tagsProperty.Metadata.SetValueComparer(stringListComparer);
            tagsProperty.Metadata.SetProviderValueComparer(stringComparer);
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
            entity.Property(e => e.Squad).HasMaxLength(160);
            entity.Property(e => e.ProgressPercent).HasDefaultValue(0);
            entity.Property(e => e.AssigneeName).HasMaxLength(160);
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
            var workTaskTagsProperty = entity.Property(e => e.Tags)
                .HasConversion(stringListConverter)
                .HasColumnType("TEXT");
            workTaskTagsProperty.Metadata.SetValueComparer(stringListComparer);
            workTaskTagsProperty.Metadata.SetProviderValueComparer(stringComparer);
            entity.OwnsMany(e => e.Checklist, checklist =>
            {
                checklist.ToTable("WorkTaskChecklistItems");
                checklist.WithOwner().HasForeignKey("WorkTaskId");
                checklist.Property<int>("Id");
                checklist.HasKey("Id");
                checklist.Property(c => c.Title).IsRequired().HasMaxLength(200);
                checklist.Property(c => c.IsCompleted).HasDefaultValue(false);
            });
        });

        modelBuilder.Entity<TaskWorkflow>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(e => e.Steps)
                .WithOne(step => step.TaskWorkflow)
                .HasForeignKey(step => step.TaskWorkflowId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskWorkflowStep>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.OwnerRole).HasMaxLength(200);
            entity.Property(e => e.EntryCriteria).HasMaxLength(1000);
            entity.Property(e => e.ExitCriteria).HasMaxLength(1000);
            entity.Property(e => e.OrderIndex).IsRequired();
        });

        // Configure Issue
        modelBuilder.Entity<Issue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.ReferenceCode).IsRequired().HasMaxLength(40);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.Discipline).HasMaxLength(120);
            entity.Property(e => e.RfiQuestion).HasMaxLength(2000);
            entity.Property(e => e.RfiAnswer).HasMaxLength(2000);
            entity.Property(e => e.ExternalReference).HasMaxLength(200);
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
            entity.HasOne(e => e.RespondedByUser)
                .WithMany()
                .HasForeignKey(e => e.RespondedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.WorkTask)
                .WithMany()
                .HasForeignKey(e => e.WorkTaskId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => new { e.ProjectId, e.ReferenceCode }).IsUnique();
        });

        modelBuilder.Entity<IssueComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(4000);
            entity.HasOne(e => e.Issue)
                .WithMany(i => i.Comments)
                .HasForeignKey(e => e.IssueId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Author)
                .WithMany()
                .HasForeignKey(e => e.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IssueAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(260);
            entity.Property(e => e.FileUrl).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ContentType).HasMaxLength(120);
            entity.HasOne(e => e.Issue)
                .WithMany(i => i.Attachments)
                .HasForeignKey(e => e.IssueId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Comment)
                .WithMany(c => c.Attachments)
                .HasForeignKey(e => e.CommentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.UploadedByUser)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IssueLink>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Label).HasMaxLength(200);
            entity.Property(e => e.ExternalReference).HasMaxLength(200);
            entity.Property(e => e.Metadata).HasMaxLength(2000);
            entity.HasOne(e => e.Issue)
                .WithMany(i => i.Links)
                .HasForeignKey(e => e.IssueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Document
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(260);
            entity.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(260);
            entity.Property(e => e.FileExtension).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.StoragePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.FolderPath).HasMaxLength(500);
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.WorkTask)
                .WithMany()
                .HasForeignKey(e => e.WorkTaskId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Issue)
                .WithMany()
                .HasForeignKey(e => e.IssueId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.UploadedByUser)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.ParentDocument)
                .WithMany(d => d.Versions)
                .HasForeignKey(e => e.ParentDocumentId)
                .OnDelete(DeleteBehavior.Restrict);
            var documentTagsProperty = entity.Property(e => e.Tags)
                .HasConversion(stringListConverter)
                .HasColumnType("TEXT");
            documentTagsProperty.Metadata.SetValueComparer(stringListComparer);
            documentTagsProperty.Metadata.SetProviderValueComparer(stringComparer);
            entity.HasIndex(e => new { e.ProjectId, e.FileName });
            entity.HasIndex(e => e.Category);
        });
    }

        private static string SerializeStringList(List<string> value)
            => JsonSerializer.Serialize(value ?? new List<string>(), default(JsonSerializerOptions));

        private static List<string> DeserializeStringList(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return new List<string>();
            }

            return JsonSerializer.Deserialize<List<string>>(value, default(JsonSerializerOptions)) ?? new List<string>();
        }
}

