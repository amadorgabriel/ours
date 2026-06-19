using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class ParentRepository(ApplicationDbContext db) : IParentRepository
{
    public async Task<IReadOnlyList<Parent>> ListByFamilyIdAsync(
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        await db.Parents
            .AsNoTracking()
            .Where(x => x.FamilyId == familyId)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<Parent> AddAsync(Parent parent, CancellationToken cancellationToken = default)
    {
        db.Parents.Add(parent);
        await db.SaveChangesAsync(cancellationToken);

        return await db.Parents
            .AsNoTracking()
            .FirstAsync(x => x.Id == parent.Id, cancellationToken);
    }

    public async Task<Parent?> GetByIdAndFamilyIdAsync(
        Guid parentId,
        Guid familyId,
        CancellationToken cancellationToken = default) =>
        await db.Parents
            .FirstOrDefaultAsync(
                x => x.Id == parentId && x.FamilyId == familyId,
                cancellationToken);

    public async Task<Parent> UpdateAsync(Parent parent, CancellationToken cancellationToken = default)
    {
        db.Parents.Update(parent);
        await db.SaveChangesAsync(cancellationToken);

        return await db.Parents
            .AsNoTracking()
            .FirstAsync(x => x.Id == parent.Id, cancellationToken);
    }
}
