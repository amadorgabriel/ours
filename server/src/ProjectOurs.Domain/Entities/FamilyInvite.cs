namespace ProjectOurs.Domain.Entities;

public class FamilyInvite
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public string? InvitedEmail { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Enums.InviteStatus Status { get; set; } = Enums.InviteStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Family Family { get; set; } = null!;
}
