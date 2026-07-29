using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<User?> GetByEmailWithMembershipsAsync(string email, CancellationToken cancellationToken = default) =>
        db.Users
            .AsNoTracking()
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Family)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

    public Task<User?> GetByIdWithMembershipsAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.Users
            .AsNoTracking()
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Family)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateProfileAsync(
        Guid id,
        string name,
        string? picture,
        CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
        {
            return;
        }

        user.Name = name;
        user.Picture = picture;
        await db.SaveChangesAsync(cancellationToken);
    }
}
