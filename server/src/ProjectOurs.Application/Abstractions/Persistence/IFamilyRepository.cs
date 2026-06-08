using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IFamilyRepository
{
    Task<Family> CreateWithAdminMembershipAsync(
        Guid userId,
        string name,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FamilyMembership>> ListMembershipsByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<FamilyMembership?> GetMembershipAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<bool> MembershipExistsAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<bool> InviteCodeExistsAsync(
        string inviteCode,
        CancellationToken cancellationToken = default);

    Task<FamilyInvite?> GetInviteByCodeWithFamilyAsync(
        string inviteCode,
        CancellationToken cancellationToken = default);

    Task AddInviteAsync(FamilyInvite invite, CancellationToken cancellationToken = default);

    Task UpdateInviteAsync(FamilyInvite invite, CancellationToken cancellationToken = default);

    Task AcceptInviteAndAddMembershipAsync(
        FamilyInvite invite,
        FamilyMembership membership,
        CancellationToken cancellationToken = default);
}
