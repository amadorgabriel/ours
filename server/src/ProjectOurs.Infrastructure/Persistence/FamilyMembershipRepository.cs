using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class FamilyMembershipRepository(ApplicationDbContext db) : IFamilyMembershipRepository
{
    public Task<bool> IsUserMemberOfFamilyAsync(Guid userId, Guid familyId, CancellationToken cancellationToken = default) =>
        db.FamilyMemberships.AsNoTracking().AnyAsync(
            m => m.UserId == userId && m.FamilyId == familyId,
            cancellationToken);

    public Task<FamilyMembership?> GetMembershipWithFamilyAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        db.FamilyMemberships.AsNoTracking()
            .Include(m => m.Family)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.FamilyId == familyId, cancellationToken);
}
