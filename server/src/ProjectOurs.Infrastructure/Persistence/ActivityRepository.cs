using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class ActivityRepository(ApplicationDbContext db) : IActivityRepository
{
    public async Task<Activity> AddAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        db.Activities.Add(activity);
        await db.SaveChangesAsync(cancellationToken);

        return await db.Activities
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Parent)
            .FirstAsync(x => x.Id == activity.Id, cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> ListByFamilyIdAsync(
        Guid familyId,
        int limit,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        var query = db.Activities
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Parent)
            .Where(x => x.FamilyId == familyId);

        if (from is not null)
        {
            query = query.Where(x => x.CreatedAt >= from);
        }

        if (to is not null)
        {
            query = query.Where(x => x.CreatedAt <= to);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ParentBelongsToFamilyAsync(
        Guid parentId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        db.Parents.AsNoTracking().AnyAsync(
            x => x.Id == parentId && x.FamilyId == familyId,
            cancellationToken);
}
