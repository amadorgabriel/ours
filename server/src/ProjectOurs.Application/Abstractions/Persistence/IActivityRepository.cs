using ProjectOurs.Domain.Entities;
using ActivityEntity = ProjectOurs.Domain.Entities.Activity;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IActivityRepository
{
    Task<ActivityEntity> AddAsync(ActivityEntity activity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ActivityEntity>> ListByFamilyIdAsync(
        Guid familyId,
        int limit,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        Guid? parentId = null,
        CancellationToken cancellationToken = default);

    Task<bool> ParentBelongsToFamilyAsync(
        Guid parentId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<ActivityEntity?> GetByIdAndFamilyIdAsync(
        Guid activityId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<ActivityEntity?> FindByContributionIdAsync(
        Guid contributionId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(ActivityEntity activity, CancellationToken cancellationToken = default);

    Task UpdateAsync(ActivityEntity activity, CancellationToken cancellationToken = default);

    Task UpsertViewAsync(
        Guid activityId,
        Guid userId,
        DateTimeOffset seenAt,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<Guid, IReadOnlyList<ActivityViewInfo>>> ListViewsByActivityIdsAsync(
        IEnumerable<Guid> activityIds,
        CancellationToken cancellationToken = default);

    Task<int> CountUnreadAsync(
        Guid familyId,
        Guid userId,
        Guid? parentId = null,
        CancellationToken cancellationToken = default);
}

public sealed record ActivityViewInfo(Guid UserId, string UserName, DateTimeOffset SeenAt, string? UserPicture = null);
