namespace ProjectOurs.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public Enums.UserRole Role { get; set; } = Enums.UserRole.Member;
    public Guid? FamilyId { get; set; }
    public DateTime? JoinedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Family? Family { get; set; }
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<GoalContribution> GoalContributions { get; set; } = new List<GoalContribution>();
}
