using Microsoft.EntityFrameworkCore;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Data;

public class ProjectOursDbContext : DbContext
{
    public ProjectOursDbContext(DbContextOptions<ProjectOursDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Family> Families { get; set; }
    public DbSet<FamilyInvite> FamilyInvites { get; set; }
    public DbSet<Parent> Parents { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Goal> Goals { get; set; }
    public DbSet<GoalContribution> GoalContributions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Picture).HasMaxLength(500);
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.FamilyId);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Members)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Family Configuration
        modelBuilder.Entity<Family>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.AdminId).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasOne(e => e.Admin)
                .WithOne()
                .HasForeignKey<Family>(e => e.AdminId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // FamilyInvite Configuration
        modelBuilder.Entity<FamilyInvite>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InviteCode).HasMaxLength(6).IsRequired();
            entity.Property(e => e.InvitedEmail).HasMaxLength(255);
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.InviteCode).IsUnique();
            entity.HasIndex(e => e.FamilyId);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Invites)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Parent Configuration
        modelBuilder.Entity<Parent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.MedicalInfo).HasColumnType("jsonb");
            entity.Property(e => e.EmergencyBriefing).HasColumnType("text");

            entity.HasIndex(e => e.FamilyId);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Parents)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Activity Configuration
        modelBuilder.Entity<Activity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.Metadata).HasColumnType("jsonb");
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.FamilyId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Activities)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Activities)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Parent)
                .WithMany(p => p.Activities)
                .HasForeignKey(e => e.ParentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Goal Configuration
        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.TargetAmount).HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.CurrentAmount).HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.FamilyId);
            entity.HasIndex(e => e.Status);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Goals)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // GoalContribution Configuration
        modelBuilder.Entity<GoalContribution>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.GoalId);
            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.Goal)
                .WithMany(g => g.Contributions)
                .HasForeignKey(e => e.GoalId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.GoalContributions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
