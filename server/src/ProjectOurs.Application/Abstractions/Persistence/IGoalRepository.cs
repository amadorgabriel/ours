using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IGoalRepository
{
    Task<IReadOnlyList<Goal>> ListActiveByFamilyIdAsync(
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<Goal> AddAsync(Goal goal, CancellationToken cancellationToken = default);
}
