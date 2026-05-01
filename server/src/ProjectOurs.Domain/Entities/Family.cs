namespace ProjectOurs.Domain.Entities;

public class Family
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid AdminId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Admin { get; set; } = null!;
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<Parent> Parents { get; set; } = new List<Parent>();
    public ICollection<FamilyInvite> Invites { get; set; } = new List<FamilyInvite>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();
}
