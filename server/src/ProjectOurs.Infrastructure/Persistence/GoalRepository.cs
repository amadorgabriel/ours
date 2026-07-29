using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class GoalRepository(ApplicationDbContext db) : IGoalRepository
{
    public async Task<IReadOnlyList<Goal>> ListActiveByFamilyIdAsync(
        Guid familyId,
        Guid? parentId = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.Goals
            .AsNoTracking()
            .Where(x => x.FamilyId == familyId && x.Status == GoalStatus.Active);

        if (parentId is not null)
        {
            query = query.Where(x => x.ParentId == parentId || x.ParentId == null);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Goal> AddAsync(Goal goal, CancellationToken cancellationToken = default)
    {
        db.Goals.Add(goal);
        await db.SaveChangesAsync(cancellationToken);

        return await db.Goals
            .AsNoTracking()
            .FirstAsync(x => x.Id == goal.Id, cancellationToken);
    }

    public async Task<Goal?> GetActiveByIdAndFamilyIdAsync(
        Guid goalId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        await db.Goals
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == goalId && x.FamilyId == familyId && x.Status == GoalStatus.Active,
                cancellationToken);

    public async Task<Goal?> GetByIdAndFamilyIdAsync(
        Guid goalId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        await db.Goals
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == goalId
                    && x.FamilyId == familyId
                    && x.Status != GoalStatus.Cancelled,
                cancellationToken);

    public async Task DeleteAsync(
        Goal goal,
        Guid familyId,
        IReadOnlyList<Guid> contributionIds,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            if (contributionIds.Count > 0)
            {
                var contributionIdSet = contributionIds
                    .Select(id => id.ToString())
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                var contributionActivities = await db.Activities
                    .Where(x => x.FamilyId == familyId && x.Type == ActivityType.Contribution)
                    .ToListAsync(cancellationToken);

                foreach (var activity in contributionActivities)
                {
                    if (TryGetContributionId(activity.Metadata, out var contributionId)
                        && contributionIdSet.Contains(contributionId))
                    {
                        db.Activities.Remove(activity);
                    }
                }
            }

            var tracked = await db.Goals.FirstAsync(x => x.Id == goal.Id, cancellationToken);
            db.Goals.Remove(tracked);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private static bool TryGetContributionId(string? metadata, out string contributionId)
    {
        contributionId = string.Empty;
        if (string.IsNullOrWhiteSpace(metadata))
        {
            return false;
        }

        try
        {
            using var doc = JsonDocument.Parse(metadata);
            if (doc.RootElement.TryGetProperty("contributionId", out var idProp)
                && idProp.GetString() is { } id)
            {
                contributionId = id;
                return true;
            }
        }
        catch (JsonException)
        {
            return false;
        }

        return false;
    }
}
