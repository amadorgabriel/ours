using Microsoft.EntityFrameworkCore;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<FamilyMembership> FamilyMemberships => Set<FamilyMembership>();
    public DbSet<FamilyInvite> FamilyInvites => Set<FamilyInvite>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<GoalContribution> GoalContributions => Set<GoalContribution>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).HasMaxLength(255).IsRequired();
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.Picture).HasMaxLength(500);
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Family>(e =>
        {
            e.ToTable("families");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.HasOne(x => x.Admin)
                .WithMany(x => x.AdminOfFamilies)
                .HasForeignKey(x => x.AdminId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<FamilyMembership>(e =>
        {
            e.ToTable("family_memberships");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UserId, x.FamilyId }).IsUnique();
            e.HasOne(x => x.User)
                .WithMany(x => x.Memberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Family)
                .WithMany(x => x.Memberships)
                .HasForeignKey(x => x.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FamilyInvite>(e =>
        {
            e.ToTable("family_invites");
            e.HasKey(x => x.Id);
            e.Property(x => x.InviteCode).HasMaxLength(6).IsRequired();
            e.Property(x => x.InvitedEmail).HasMaxLength(255);
            e.HasIndex(x => x.InviteCode).IsUnique();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.Family)
                .WithMany(x => x.Invites)
                .HasForeignKey(x => x.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Parent>(e =>
        {
            e.ToTable("parents");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.MedicalInfo).HasColumnType("jsonb");
            e.Property(x => x.EmergencyBriefing);
            e.HasOne(x => x.Family)
                .WithMany(x => x.Parents)
                .HasForeignKey(x => x.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Activity>(e =>
        {
            e.ToTable("activities");
            e.HasKey(x => x.Id);
            e.Property(x => x.Type).HasConversion<string>();
            e.Property(x => x.Metadata).HasColumnType("jsonb");
            e.HasOne(x => x.Family)
                .WithMany(x => x.Activities)
                .HasForeignKey(x => x.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.User)
                .WithMany(x => x.Activities)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Parent)
                .WithMany(x => x.Activities)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Goal>(e =>
        {
            e.ToTable("goals");
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(100).IsRequired();
            e.Property(x => x.TargetAmount).HasPrecision(10, 2);
            e.Property(x => x.CurrentAmount).HasPrecision(10, 2);
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.Family)
                .WithMany(x => x.Goals)
                .HasForeignKey(x => x.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Creator)
                .WithMany(x => x.CreatedGoals)
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<GoalContribution>(e =>
        {
            e.ToTable("goal_contributions");
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(10, 2);
            e.HasOne(x => x.Goal)
                .WithMany(x => x.Contributions)
                .HasForeignKey(x => x.GoalId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.User)
                .WithMany(x => x.GoalContributions)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
