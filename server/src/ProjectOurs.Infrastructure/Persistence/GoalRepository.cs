using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class GoalRepository(ApplicationDbContext db) : IGoalRepository
{
    public async Task<IReadOnlyList<Goal>> ListActiveByFamilyIdAsync(
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        await db.Goals
            .AsNoTracking()
            .Where(x => x.FamilyId == familyId && x.Status == GoalStatus.Active)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

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
}
