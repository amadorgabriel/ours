using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IGoalRepository
{
    Task<IReadOnlyList<Goal>> ListActiveByFamilyIdAsync(
        Guid familyId,
        Guid? parentId = null,
        CancellationToken cancellationToken = default);

    Task<Goal> AddAsync(Goal goal, CancellationToken cancellationToken = default);

    Task<Goal?> GetActiveByIdAndFamilyIdAsync(
        Guid goalId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<Goal?> GetByIdAndFamilyIdAsync(
        Guid goalId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Goal goal,
        Guid familyId,
        IReadOnlyList<Guid> contributionIds,
        CancellationToken cancellationToken = default);
}
