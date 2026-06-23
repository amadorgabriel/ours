namespace ProjectOurs.Domain.Entities;

public class ActivityView
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset SeenAt { get; set; }

    public Activity Activity { get; set; } = null!;
    public User User { get; set; } = null!;
}
