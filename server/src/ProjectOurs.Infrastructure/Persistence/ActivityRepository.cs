using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class ActivityRepository(ApplicationDbContext db) : IActivityRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

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
        Guid? parentId = null,
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

        if (parentId is not null)
        {
            query = query.Where(x => x.ParentId == parentId);
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

    public Task<Activity?> GetByIdAndFamilyIdAsync(
        Guid activityId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        db.Activities
            .Include(x => x.User)
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Id == activityId && x.FamilyId == familyId, cancellationToken);

    public async Task<Activity?> FindByContributionIdAsync(
        Guid contributionId,
        Guid familyId,
        CancellationToken cancellationToken = default)
    {
        var contributionIdString = contributionId.ToString();
        var activities = await db.Activities
            .Where(x => x.FamilyId == familyId && x.Type == Domain.Enums.ActivityType.Contribution)
            .ToListAsync(cancellationToken);

        return activities.FirstOrDefault(activity =>
        {
            if (string.IsNullOrWhiteSpace(activity.Metadata))
            {
                return false;
            }

            try
            {
                using var doc = JsonDocument.Parse(activity.Metadata);
                return doc.RootElement.TryGetProperty("contributionId", out var idProp)
                    && string.Equals(idProp.GetString(), contributionIdString, StringComparison.OrdinalIgnoreCase);
            }
            catch (JsonException)
            {
                return false;
            }
        });
    }

    public async Task DeleteAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        db.Activities.Remove(activity);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        db.Activities.Update(activity);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpsertViewAsync(
        Guid activityId,
        Guid userId,
        DateTimeOffset seenAt,
        CancellationToken cancellationToken = default)
    {
        var existing = await db.ActivityViews
            .FirstOrDefaultAsync(x => x.ActivityId == activityId && x.UserId == userId, cancellationToken);

        if (existing is null)
        {
            db.ActivityViews.Add(new ActivityView
            {
                Id = Guid.NewGuid(),
                ActivityId = activityId,
                UserId = userId,
                SeenAt = seenAt,
            });

            try
            {
                await db.SaveChangesAsync(cancellationToken);
                return;
            }
            catch (DbUpdateException)
            {
                db.ChangeTracker.Clear();
            }
        }

        var row = existing ?? await db.ActivityViews
            .FirstOrDefaultAsync(x => x.ActivityId == activityId && x.UserId == userId, cancellationToken);

        if (row is null)
        {
            return;
        }

        row.SeenAt = seenAt;
        db.ActivityViews.Update(row);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, IReadOnlyList<ActivityViewInfo>>> ListViewsByActivityIdsAsync(
        IEnumerable<Guid> activityIds,
        CancellationToken cancellationToken = default)
    {
        var ids = activityIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<Guid, IReadOnlyList<ActivityViewInfo>>();
        }

        var views = await db.ActivityViews
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => ids.Contains(x.ActivityId))
            .OrderBy(x => x.SeenAt)
            .ToListAsync(cancellationToken);

        return views
            .GroupBy(x => x.ActivityId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<ActivityViewInfo>)g
                    .Select(v => new ActivityViewInfo(v.UserId, v.User.Name, v.SeenAt))
                    .ToList());
    }

    public async Task<int> CountUnreadAsync(
        Guid familyId,
        Guid userId,
        Guid? parentId = null,
        CancellationToken cancellationToken = default)
    {
        var viewedActivityIds = db.ActivityViews
            .Where(x => x.UserId == userId)
            .Select(x => x.ActivityId);

        var query = db.Activities
            .Where(x => x.FamilyId == familyId && !viewedActivityIds.Contains(x.Id));

        if (parentId.HasValue)
        {
            query = query.Where(x => x.ParentId == parentId.Value);
        }

        return await query.CountAsync(cancellationToken);
    }
}
