using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class FamilyRepository(ApplicationDbContext db) : IFamilyRepository
{
    public async Task<Family> CreateWithAdminMembershipAsync(
        Guid userId,
        string name,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var familyId = Guid.NewGuid();

        var family = new Family
        {
            Id = familyId,
            Name = name,
            AdminId = userId,
            CreatedAt = now,
        };

        var membership = new FamilyMembership
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FamilyId = familyId,
            Role = FamilyRole.Admin,
            JoinedAt = now,
        };

        db.Families.Add(family);
        db.FamilyMemberships.Add(membership);
        await db.SaveChangesAsync(cancellationToken);

        return family;
    }

    public async Task<IReadOnlyList<FamilyMembership>> ListMembershipsByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default) =>
        await db.FamilyMemberships
            .AsNoTracking()
            .Include(x => x.Family)
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Family.Name)
            .ToListAsync(cancellationToken);

    public Task<FamilyMembership?> GetMembershipAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        db.FamilyMemberships
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.FamilyId == familyId, cancellationToken);

    public Task<bool> MembershipExistsAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        db.FamilyMemberships.AnyAsync(x => x.UserId == userId && x.FamilyId == familyId, cancellationToken);

    public Task<bool> InviteCodeExistsAsync(
        string inviteCode,
        CancellationToken cancellationToken = default) =>
        db.FamilyInvites.AnyAsync(x => x.InviteCode == inviteCode, cancellationToken);

    public Task<FamilyInvite?> GetInviteByCodeWithFamilyAsync(
        string inviteCode,
        CancellationToken cancellationToken = default) =>
        db.FamilyInvites
            .Include(x => x.Family)
            .FirstOrDefaultAsync(x => x.InviteCode == inviteCode, cancellationToken);

    public async Task AddInviteAsync(FamilyInvite invite, CancellationToken cancellationToken = default)
    {
        db.FamilyInvites.Add(invite);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateInviteAsync(FamilyInvite invite, CancellationToken cancellationToken = default)
    {
        db.FamilyInvites.Update(invite);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task AcceptInviteAndAddMembershipAsync(
        FamilyInvite invite,
        FamilyMembership membership,
        CancellationToken cancellationToken = default)
    {
        invite.Status = InviteStatus.Accepted;
        db.FamilyInvites.Update(invite);
        db.FamilyMemberships.Add(membership);
        await db.SaveChangesAsync(cancellationToken);
    }
}
