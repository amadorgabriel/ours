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
        CancellationToken cancellationToken = default);

    Task<bool> ParentBelongsToFamilyAsync(
        Guid parentId,
        Guid familyId,
        CancellationToken cancellationToken = default);
}
