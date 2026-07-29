using ProjectOurs.Domain.Enums;

namespace ProjectOurs.Domain.Entities;

public class FamilyMembership
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid FamilyId { get; set; }
    public FamilyRole Role { get; set; }
    public DateTimeOffset JoinedAt { get; set; }

    public User User { get; set; } = null!;
    public Family Family { get; set; } = null!;
}
