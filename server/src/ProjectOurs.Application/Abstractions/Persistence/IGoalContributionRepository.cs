using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IGoalContributionRepository
{
    Task<IReadOnlyList<GoalContribution>> ListByGoalIdAsync(
        Guid goalId,
        CancellationToken cancellationToken = default);

    Task<GoalContribution> AddWithGoalUpdateAsync(
        GoalContribution contribution,
        CancellationToken cancellationToken = default);
}
