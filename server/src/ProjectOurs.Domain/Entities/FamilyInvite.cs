using ProjectOurs.Domain.Enums;

namespace ProjectOurs.Domain.Entities;

public class FamilyInvite
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public string? InvitedEmail { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public InviteStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Family Family { get; set; } = null!;
}
