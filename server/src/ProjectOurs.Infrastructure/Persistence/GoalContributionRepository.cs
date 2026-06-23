using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class GoalContributionRepository(ApplicationDbContext db) : IGoalContributionRepository
{
    public async Task<IReadOnlyList<GoalContribution>> ListByGoalIdAsync(
        Guid goalId,
        CancellationToken cancellationToken = default) =>
        await db.GoalContributions
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.GoalId == goalId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<GoalContribution> AddWithGoalUpdateAsync(
        GoalContribution contribution,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var goal = await db.Goals
                .FirstAsync(x => x.Id == contribution.GoalId, cancellationToken);

            goal.CurrentAmount += contribution.Amount;
            db.GoalContributions.Add(contribution);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return await db.GoalContributions
                .AsNoTracking()
                .Include(x => x.User)
                .FirstAsync(x => x.Id == contribution.Id, cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public Task<GoalContribution?> GetByIdAndGoalIdAsync(
        Guid contributionId,
        Guid goalId,
        CancellationToken cancellationToken = default) =>
        db.GoalContributions
            .Include(x => x.User)
            .Include(x => x.Goal)
            .FirstOrDefaultAsync(x => x.Id == contributionId && x.GoalId == goalId, cancellationToken);

    public async Task<GoalContribution> UpdateWithGoalAdjustAsync(
        GoalContribution contribution,
        decimal previousAmount,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var goal = await db.Goals.FirstAsync(x => x.Id == contribution.GoalId, cancellationToken);
            goal.CurrentAmount = goal.CurrentAmount - previousAmount + contribution.Amount;
            db.GoalContributions.Update(contribution);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return await db.GoalContributions
                .AsNoTracking()
                .Include(x => x.User)
                .FirstAsync(x => x.Id == contribution.Id, cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task DeleteWithGoalUpdateAsync(
        GoalContribution contribution,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var goal = await db.Goals.FirstAsync(x => x.Id == contribution.GoalId, cancellationToken);
            goal.CurrentAmount -= contribution.Amount;
            db.GoalContributions.Remove(contribution);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
