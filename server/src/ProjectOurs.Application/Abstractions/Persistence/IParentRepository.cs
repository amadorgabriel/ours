using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IParentRepository
{
    Task<IReadOnlyList<Parent>> ListByFamilyIdAsync(
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<Parent> AddAsync(Parent parent, CancellationToken cancellationToken = default);

    Task<Parent?> GetByIdAndFamilyIdAsync(
        Guid parentId,
        Guid familyId,
        CancellationToken cancellationToken = default);

    Task<Parent> UpdateAsync(Parent parent, CancellationToken cancellationToken = default);
}
