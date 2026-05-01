namespace ProjectOurs.Domain.Entities;

public class Activity
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public Guid UserId { get; set; }
    public Guid? ParentId { get; set; }
    public Enums.ActivityType Type { get; set; }
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Family Family { get; set; } = null!;
    public User User { get; set; } = null!;
    public Parent? Parent { get; set; }
}
