using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IFamilyMembershipRepository
{
    Task<bool> IsUserMemberOfFamilyAsync(Guid userId, Guid familyId, CancellationToken cancellationToken = default);

    Task<FamilyMembership?> GetMembershipWithFamilyAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default);
}
