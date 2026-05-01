namespace ProjectOurs.Domain.Entities;

public class Goal
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public Enums.GoalStatus Status { get; set; } = Enums.GoalStatus.Active;
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
    public User Creator { get; set; } = null!;
    public ICollection<GoalContribution> Contributions { get; set; } = new List<GoalContribution>();
}
