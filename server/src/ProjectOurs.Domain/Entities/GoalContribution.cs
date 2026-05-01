namespace ProjectOurs.Domain.Entities;

public class GoalContribution
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Goal Goal { get; set; } = null!;
    public User User { get; set; } = null!;
}
