namespace ProjectOurs.Domain.Entities;

public class Family
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid AdminId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public User Admin { get; set; } = null!;
    public ICollection<FamilyMembership> Memberships { get; set; } = new List<FamilyMembership>();
    public ICollection<FamilyInvite> Invites { get; set; } = new List<FamilyInvite>();
    public ICollection<Parent> Parents { get; set; } = new List<Parent>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();
}
