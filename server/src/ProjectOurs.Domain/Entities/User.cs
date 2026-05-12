namespace ProjectOurs.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<FamilyMembership> Memberships { get; set; } = new List<FamilyMembership>();
    public ICollection<Family> AdminOfFamilies { get; set; } = new List<Family>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<Goal> CreatedGoals { get; set; } = new List<Goal>();
    public ICollection<GoalContribution> GoalContributions { get; set; } = new List<GoalContribution>();
}
